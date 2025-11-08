import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export function useFetchSchemas() {
    return useQuery({
        queryKey: ["schemas"],
        queryFn: async () => (await api.get("/schemas")).data,
    });
}