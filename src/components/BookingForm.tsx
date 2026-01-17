/**
 * BookingForm Component
 * Modern calendar-inspired booking form - Mobile first design
 * Matches Calendar component styling with Calendly/Cal.com UX patterns
 */
'use client';

import { useState } from 'react';
import { createBookingSchema } from '@/utils/validations';
import { createBooking } from '@/actions/bookings';
import toast from 'react-hot-toast';

interface BookingFormProps {
  slotStart: Date;
  slotEnd: Date;
  onSuccess: () => void;
  onCancel: () => void;
  showAsPage?: boolean;
}

export default function BookingForm({
  slotStart,
  slotEnd,
  onSuccess,
  onCancel,
  showAsPage = false,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = createBookingSchema.safeParse({
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd.toISOString(),
        ...formData,
        phone: formData.phone || null,
        notes: formData.notes || null,
      });

      if (!validation.success) {
        toast.error(validation.error.issues[0].message);
        setLoading(false);
        return;
      }

      const result = await createBooking(validation.data);

      if (!result.success) {
        toast.error(result.error || 'Error al crear la reserva');
        setLoading(false);
        return;
      }

      toast.success('¡Reserva confirmada! Recibirás un email de confirmación.');
      onSuccess();
    } catch (error) {
      toast.error('Error al crear la reserva');
      console.error(error);
      setLoading(false);
    }
  };

  // Iconos inline para mejor rendimiento
  const CalendarIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );

  const EmailIcon = () => (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );

  const NotesIcon = () => (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-5"
    >
      {/* Header con fecha/hora - Estilo Cal.com */}
      <div className="flex flex-col gap-3 pb-5 border-b border-slate-100">
        <h2 className="text-[20px] sm:text-[24px] font-semibold text-slate-900 leading-tight">
          Confirma tu reserva
        </h2>
        
        {/* Chips de fecha y hora */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 text-blue-700 text-[13px] sm:text-[14px] font-medium">
            <CalendarIcon />
            <span className="capitalize">
              {slotStart.toLocaleDateString('es-AR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-[13px] sm:text-[14px] font-medium">
            <ClockIcon />
            <span>
              {slotStart.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' - '}
              {slotEnd.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Campos del formulario */}
      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <div className="relative">
          <label htmlFor="name" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <UserIcon />
            </div>
            <input
              type="text"
              id="name"
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <label htmlFor="email" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <EmailIcon />
            </div>
            <input
              type="email"
              id="email"
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div className="relative">
          <label htmlFor="phone" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Teléfono <span className="text-slate-400 text-[12px] font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <PhoneIcon />
            </div>
            <input
              type="tel"
              id="phone"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="+54 11 1234 5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={loading}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Notas */}
        <div className="relative">
          <label htmlFor="notes" className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Notas adicionales <span className="text-slate-400 text-[12px] font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 pointer-events-none">
              <NotesIcon />
            </div>
            <textarea
              id="notes"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="¿Hay algo que debamos saber?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-blue-600 text-white text-[15px] font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Confirmar reserva
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-10 w-full rounded-full border border-slate-200 bg-white text-slate-600 text-[14px] font-medium hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        >
          Volver atrás
        </button>
      </div>
    </form>
  );

  if (showAsPage) {
    return (
      <div className=" bg-white flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[400px]">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 backdrop-blur-[2px]">
      {/* Mobile: slide from bottom | Desktop: centered modal */}
      <div 
        className="bg-white w-full sm:max-w-[420px] sm:rounded-2xl rounded-t-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
      >
        {/* Handle bar para mobile */}
        <div className="sm:hidden flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>
        
        {/* Close button - solo desktop */}
        <button
          onClick={onCancel}
          type="button"
          className="hidden sm:flex absolute top-4 right-4 h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Cerrar"
          disabled={loading}
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {formContent}
      </div>
    </div>
  );
}