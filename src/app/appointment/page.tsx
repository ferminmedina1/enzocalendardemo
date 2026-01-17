/**
 * Appointment booking page
 * Public calendar interface for booking appointments
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DateTimePicker from '@/components/DateTimePicker';
import BookingForm from '@/components/BookingForm';
import { getAvailableSlots } from '@/actions/slots';
import type { TimeSlot } from '@/types/database';
import toast from 'react-hot-toast';

export default function AppointmentPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const availableSlots = await getAvailableSlots({
        startDate: new Date(),
        days: 60,
        slotDuration: 30,
        bufferTime: 0,
      });
      setSlots(availableSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast.error('Error al cargar los horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleNextClick = () => {
    if (selectedSlot) {
      setShowBookingForm(true);
    }
  };

  const handleBackClick = () => {
    setShowBookingForm(false);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedSlot(null);
    loadSlots();
    router.refresh();
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      {/* Fondo decorativo animado */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-300/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-[1100px]">
        <div className="relative">
          {/* Título como encabezado de sección */}
          {!showBookingForm && (
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 mb-3 tracking-tight">
                Selecciona una fecha y hora
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Elige el horario que mejor te convenga para tu reunión
              </p>
            </div>
          )}

          {/* Contenedor principal con glassmorphism */}
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl sm:rounded-4xl border border-white/50 shadow-2xl shadow-blue-900/10 overflow-hidden">
            {/* Degradados internos premium */}
            <div className="absolute inset-0 bg-linear-to-br from-white/60 via-white/40 to-white/20 pointer-events-none rounded-3xl sm:rounded-4xl" />
            
            {/* Contenido principal con paddings adecuados */}
            <div className="relative px-8 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-14">
              {!showBookingForm ? (
                <DateTimePicker
                  slots={slots}
                  onSlotClick={handleSlotClick}
                  selectedSlot={selectedSlot || undefined}
                  loading={loading}
                  onNextClick={handleNextClick}
                />
              ) : (
                <BookingForm
                  slotStart={new Date(selectedSlot?.start || '')}
                  slotEnd={new Date(selectedSlot?.end || '')}
                  onSuccess={handleBookingSuccess}
                  onCancel={handleBackClick}
                  showAsPage={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
