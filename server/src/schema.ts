import { z } from 'zod';

// Enums for various statuses
export const userRoleSchema = z.enum(['admin', 'staff']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const roomStatusSchema = z.enum(['available', 'occupied', 'maintenance', 'cleaning']);
export type RoomStatus = z.infer<typeof roomStatusSchema>;

export const roomTypeSchema = z.enum(['standard', 'deluxe', 'suite', 'family']);
export type RoomType = z.infer<typeof roomTypeSchema>;

export const reservationStatusSchema = z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']);
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

export const paymentStatusSchema = z.enum(['pending', 'partial', 'paid', 'refunded']);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const genderSchema = z.enum(['male', 'female']);
export type Gender = z.infer<typeof genderSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  password_hash: z.string(),
  full_name: z.string(),
  role: userRoleSchema,
  phone: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Room schema
export const roomSchema = z.object({
  id: z.number(),
  room_number: z.string(),
  room_type: roomTypeSchema,
  status: roomStatusSchema,
  floor: z.number().int(),
  capacity: z.number().int(),
  price_per_night: z.number(),
  amenities: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Room = z.infer<typeof roomSchema>;

// Guest schema
export const guestSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string(),
  identity_number: z.string(),
  gender: genderSchema,
  date_of_birth: z.coerce.date().nullable(),
  nationality: z.string(),
  address: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Guest = z.infer<typeof guestSchema>;

// Reservation schema
export const reservationSchema = z.object({
  id: z.number(),
  guest_id: z.number(),
  room_id: z.number(),
  check_in_date: z.coerce.date(),
  check_out_date: z.coerce.date(),
  actual_check_in: z.coerce.date().nullable(),
  actual_check_out: z.coerce.date().nullable(),
  adults: z.number().int(),
  children: z.number().int(),
  total_amount: z.number(),
  status: reservationStatusSchema,
  payment_status: paymentStatusSchema,
  special_requests: z.string().nullable(),
  created_by: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Reservation = z.infer<typeof reservationSchema>;

// Payment schema
export const paymentSchema = z.object({
  id: z.number(),
  reservation_id: z.number(),
  amount: z.number(),
  payment_method: z.string(),
  transaction_reference: z.string().nullable(),
  notes: z.string().nullable(),
  processed_by: z.number(),
  created_at: z.coerce.date()
});

export type Payment = z.infer<typeof paymentSchema>;

// Room maintenance schema
export const roomMaintenanceSchema = z.object({
  id: z.number(),
  room_id: z.number(),
  issue_description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  assigned_to: z.number().nullable(),
  resolved_at: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  reported_by: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type RoomMaintenance = z.infer<typeof roomMaintenanceSchema>;

// Input schemas for creating records
export const createUserInputSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  role: userRoleSchema,
  phone: z.string().nullable(),
  is_active: z.boolean().default(true)
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createRoomInputSchema = z.object({
  room_number: z.string(),
  room_type: roomTypeSchema,
  floor: z.number().int().positive(),
  capacity: z.number().int().positive(),
  price_per_night: z.number().positive(),
  amenities: z.string().nullable(),
  description: z.string().nullable()
});

export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

export const createGuestInputSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  identity_number: z.string(),
  gender: genderSchema,
  date_of_birth: z.coerce.date().nullable(),
  nationality: z.string(),
  address: z.string().nullable()
});

export type CreateGuestInput = z.infer<typeof createGuestInputSchema>;

export const createReservationInputSchema = z.object({
  guest_id: z.number(),
  room_id: z.number(),
  check_in_date: z.coerce.date(),
  check_out_date: z.coerce.date(),
  adults: z.number().int().positive(),
  children: z.number().int().nonnegative(),
  special_requests: z.string().nullable(),
  created_by: z.number()
});

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

export const createPaymentInputSchema = z.object({
  reservation_id: z.number(),
  amount: z.number().positive(),
  payment_method: z.string(),
  transaction_reference: z.string().nullable(),
  notes: z.string().nullable(),
  processed_by: z.number()
});

export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;

export const createMaintenanceInputSchema = z.object({
  room_id: z.number(),
  issue_description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  reported_by: z.number()
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceInputSchema>;

// Update schemas
export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  full_name: z.string().optional(),
  role: userRoleSchema.optional(),
  phone: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateRoomInputSchema = z.object({
  id: z.number(),
  room_number: z.string().optional(),
  room_type: roomTypeSchema.optional(),
  status: roomStatusSchema.optional(),
  floor: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  price_per_night: z.number().positive().optional(),
  amenities: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

export type UpdateRoomInput = z.infer<typeof updateRoomInputSchema>;

export const updateGuestInputSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  identity_number: z.string().optional(),
  gender: genderSchema.optional(),
  date_of_birth: z.coerce.date().nullable().optional(),
  nationality: z.string().optional(),
  address: z.string().nullable().optional()
});

export type UpdateGuestInput = z.infer<typeof updateGuestInputSchema>;

export const updateReservationInputSchema = z.object({
  id: z.number(),
  guest_id: z.number().optional(),
  room_id: z.number().optional(),
  check_in_date: z.coerce.date().optional(),
  check_out_date: z.coerce.date().optional(),
  actual_check_in: z.coerce.date().nullable().optional(),
  actual_check_out: z.coerce.date().nullable().optional(),
  adults: z.number().int().positive().optional(),
  children: z.number().int().nonnegative().optional(),
  total_amount: z.number().optional(),
  status: reservationStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  special_requests: z.string().nullable().optional()
});

export type UpdateReservationInput = z.infer<typeof updateReservationInputSchema>;

export const updateMaintenanceInputSchema = z.object({
  id: z.number(),
  issue_description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  assigned_to: z.number().nullable().optional(),
  resolved_at: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceInputSchema>;

// Authentication schemas
export const loginInputSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginResponseSchema = z.object({
  user: userSchema.omit({ password_hash: true }),
  token: z.string()
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// Dashboard schemas
export const dashboardStatsSchema = z.object({
  total_rooms: z.number(),
  occupied_rooms: z.number(),
  available_rooms: z.number(),
  maintenance_rooms: z.number(),
  cleaning_rooms: z.number(),
  occupancy_rate: z.number(),
  total_reservations_today: z.number(),
  check_ins_today: z.number(),
  check_outs_today: z.number(),
  revenue_today: z.number(),
  revenue_month: z.number(),
  pending_maintenance: z.number()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Report schemas
export const occupancyReportSchema = z.object({
  date: z.string(),
  total_rooms: z.number(),
  occupied_rooms: z.number(),
  occupancy_rate: z.number(),
  revenue: z.number()
});

export type OccupancyReport = z.infer<typeof occupancyReportSchema>;

export const revenueReportSchema = z.object({
  period: z.string(),
  room_revenue: z.number(),
  total_reservations: z.number(),
  average_rate: z.number(),
  occupancy_rate: z.number()
});

export type RevenueReport = z.infer<typeof revenueReportSchema>;

// Query filter schemas
export const roomFilterSchema = z.object({
  status: roomStatusSchema.optional(),
  room_type: roomTypeSchema.optional(),
  floor: z.number().int().optional(),
  available_from: z.coerce.date().optional(),
  available_to: z.coerce.date().optional()
});

export type RoomFilter = z.infer<typeof roomFilterSchema>;

export const reservationFilterSchema = z.object({
  status: reservationStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  check_in_from: z.coerce.date().optional(),
  check_in_to: z.coerce.date().optional(),
  guest_name: z.string().optional()
});

export type ReservationFilter = z.infer<typeof reservationFilterSchema>;

export const guestFilterSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional()
});

export type GuestFilter = z.infer<typeof guestFilterSchema>;