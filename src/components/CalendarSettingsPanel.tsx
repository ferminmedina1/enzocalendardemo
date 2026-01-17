/**
 * Calendar Settings Component
 * Admin panel for configuring calendar rules
 */
'use client';

import { useState, useEffect } from 'react';
import {
  getCalendarSettings,
  saveCalendarSettings,
  getSchedule,
  saveSchedule,
} from '@/actions/settings';
import type { CalendarSettings, DaySchedule } from '@/types/database';
import { DAY_NAMES } from '@/types/database';
import toast from 'react-hot-toast';

export default function CalendarSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<Omit<CalendarSettings, 'id' | 'user_id'>>({
    slot_duration: 30,
    buffer_time: 0,
    advance_booking_days: 60,
    min_notice_hours: 12,
  });
  
  // Schedule state
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsResult, scheduleResult] = await Promise.all([
        getCalendarSettings(),
        getSchedule(),
      ]);

      if (settingsResult.success && settingsResult.data) {
        const { id, user_id, ...rest } = settingsResult.data;
        setSettings(rest);
      }

      if (scheduleResult.success && scheduleResult.data) {
        setSchedule(scheduleResult.data);
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const result = await saveCalendarSettings(settings);
      if (result.success) {
        toast.success('Configuración guardada');
      } else {
        toast.error(result.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const result = await saveSchedule(schedule);
      if (result.success) {
        toast.success('Horarios guardados');
      } else {
        toast.error(result.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateDaySchedule = (dayIndex: number, field: keyof DaySchedule, value: any) => {
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Configuración de reuniones</h3>
          <p className="text-sm text-gray-600 mt-1">Define la duración y tiempo entre reuniones</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Slot Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de la reunión
              </label>
              <select
                value={settings.slot_duration}
                onChange={(e) => setSettings({ ...settings, slot_duration: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1 hora 30 min</option>
                <option value={120}>2 horas</option>
              </select>
            </div>

            {/* Buffer Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo entre reuniones (cooldown)
              </label>
              <select
                value={settings.buffer_time}
                onChange={(e) => setSettings({ ...settings, buffer_time: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Sin tiempo entre reuniones</option>
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tiempo de descanso automático después de cada reunión
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Advance Booking */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reservar con anticipación hasta
              </label>
              <select
                value={settings.advance_booking_days}
                onChange={(e) => setSettings({ ...settings, advance_booking_days: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>1 semana</option>
                <option value={14}>2 semanas</option>
                <option value={30}>1 mes</option>
                <option value={60}>2 meses</option>
                <option value={90}>3 meses</option>
              </select>
            </div>

            {/* Min Notice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aviso mínimo requerido
              </label>
              <select
                value={settings.min_notice_hours}
                onChange={(e) => setSettings({ ...settings, min_notice_hours: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Sin mínimo</option>
                <option value={1}>1 hora antes</option>
                <option value={2}>2 horas antes</option>
                <option value={4}>4 horas antes</option>
                <option value={12}>12 horas antes</option>
                <option value={24}>24 horas antes</option>
                <option value={48}>48 horas antes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tiempo mínimo antes de la reunión para poder reservar
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Horario laboral</h3>
          <p className="text-sm text-gray-600 mt-1">Define los días y horarios disponibles para reservas</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div
                key={day.day_of_week}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                  day.is_active
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.is_active}
                    onChange={(e) => updateDaySchedule(index, 'is_active', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>

                {/* Day Name */}
                <div className="w-24 font-medium text-gray-900">
                  {DAY_NAMES[day.day_of_week]}
                </div>

                {/* Time Inputs */}
                {day.is_active ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={day.start_time}
                      onChange={(e) => updateDaySchedule(index, 'start_time', e.target.value)}
                      className="h-9 px-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">a</span>
                    <input
                      type="time"
                      value={day.end_time}
                      onChange={(e) => updateDaySchedule(index, 'end_time', e.target.value)}
                      className="h-9 px-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-gray-400 text-sm">
                    No disponible
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar horarios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
