import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPatient } from "@shared/schema";

export function usePatients(search?: string) {
  return useQuery({
    queryKey: [api.patients.list.path, search],
    queryFn: async () => {
      const url = search 
        ? buildUrl(api.patients.list.path) + `?search=${encodeURIComponent(search)}`
        : api.patients.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch patients");
      return api.patients.list.responses[200].parse(await res.json());
    },
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: [api.patients.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.patients.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch patient");
      return api.patients.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPatient) => {
      const validated = api.patients.create.input.parse(data);
      const res = await fetch(api.patients.create.path, {
        method: api.patients.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.patients.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create patient");
      }
      return api.patients.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.patients.list.path] }),
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertPatient>) => {
      const validated = api.patients.update.input.parse(updates);
      const url = buildUrl(api.patients.update.path, { id });
      
      const res = await fetch(url, {
        method: api.patients.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update patient");
      return api.patients.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.patients.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.patients.get.path, variables.id] });
    },
  });
}
