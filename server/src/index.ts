import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import all schemas
import {
  createUserInputSchema,
  updateUserInputSchema,
  createRoomInputSchema,
  updateRoomInputSchema,
  roomFilterSchema,
  createGuestInputSchema,
  updateGuestInputSchema,
  guestFilterSchema,
  createReservationInputSchema,
  updateReservationInputSchema,
  reservationFilterSchema,
  createPaymentInputSchema,
  createMaintenanceInputSchema,
  updateMaintenanceInputSchema,
  loginInputSchema
} from './schema';

// Import all handlers
import { login, verifyToken, getCurrentUser } from './handlers/auth';
import { getDashboardStats, getRecentActivities } from './handlers/dashboard';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './handlers/users';
import { 
  createRoom, 
  getRooms, 
  getAvailableRooms, 
  getRoomById, 
  updateRoom, 
  updateRoomStatus, 
  deleteRoom 
} from './handlers/rooms';
import { 
  createGuest, 
  getGuests, 
  getGuestById, 
  searchGuests, 
  updateGuest, 
  getGuestReservations, 
  deleteGuest 
} from './handlers/guests';
import { 
  createReservation, 
  getReservations, 
  getReservationById, 
  updateReservation, 
  checkInGuest, 
  checkOutGuest, 
  cancelReservation, 
  getTodayArrivals, 
  getTodayDepartures 
} from './handlers/reservations';
import { 
  createPayment, 
  getPaymentsByReservation, 
  getPayments, 
  getPaymentById, 
  getReservationPaymentSummary, 
  processRefund 
} from './handlers/payments';
import { 
  createMaintenance, 
  getMaintenanceRequests, 
  getMaintenanceById, 
  updateMaintenance, 
  assignMaintenance, 
  completeMaintenance, 
  getPendingMaintenance, 
  getMaintenanceByRoom 
} from './handlers/maintenance';
import { 
  getOccupancyReport, 
  getRevenueReport, 
  getFinancialSummary, 
  getGuestStatistics, 
  getRoomPerformanceReport, 
  exportReport 
} from './handlers/reports';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => login(input)),
    
    verifyToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => verifyToken(input.token)),
    
    getCurrentUser: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => getCurrentUser(input.token))
  }),

  // Dashboard routes
  dashboard: router({
    getStats: publicProcedure
      .query(() => getDashboardStats()),
    
    getRecentActivities: publicProcedure
      .query(() => getRecentActivities())
  }),

  // User management routes
  users: router({
    create: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => createUser(input)),
    
    getAll: publicProcedure
      .input(z.object({ 
        role: z.string().optional(), 
        is_active: z.boolean().optional() 
      }).optional())
      .query(({ input }) => getUsers(input)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserById(input.id)),
    
    update: publicProcedure
      .input(updateUserInputSchema)
      .mutation(({ input }) => updateUser(input)),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteUser(input.id))
  }),

  // Room management routes
  rooms: router({
    create: publicProcedure
      .input(createRoomInputSchema)
      .mutation(({ input }) => createRoom(input)),
    
    getAll: publicProcedure
      .input(roomFilterSchema.optional())
      .query(({ input }) => getRooms(input)),
    
    getAvailable: publicProcedure
      .input(z.object({
        checkIn: z.coerce.date(),
        checkOut: z.coerce.date(),
        capacity: z.number().optional()
      }))
      .query(({ input }) => getAvailableRooms(input.checkIn, input.checkOut, input.capacity)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getRoomById(input.id)),
    
    update: publicProcedure
      .input(updateRoomInputSchema)
      .mutation(({ input }) => updateRoom(input)),
    
    updateStatus: publicProcedure
      .input(z.object({ 
        roomId: z.number(), 
        status: z.string() 
      }))
      .mutation(({ input }) => updateRoomStatus(input.roomId, input.status)),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteRoom(input.id))
  }),

  // Guest management routes
  guests: router({
    create: publicProcedure
      .input(createGuestInputSchema)
      .mutation(({ input }) => createGuest(input)),
    
    getAll: publicProcedure
      .input(guestFilterSchema.optional())
      .query(({ input }) => getGuests(input)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getGuestById(input.id)),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => searchGuests(input.query)),
    
    update: publicProcedure
      .input(updateGuestInputSchema)
      .mutation(({ input }) => updateGuest(input)),
    
    getReservations: publicProcedure
      .input(z.object({ guestId: z.number() }))
      .query(({ input }) => getGuestReservations(input.guestId)),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteGuest(input.id))
  }),

  // Reservation management routes
  reservations: router({
    create: publicProcedure
      .input(createReservationInputSchema)
      .mutation(({ input }) => createReservation(input)),
    
    getAll: publicProcedure
      .input(reservationFilterSchema.optional())
      .query(({ input }) => getReservations(input)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getReservationById(input.id)),
    
    update: publicProcedure
      .input(updateReservationInputSchema)
      .mutation(({ input }) => updateReservation(input)),
    
    checkIn: publicProcedure
      .input(z.object({ reservationId: z.number() }))
      .mutation(({ input }) => checkInGuest(input.reservationId)),
    
    checkOut: publicProcedure
      .input(z.object({ reservationId: z.number() }))
      .mutation(({ input }) => checkOutGuest(input.reservationId)),
    
    cancel: publicProcedure
      .input(z.object({ 
        id: z.number(), 
        reason: z.string().optional() 
      }))
      .mutation(({ input }) => cancelReservation(input.id, input.reason)),
    
    getTodayArrivals: publicProcedure
      .query(() => getTodayArrivals()),
    
    getTodayDepartures: publicProcedure
      .query(() => getTodayDepartures())
  }),

  // Payment management routes
  payments: router({
    create: publicProcedure
      .input(createPaymentInputSchema)
      .mutation(({ input }) => createPayment(input)),
    
    getByReservation: publicProcedure
      .input(z.object({ reservationId: z.number() }))
      .query(({ input }) => getPaymentsByReservation(input.reservationId)),
    
    getAll: publicProcedure
      .input(z.object({
        date_from: z.coerce.date().optional(),
        date_to: z.coerce.date().optional(),
        payment_method: z.string().optional(),
        processed_by: z.number().optional()
      }).optional())
      .query(({ input }) => getPayments(input)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getPaymentById(input.id)),
    
    getReservationSummary: publicProcedure
      .input(z.object({ reservationId: z.number() }))
      .query(({ input }) => getReservationPaymentSummary(input.reservationId)),
    
    processRefund: publicProcedure
      .input(z.object({
        paymentId: z.number(),
        refundAmount: z.number(),
        reason: z.string(),
        processedBy: z.number()
      }))
      .mutation(({ input }) => processRefund(input.paymentId, input.refundAmount, input.reason, input.processedBy))
  }),

  // Maintenance management routes
  maintenance: router({
    create: publicProcedure
      .input(createMaintenanceInputSchema)
      .mutation(({ input }) => createMaintenance(input)),
    
    getAll: publicProcedure
      .input(z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        room_id: z.number().optional(),
        assigned_to: z.number().optional()
      }).optional())
      .query(({ input }) => getMaintenanceRequests(input)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMaintenanceById(input.id)),
    
    update: publicProcedure
      .input(updateMaintenanceInputSchema)
      .mutation(({ input }) => updateMaintenance(input)),
    
    assign: publicProcedure
      .input(z.object({
        maintenanceId: z.number(),
        staffId: z.number()
      }))
      .mutation(({ input }) => assignMaintenance(input.maintenanceId, input.staffId)),
    
    complete: publicProcedure
      .input(z.object({
        maintenanceId: z.number(),
        notes: z.string()
      }))
      .mutation(({ input }) => completeMaintenance(input.maintenanceId, input.notes)),
    
    getPending: publicProcedure
      .query(() => getPendingMaintenance()),
    
    getByRoom: publicProcedure
      .input(z.object({ roomId: z.number() }))
      .query(({ input }) => getMaintenanceByRoom(input.roomId))
  }),

  // Reporting routes
  reports: router({
    occupancy: publicProcedure
      .input(z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      }))
      .query(({ input }) => getOccupancyReport(input.startDate, input.endDate)),
    
    revenue: publicProcedure
      .input(z.object({
        period: z.enum(['daily', 'weekly', 'monthly']),
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      }))
      .query(({ input }) => getRevenueReport(input.period, input.startDate, input.endDate)),
    
    financialSummary: publicProcedure
      .input(z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      }))
      .query(({ input }) => getFinancialSummary(input.startDate, input.endDate)),
    
    guestStatistics: publicProcedure
      .input(z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      }))
      .query(({ input }) => getGuestStatistics(input.startDate, input.endDate)),
    
    roomPerformance: publicProcedure
      .input(z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      }))
      .query(({ input }) => getRoomPerformanceReport(input.startDate, input.endDate)),
    
    export: publicProcedure
      .input(z.object({
        reportType: z.enum(['occupancy', 'revenue', 'financial', 'guest', 'room_performance']),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        format: z.enum(['pdf', 'excel', 'csv'])
      }))
      .query(({ input }) => exportReport(input.reportType, input.startDate, input.endDate, input.format))
  })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors({
        origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
        credentials: true
      })(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  
  server.listen(port);
  console.log(`🏨 Bon Bambu Sungai Danau PMS Server listening at port: ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/trpc`);
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});