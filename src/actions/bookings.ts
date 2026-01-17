/**
 * Server Actions for Bookings
 * Handle visitor reservations
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { createBookingSchema } from '@/utils/validations';
import type { CreateBookingInput } from '@/utils/validations';
import type { ApiResponse } from '@/types/database';

export async function createBooking(
  input: CreateBookingInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    // Use admin client to bypass RLS for public booking creation
    let supabase;
    try {
      supabase = createAdminSupabaseClient();
    } catch (adminError) {
      console.error('Error creating admin client:', adminError);
      // Fallback to server client
      supabase = await createServerSupabaseClient();
    }

    // Validate input
    const validation = createBookingSchema.safeParse(input);
    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const slotStart = new Date(validation.data.slot_start);

    // Check if slot is in the future
    if (slotStart < new Date()) {
      return {
        success: false,
        error: 'No se puede reservar un horario pasado',
      };
    }

    // Check if slot is already booked (event exists for this time)
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id')
      .eq('start_time', validation.data.slot_start)
      .eq('end_time', validation.data.slot_end)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing event:', checkError);
      return {
        success: false,
        error: 'Error al verificar disponibilidad',
      };
    }

    if (existingEvent) {
      return {
        success: false,
        error: 'Este horario ya fue reservado',
      };
    }

    // Create the event first
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        title: `Reserva: ${validation.data.name}`,
        description: validation.data.notes || null,
        start_time: validation.data.slot_start,
        end_time: validation.data.slot_end,
        is_public: true,
        event_type: 'booking',
      })
      .select('id')
      .single();

    if (eventError || !eventData) {
      console.error('Error creating event:', eventError);
      return {
        success: false,
        error: `Error al crear el evento: ${eventError?.message || 'Unknown error'}`,
      };
    }

    // Create booking linked to the event
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        event_id: eventData.id,
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || null,
        notes: validation.data.notes || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      // Rollback: delete the event we just created
      await supabase.from('events').delete().eq('id', eventData.id);
      return {
        success: false,
        error: `Error al crear la reserva: ${error.message}`,
      };
    }

    revalidatePath('/');
    revalidatePath('/appointment');

    return {
      success: true,
      data: { id: data.id },
    };
  } catch (error) {
    console.error('Unexpected error creating booking:', error);
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function cancelBooking(id: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: 'Error al cancelar la reserva',
      };
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error cancelling booking:', error);
    return {
      success: false,
      error: 'Error inesperado al cancelar la reserva',
    };
  }
}
