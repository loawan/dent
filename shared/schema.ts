import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === PATIENTS ===
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });

// === INVENTORY ===
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(10), // Low stock threshold
  unit: text("unit").notNull(), // e.g., 'box', 'piece'
  cost: decimal("cost").notNull(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });

// === APPOINTMENTS ===
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("Pending"), // Pending, Completed, Cancelled
  notes: text("notes"),
});

export const insertAppointmentSchema = createInsertSchema(appointments, {
  date: z.string().transform((str) => new Date(str)),
}).omit({ id: true });

// === TREATMENTS / RECORDS ===
// Represents a specific procedure done on a specific tooth/area
export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  appointmentId: integer("appointment_id"), // Can be null if walk-in or ad-hoc
  toothNumber: integer("tooth_number"), // 1-32, or null for general
  procedureName: text("procedure_name").notNull(), // Extraction, Filling, etc.
  cost: decimal("cost").notNull(),
  date: timestamp("date").defaultNow(),
  notes: text("notes"),
});

export const insertTreatmentSchema = createInsertSchema(treatments, {
  date: z.string().transform((str) => new Date(str)).optional(),
}).omit({ id: true, date: true });

// === INVOICES ===
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  totalAmount: decimal("total_amount").notNull(),
  paidAmount: decimal("paid_amount").notNull().default("0"),
  status: text("status").notNull().default("Unpaid"), // Unpaid, Partial, Paid
  paymentMethod: text("payment_method"), // Cash, Mobile Banking
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });

// === X-RAYS ===
export const xrays = pgTable("xrays", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertXraySchema = createInsertSchema(xrays).omit({ id: true, createdAt: true });

// === RELATIONS ===
export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  treatments: many(treatments),
  invoices: many(invoices),
  xrays: many(xrays),
}));

export const xraysRelations = relations(xrays, ({ one }) => ({
  patient: one(patients, {
    fields: [xrays.patientId],
    references: [patients.id],
  }),
}));

// === TYPES ===
export type Xray = typeof xrays.$inferSelect;
export type InsertXray = z.infer<typeof insertXraySchema>;

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  treatments: many(treatments),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  patient: one(patients, {
    fields: [invoices.patientId],
    references: [patients.id],
  }),
}));


// === TYPES ===
export type Patient = typeof patients.$inferSelect;
export type InventoryItem = typeof inventory.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Treatment = typeof treatments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
