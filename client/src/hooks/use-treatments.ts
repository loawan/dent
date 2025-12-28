import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertTreatment } from "@shared/routes";

export function useTreatments(patientId?: number) {
  return useQuery({
    queryKey: [api.treatments.list.path, patientId],
    queryFn: async () => {
      let url = api.treatments.list.path;
      if (patientId) {
        url += `?patientId=${patientId}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch treatments");
      return api.treatments.list.responses[200].parse(await res.json());
    },
    enabled: patientId === undefined || !!patientId,
  });
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTreatment) => {
      const payload = { 
        ...data, 
        cost: String(data.cost),
        patientId: Number(data.patientId),
        toothNumber: data.toothNumber ? Number(data.toothNumber) : null,
        appointmentId: data.appointmentId ? Number(data.appointmentId) : null
      };
      
      const res = await fetch(api.treatments.create.path, {
        method: api.treatments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to record treatment");
      return api.treatments.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.treatments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.treatments.list.path, variables.patientId] });
    },
  });
}
