/**
 * Zod schemas for runtime validation
 * Provides type-safe validation for forms and API inputs
 */
import { z } from 'zod';

// ============================================
// EVENT SCHEMAS
// ============================================

const eventBaseSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(255, 'El título debe tener máximo 255 caracteres'),
  description: z.string().optional().nullable(),
  start_time: z.string().datetime('Fecha de inicio inválida'),
  end_time: z.string().datetime('Fecha de fin inválida'),
  event_type: z
    .enum(['meeting', 'booking', 'block', 'personal'])
    .default('meeting'),
  is_public: z.boolean().default(true),
});

export const createEventSchema = eventBaseSchema.refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['end_time'],
  }
);

export const updateEventSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(255, 'El título debe tener máximo 255 caracteres')
    .optional(),
  description: z.string().optional().nullable(),
  start_time: z.string().datetime('Fecha de inicio inválida').optional(),
  end_time: z.string().datetime('Fecha de fin inválida').optional(),
  event_type: z
    .enum(['meeting', 'booking', 'block', 'personal'])
    .optional(),
  is_public: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return new Date(data.end_time) > new Date(data.start_time);
    }
    return true;
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['end_time'],
  }
);

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ============================================
// BOOKING SCHEMAS
// ============================================

export const createBookingSchema = z.object({
  slot_start: z.string().datetime('Fecha de inicio inválida'),
  slot_end: z.string().datetime('Fecha de fin inválida'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre debe tener máximo 255 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email debe tener máximo 255 caracteres'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Teléfono inválido')
    .optional()
    .nullable(),
  notes: z.string().max(1000, 'Las notas deben tener máximo 1000 caracteres').optional().nullable(),
});

export const updateBookingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

// ============================================
// AVAILABILITY RULE SCHEMAS
// ============================================

const availabilityRuleBaseSchema = z.object({
  day_of_week: z
    .number()
    .int()
    .min(0, 'Día inválido')
    .max(6, 'Día inválido'),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)'),
  end_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)'),
  is_active: z.boolean().default(true),
});

export const createAvailabilityRuleSchema = availabilityRuleBaseSchema.refine(
  (data) => data.end_time > data.start_time,
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['end_time'],
  }
);

export const updateAvailabilityRuleSchema = z.object({
  id: z.string().uuid(),
  day_of_week: z
    .number()
    .int()
    .min(0, 'Día inválido')
    .max(6, 'Día inválido')
    .optional(),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)')
    .optional(),
  end_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)')
    .optional(),
  is_active: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return data.end_time > data.start_time;
    }
    return true;
  },
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['end_time'],
  }
);

export type CreateAvailabilityRuleInput = z.infer<typeof createAvailabilityRuleSchema>;
export type UpdateAvailabilityRuleInput = z.infer<typeof updateAvailabilityRuleSchema>;

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// QUERY SCHEMAS
// ============================================

export const getEventsQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  event_type: z.enum(['meeting', 'booking', 'block', 'personal']).optional(),
  is_public: z.boolean().optional(),
});

export const getAvailableSlotsQuerySchema = z.object({
  date: z.string().datetime(),
  duration: z.number().int().min(15).max(480).default(30), // 15 min to 8 hours
});

export type GetEventsQuery = z.infer<typeof getEventsQuerySchema>;
export type GetAvailableSlotsQuery = z.infer<typeof getAvailableSlotsQuerySchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validateUUID = (id: string): boolean => {
  return z.string().uuid().safeParse(id).success;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<[^>]*>/g, ''); // Basic HTML tag removal
};
