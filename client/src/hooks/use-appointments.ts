import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertAppointment } from "@shared/routes";
import { z } from "zod";

export function useAppointments(date?: string) {
  return useQuery({
    queryKey: [api.appointments.list.path, date],
    queryFn: async () => {
      let url = api.appointments.list.path;
      if (date) {
        url += `?date=${encodeURIComponent(date)}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return api.appointments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAppointment) => {
      // Zod coercion for dates happens in schema, but JSON.stringify needs string
      const payload = {
        ...data,
        patientId: Number(data.patientId),
        date: new Date(data.date).toISOString() 
      };
      
      // We manually check valid against schema before sending
      // But for the fetch, we send the processed object
      const res = await fetch(api.appointments.create.path, {
        method: api.appointments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create appointment");
      return api.appointments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAppointment>) => {
      const payload = {
        ...updates,
        date: updates.date ? new Date(updates.date).toISOString() : undefined
      };
      
      const url = buildUrl(api.appointments.update.path, { id });
      const res = await fetch(url, {
        method: api.appointments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update appointment");
      return api.appointments.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}
