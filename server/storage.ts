import { db } from "./db";
import { 
  patients, inventory, appointments, treatments, invoices, xrays,
  type InsertPatient, type InsertInventory, type InsertAppointment, type InsertTreatment, type InsertInvoice, type InsertXray,
  type Patient, type InventoryItem, type Appointment, type Treatment, type Invoice, type Xray
} from "@shared/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  // Patients
  getPatients(search?: string): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient>;

  // Inventory
  getInventory(): Promise<InventoryItem[]>;
  createInventory(item: InsertInventory): Promise<InventoryItem>;
  updateInventory(id: number, item: Partial<InsertInventory>): Promise<InventoryItem>;

  // Appointments
  getAppointments(date?: string): Promise<Appointment[]>;
  createAppointment(appt: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appt: Partial<InsertAppointment>): Promise<Appointment>;

  // Treatments
  getTreatments(patientId?: number): Promise<Treatment[]>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;

  // Xrays
  getXrays(patientId: number): Promise<Xray[]>;
  createXray(xray: InsertXray): Promise<Xray>;
}

export class DatabaseStorage implements IStorage {
  // Patients
  async getPatients(search?: string): Promise<Patient[]> {
    if (search) {
      return await db.select().from(patients).where(
        or(
          ilike(patients.name, `%${search}%`),
          ilike(patients.phone, `%${search}%`)
        )
      ).orderBy(desc(patients.createdAt));
    }
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(id: number, update: Partial<InsertPatient>): Promise<Patient> {
    const [updated] = await db.update(patients).set(update).where(eq(patients.id, id)).returning();
    return updated;
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory).orderBy(inventory.name);
  }

  async createInventory(item: InsertInventory): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventory(id: number, item: Partial<InsertInventory>): Promise<InventoryItem> {
    const [updated] = await db.update(inventory).set(item).where(eq(inventory.id, id)).returning();
    return updated;
  }

  // Appointments
  async getAppointments(date?: string): Promise<Appointment[]> {
    // Basic filtering, typically would be range based
    return await db.select().from(appointments).orderBy(desc(appointments.date));
  }

  async createAppointment(appt: InsertAppointment): Promise<Appointment> {
    const [newAppt] = await db.insert(appointments).values(appt).returning();
    return newAppt;
  }

  async updateAppointment(id: number, appt: Partial<InsertAppointment>): Promise<Appointment> {
    const [updated] = await db.update(appointments).set(appt).where(eq(appointments.id, id)).returning();
    return updated;
  }

  // Treatments
  async getTreatments(patientId?: number): Promise<Treatment[]> {
    if (patientId) {
      return await db.select().from(treatments).where(eq(treatments.patientId, patientId)).orderBy(desc(treatments.date));
    }
    return await db.select().from(treatments).orderBy(desc(treatments.date));
  }

  async createTreatment(treatment: InsertTreatment): Promise<Treatment> {
    const [newTreatment] = await db.insert(treatments).values({
      ...treatment,
      toothNumber: treatment.toothNumber || null,
      appointmentId: treatment.appointmentId || null,
    }).returning();
    return newTreatment;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updated] = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    return updated;
  }

  // Xrays
  async getXrays(patientId: number): Promise<Xray[]> {
    return await db.select().from(xrays).where(eq(xrays.patientId, patientId)).orderBy(desc(xrays.createdAt));
  }

  async createXray(xray: InsertXray): Promise<Xray> {
    const [newXray] = await db.insert(xrays).values(xray).returning();
    return newXray;
  }
}

export const storage = new DatabaseStorage();
