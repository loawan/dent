import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertInvoice } from "@shared/routes";

export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return api.invoices.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const payload = {
        ...data,
        patientId: Number(data.patientId),
        totalAmount: String(data.totalAmount),
        paidAmount: String(data.paidAmount || 0),
      };

      const res = await fetch(api.invoices.create.path, {
        method: api.invoices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create invoice");
      return api.invoices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] }),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertInvoice>) => {
      const payload: any = { ...updates };
      if (updates.totalAmount) payload.totalAmount = String(updates.totalAmount);
      if (updates.paidAmount) payload.paidAmount = String(updates.paidAmount);

      const url = buildUrl(api.invoices.update.path, { id });
      const res = await fetch(url, {
        method: api.invoices.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update invoice");
      return api.invoices.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] }),
  });
}
