import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerObjectStorageRoutes(app);
  
  // === PATIENTS ===
  app.get(api.patients.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const patients = await storage.getPatients(search);
    res.json(patients);
  });

  app.get(api.patients.get.path, async (req, res) => {
    const patient = await storage.getPatient(Number(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  app.post(api.patients.create.path, async (req, res) => {
    try {
      const input = api.patients.create.input.parse(req.body);
      const patient = await storage.createPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  app.put(api.patients.update.path, async (req, res) => {
    try {
      const input = api.patients.update.input.parse(req.body);
      const patient = await storage.updatePatient(Number(req.params.id), input);
      res.json(patient);
    } catch (err) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  // === INVENTORY ===
  app.get(api.inventory.list.path, async (req, res) => {
    const items = await storage.getInventory();
    res.json(items);
  });

  app.post(api.inventory.create.path, async (req, res) => {
    const input = api.inventory.create.input.parse(req.body);
    const item = await storage.createInventory(input);
    res.status(201).json(item);
  });

  app.put(api.inventory.update.path, async (req, res) => {
    const input = api.inventory.update.input.parse(req.body);
    const item = await storage.updateInventory(Number(req.params.id), input);
    res.json(item);
  });

  // === APPOINTMENTS ===
  app.get(api.appointments.list.path, async (req, res) => {
    const appts = await storage.getAppointments();
    res.json(appts);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    const input = api.appointments.create.input.parse(req.body);
    const appt = await storage.createAppointment(input);
    res.status(201).json(appt);
  });

  app.put(api.appointments.update.path, async (req, res) => {
    const input = api.appointments.update.input.parse(req.body);
    const appt = await storage.updateAppointment(Number(req.params.id), input);
    res.json(appt);
  });

  // === TREATMENTS ===
  app.get(api.treatments.list.path, async (req, res) => {
    const patientId = req.query.patientId ? Number(req.query.patientId) : undefined;
    const treatments = await storage.getTreatments(patientId);
    res.json(treatments);
  });

  app.post(api.treatments.create.path, async (req, res) => {
    const input = api.treatments.create.input.parse(req.body);
    const treatment = await storage.createTreatment(input);
    res.status(201).json(treatment);
  });

  // === INVOICES ===
  app.get(api.invoices.list.path, async (req, res) => {
    const invoices = await storage.getInvoices();
    res.json(invoices);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    const input = api.invoices.create.input.parse(req.body);
    const invoice = await storage.createInvoice(input);
    res.status(201).json(invoice);
  });

  app.put(api.invoices.update.path, async (req, res) => {
    const input = api.invoices.update.input.parse(req.body);
    const invoice = await storage.updateInvoice(Number(req.params.id), input);
    res.json(invoice);
  });

  // === XRAYS ===
  app.get(api.xrays.list.path, async (req, res) => {
    const patientId = Number(req.query.patientId);
    const results = await storage.getXrays(patientId);
    res.json(results);
  });

  app.post(api.xrays.create.path, async (req, res) => {
    const input = api.xrays.create.input.parse(req.body);
    const result = await storage.createXray(input);
    res.status(201).json(result);
  });

  // Seed Data
  if ((await storage.getInventory()).length === 0) {
    await storage.createInventory({ name: "Gloves (Box)", quantity: 50, minQuantity: 10, unit: "box", cost: "12.50" });
    await storage.createInventory({ name: "Anesthetic (Vials)", quantity: 5, minQuantity: 20, unit: "vial", cost: "45.00" });
    await storage.createInventory({ name: "Dental Floss", quantity: 100, minQuantity: 30, unit: "pack", cost: "2.00" });
    
    const p1 = await storage.createPatient({ name: "John Doe", phone: "555-0101", medicalHistory: "None", allergies: "Penicillin" });
    const p2 = await storage.createPatient({ name: "Jane Smith", phone: "555-0102", medicalHistory: "Hypertension", allergies: "None" });
    
    await storage.createAppointment({ patientId: p1.id, date: new Date(), status: "Pending", notes: "Regular checkup" });
    await storage.createTreatment({ patientId: p1.id, procedureName: "Cleaning", cost: "80.00", notes: "Routine cleaning" });
  }

  return httpServer;
}
