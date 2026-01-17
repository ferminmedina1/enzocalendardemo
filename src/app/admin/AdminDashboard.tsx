/**
 * Admin Dashboard Component
 * Client component for admin event management
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createEvent, updateEvent, deleteEvent, getUpcomingEvents } from '@/actions/events';
import type { EventWithBooking } from '@/types/database';
import CalendarSettingsPanel from '@/components/CalendarSettingsPanel';
import toast from 'react-hot-toast';

type Tab = 'events' | 'settings';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventWithBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('events');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getUpcomingEvents();
      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        toast.error(result.error || 'Error al cargar los eventos');
      }
    } catch (error) {
      toast.error('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  const handleCreateEvent = async (data: any) => {
    const result = await createEvent(data);
    if (result.success) {
      toast.success('Evento creado exitosamente');
      setShowCreateForm(false);
      loadEvents();
    } else {
      toast.error(result.error || 'Error al crear el evento');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    
    const result = await deleteEvent(eventId);
    if (result.success) {
      toast.success('Evento eliminado');
      loadEvents();
    } else {
      toast.error(result.error || 'Error al eliminar el evento');
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      time: date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 relative">
      {/* Fondo decorativo animado */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-300/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="relative bg-white/40 backdrop-blur-2xl border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/appointment')}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white/50 backdrop-blur-md border border-white/50 rounded-xl hover:bg-white/70 hover:border-blue-300/50 transition-all duration-300 active:scale-95"
              >
                Ver como visitante
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 text-sm font-medium text-white bg-linear-to-br from-red-400/85 via-red-400/75 to-orange-400/65 backdrop-blur-xl border border-red-300/70 rounded-xl hover:shadow-lg hover:shadow-red-400/20 transition-all duration-300 active:scale-95"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Tabs with glassmorphism */}
        <div className="flex gap-1 mb-8 bg-white/30 backdrop-blur-md rounded-2xl p-1.5 border border-white/40 w-fit">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
              activeTab === 'events'
                ? 'bg-white/60 backdrop-blur-md text-blue-600 border border-white/50 shadow-lg shadow-blue-400/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Eventos
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-white/60 backdrop-blur-md text-blue-600 border border-white/50 shadow-lg shadow-blue-400/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'settings' ? (
          <CalendarSettingsPanel />
        ) : (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-br from-blue-400/85 via-blue-400/75 to-cyan-400/65 backdrop-blur-xl border border-blue-300/70 rounded-xl hover:shadow-lg hover:shadow-blue-400/20 transition-all duration-300 active:scale-95"
            >
              + Crear evento
            </button>
            <button
              onClick={loadEvents}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white/50 backdrop-blur-md border border-white/50 rounded-xl hover:bg-white/70 hover:border-blue-300/50 transition-all duration-300 disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg shadow-blue-900/5">
              <div className="absolute inset-0 bg-linear-to-br from-white/60 via-white/40 to-white/20 pointer-events-none rounded-2xl" />
              <p className="relative text-sm text-slate-600 font-medium">Total eventos</p>
              <p className="relative text-3xl font-bold text-slate-900 mt-2">{events.length}</p>
            </div>
            <div className="relative bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg shadow-green-900/5">
              <div className="absolute inset-0 bg-linear-to-br from-white/60 via-white/40 to-white/20 pointer-events-none rounded-2xl" />
              <p className="relative text-sm text-slate-600 font-medium">Con reserva</p>
              <p className="relative text-3xl font-bold text-green-600 mt-2">
                {events.filter((e) => e.booking).length}
              </p>
            </div>
            <div className="relative bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg shadow-blue-900/5">
              <div className="absolute inset-0 bg-linear-to-br from-white/60 via-white/40 to-white/20 pointer-events-none rounded-2xl" />
              <p className="relative text-sm text-slate-600 font-medium">Sin reserva</p>
              <p className="relative text-3xl font-bold text-blue-600 mt-2">
                {events.filter((e) => !e.booking).length}
              </p>
            </div>
          </div>

          {/* Events List */}
          <div className="relative bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg shadow-blue-900/10 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-white/60 via-white/40 to-white/20 pointer-events-none rounded-2xl" />
            
            <div className="relative px-6 py-6 border-b border-white/30">
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                Próximos eventos
              </h2>
            </div>
            
            {loading ? (
              <div className="relative p-12 text-center text-slate-500">
                <div className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mb-2" />
                <p>Cargando eventos...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="relative p-12 text-center text-slate-500">
                <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-medium">No hay eventos próximos</p>
                <p className="text-sm mt-1">Los eventos aparecerán aquí cuando se creen reservas</p>
              </div>
            ) : (
              <div className="relative divide-y divide-white/20">
                {events.map((event) => {
                  const start = formatDateTime(event.start_time);
                  const end = formatDateTime(event.end_time);
                  
                  return (
                    <div key={event.id} className="p-6 hover:bg-white/30 transition-colors duration-300 border-t border-white/10">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Date & Time */}
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 w-16 text-center p-3 bg-white/30 backdrop-blur-md rounded-xl border border-white/40">
                            <div className="text-xs font-semibold text-slate-600 uppercase">{start.date.split(' ')[0]}</div>
                            <div className="text-2xl font-bold text-slate-900">{start.date.split(' ')[1]}</div>
                            <div className="text-xs text-slate-500">{start.date.split(' ')[2]}</div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-blue-600">
                                {start.time} - {end.time}
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
                                event.event_type === 'booking' 
                                  ? 'bg-green-400/30 text-green-700 border-green-300/50' 
                                  : 'bg-slate-300/30 text-slate-700 border-slate-300/50'
                              }`}>
                                {event.event_type === 'booking' ? 'Reserva' : event.event_type}
                              </span>
                            </div>
                            
                            <h3 className="text-base font-semibold text-slate-900 truncate">
                              {event.title}
                            </h3>
                            
                            {event.booking && (
                              <div className="mt-3 text-sm text-slate-700 space-y-2">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>{event.booking.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <a href={`mailto:${event.booking.email}`} className="text-blue-600 hover:underline">
                                    {event.booking.email}
                                  </a>
                                </div>
                                {event.booking.phone && (
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a href={`tel:${event.booking.phone}`} className="hover:underline">
                                      {event.booking.phone}
                                    </a>
                                  </div>
                                )}
                                {event.booking.notes && (
                                  <div className="flex items-start gap-2 mt-3 p-3 bg-white/40 backdrop-blur-md rounded-lg border border-white/30">
                                    <svg className="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <span className="text-slate-600">{event.booking.notes}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Right: Actions */}
                        <div className="shrink-0">
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-400/20 backdrop-blur-md border border-transparent hover:border-red-300/50 rounded-lg transition-all duration-300"
                            title="Eliminar evento"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* Create Event Form (placeholder) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative bg-white/50 backdrop-blur-2xl rounded-2xl max-w-md w-full p-8 border border-white/60 shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-linear-to-br from-white/70 via-white/50 to-white/30 pointer-events-none rounded-2xl" />
            <h3 className="relative text-xl font-semibold text-slate-900 mb-3">
              Crear nuevo evento
            </h3>
            <p className="relative text-sm text-slate-600 mb-6">
              Implementá el formulario de creación de eventos aquí
            </p>
            <button
              onClick={() => setShowCreateForm(false)}
              className="relative w-full px-4 py-2.5 bg-white/40 backdrop-blur-md text-slate-700 border border-white/50 rounded-lg hover:bg-white/60 hover:border-blue-300/50 transition-all duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
