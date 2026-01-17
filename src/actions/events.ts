/**
 * Server Actions for Events
 * CRUD operations for calendar events
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { createEventSchema, updateEventSchema } from '@/utils/validations';
import type { CreateEventInput, UpdateEventInput } from '@/utils/validations';
import type { ApiResponse, EventWithBooking } from '@/types/database';
import { requireAuth, getCurrentUser } from '@/utils/auth';

export async function createEvent(
  input: CreateEventInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Validate input
    const validation = createEventSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    // Check for overlaps using DB function
    const { data: hasOverlap } = await supabase.rpc('check_event_overlap', {
      p_start_time: validation.data.start_time,
      p_end_time: validation.data.end_time,
    });

    if (hasOverlap === false) {
      return {
        success: false,
        error: 'El horario se solapa con otro evento existente',
      };
    }

    // Create event
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...validation.data,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Error al crear el evento',
      };
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success: true,
      data: { id: data.id },
    };
  } catch (error) {
    console.error('Unexpected error creating event:', error);
    return {
      success: false,
      error: 'Error inesperado al crear el evento',
    };
  }
}

export async function updateEvent(
  input: UpdateEventInput
): Promise<ApiResponse<void>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Validate input
    const validation = updateEventSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const { id, ...updateData } = validation.data;

    // Check for overlaps (excluding current event)
    if (updateData.start_time && updateData.end_time) {
      const { data: hasOverlap } = await supabase.rpc('check_event_overlap', {
        p_start_time: updateData.start_time,
        p_end_time: updateData.end_time,
        p_event_id: id,
      });

      if (hasOverlap === false) {
        return {
          success: false,
          error: 'El horario se solapa con otro evento existente',
        };
      }
    }

    // Update event
    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: 'Error al actualizar el evento',
      };
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating event:', error);
    return {
      success: false,
      error: 'Error inesperado al actualizar el evento',
    };
  }
}

export async function deleteEvent(id: string): Promise<ApiResponse<void>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        error: 'Error al eliminar el evento',
      };
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting event:', error);
    return {
      success: false,
      error: 'Error inesperado al eliminar el evento',
    };
  }
}

export async function getUpcomingEvents(): Promise<ApiResponse<EventWithBooking[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado' };
    }
    
    // Use admin client to get all events (including those created by service role)
    let supabase;
    try {
      supabase = createAdminSupabaseClient();
    } catch (e) {
      // Fallback to regular client if service role key not available
      supabase = await createServerSupabaseClient();
    }

    const now = new Date().toISOString();

    // Get upcoming events with their bookings
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        event_type,
        is_public,
        created_at,
        bookings (
          id,
          name,
          email,
          phone,
          notes,
          status
        )
      `)
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching events:', error);
      return {
        success: false,
        error: 'Error al obtener los eventos',
      };
    }

    // Transform data to match EventWithBooking type
    const transformedEvents: EventWithBooking[] = (events || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      event_type: event.event_type,
      is_public: event.is_public,
      created_by: event.created_by,
      created_at: event.created_at,
      updated_at: event.updated_at,
      booking: event.bookings?.[0] || null,
    }));

    return {
      success: true,
      data: transformedEvents,
    };
  } catch (error) {
    console.error('Unexpected error fetching events:', error);
    return {
      success: false,
      error: 'Error inesperado al obtener los eventos',
    };
  }
}
