import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean,
  date,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);
export const roomStatusEnum = pgEnum('room_status', ['available', 'occupied', 'maintenance', 'cleaning']);
export const roomTypeEnum = pgEnum('room_type', ['standard', 'deluxe', 'suite', 'family']);
export const reservationStatusEnum = pgEnum('reservation_status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'partial', 'paid', 'refunded']);
export const genderEnum = pgEnum('gender', ['male', 'female']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'critical']);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['pending', 'in_progress', 'completed', 'cancelled']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  role: userRoleEnum('role').notNull(),
  phone: text('phone'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Rooms table
export const roomsTable = pgTable('rooms', {
  id: serial('id').primaryKey(),
  room_number: text('room_number').notNull().unique(),
  room_type: roomTypeEnum('room_type').notNull(),
  status: roomStatusEnum('status').notNull().default('available'),
  floor: integer('floor').notNull(),
  capacity: integer('capacity').notNull(),
  price_per_night: numeric('price_per_night', { precision: 10, scale: 2 }).notNull(),
  amenities: text('amenities'),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Guests table
export const guestsTable = pgTable('guests', {
  id: serial('id').primaryKey(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  identity_number: text('identity_number').notNull().unique(),
  gender: genderEnum('gender').notNull(),
  date_of_birth: date('date_of_birth'),
  nationality: text('nationality').notNull(),
  address: text('address'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Reservations table
export const reservationsTable = pgTable('reservations', {
  id: serial('id').primaryKey(),
  guest_id: integer('guest_id').notNull(),
  room_id: integer('room_id').notNull(),
  check_in_date: date('check_in_date').notNull(),
  check_out_date: date('check_out_date').notNull(),
  actual_check_in: timestamp('actual_check_in'),
  actual_check_out: timestamp('actual_check_out'),
  adults: integer('adults').notNull(),
  children: integer('children').notNull().default(0),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: reservationStatusEnum('status').notNull().default('pending'),
  payment_status: paymentStatusEnum('payment_status').notNull().default('pending'),
  special_requests: text('special_requests'),
  created_by: integer('created_by').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Payments table
export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  reservation_id: integer('reservation_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: text('payment_method').notNull(),
  transaction_reference: text('transaction_reference'),
  notes: text('notes'),
  processed_by: integer('processed_by').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Room maintenance table
export const roomMaintenanceTable = pgTable('room_maintenance', {
  id: serial('id').primaryKey(),
  room_id: integer('room_id').notNull(),
  issue_description: text('issue_description').notNull(),
  priority: priorityEnum('priority').notNull(),
  status: maintenanceStatusEnum('status').notNull().default('pending'),
  assigned_to: integer('assigned_to'),
  resolved_at: timestamp('resolved_at'),
  notes: text('notes'),
  reported_by: integer('reported_by').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  reservations: many(reservationsTable, { relationName: 'userReservations' }),
  payments: many(paymentsTable),
  maintenanceReports: many(roomMaintenanceTable, { relationName: 'reportedMaintenance' }),
  assignedMaintenance: many(roomMaintenanceTable, { relationName: 'assignedMaintenance' })
}));

export const roomsRelations = relations(roomsTable, ({ many }) => ({
  reservations: many(reservationsTable),
  maintenance: many(roomMaintenanceTable)
}));

export const guestsRelations = relations(guestsTable, ({ many }) => ({
  reservations: many(reservationsTable)
}));

export const reservationsRelations = relations(reservationsTable, ({ one, many }) => ({
  guest: one(guestsTable, {
    fields: [reservationsTable.guest_id],
    references: [guestsTable.id]
  }),
  room: one(roomsTable, {
    fields: [reservationsTable.room_id],
    references: [roomsTable.id]
  }),
  createdBy: one(usersTable, {
    fields: [reservationsTable.created_by],
    references: [usersTable.id],
    relationName: 'userReservations'
  }),
  payments: many(paymentsTable)
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  reservation: one(reservationsTable, {
    fields: [paymentsTable.reservation_id],
    references: [reservationsTable.id]
  }),
  processedBy: one(usersTable, {
    fields: [paymentsTable.processed_by],
    references: [usersTable.id]
  })
}));

export const roomMaintenanceRelations = relations(roomMaintenanceTable, ({ one }) => ({
  room: one(roomsTable, {
    fields: [roomMaintenanceTable.room_id],
    references: [roomsTable.id]
  }),
  assignedTo: one(usersTable, {
    fields: [roomMaintenanceTable.assigned_to],
    references: [usersTable.id],
    relationName: 'assignedMaintenance'
  }),
  reportedBy: one(usersTable, {
    fields: [roomMaintenanceTable.reported_by],
    references: [usersTable.id],
    relationName: 'reportedMaintenance'
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  rooms: roomsTable,
  guests: guestsTable,
  reservations: reservationsTable,
  payments: paymentsTable,
  roomMaintenance: roomMaintenanceTable
};

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Room = typeof roomsTable.$inferSelect;
export type NewRoom = typeof roomsTable.$inferInsert;

export type Guest = typeof guestsTable.$inferSelect;
export type NewGuest = typeof guestsTable.$inferInsert;

export type Reservation = typeof reservationsTable.$inferSelect;
export type NewReservation = typeof reservationsTable.$inferInsert;

export type Payment = typeof paymentsTable.$inferSelect;
export type NewPayment = typeof paymentsTable.$inferInsert;

export type RoomMaintenance = typeof roomMaintenanceTable.$inferSelect;
export type NewRoomMaintenance = typeof roomMaintenanceTable.$inferInsert;