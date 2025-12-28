import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertInventory } from "@shared/routes";

export function useInventory() {
  return useQuery({
    queryKey: [api.inventory.list.path],
    queryFn: async () => {
      const res = await fetch(api.inventory.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.inventory.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertInventory) => {
      // Coerce cost to string if it's a number (for decimal handling)
      const payload = { ...data, cost: String(data.cost) };
      const validated = api.inventory.create.input.parse(payload);
      
      const res = await fetch(api.inventory.create.path, {
        method: api.inventory.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create item");
      return api.inventory.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] }),
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertInventory>) => {
      // Coerce cost if present
      const payload = updates.cost ? { ...updates, cost: String(updates.cost) } : updates;
      const validated = api.inventory.update.input.parse(payload);
      const url = buildUrl(api.inventory.update.path, { id });
      
      const res = await fetch(url, {
        method: api.inventory.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update item");
      return api.inventory.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] }),
  });
}
