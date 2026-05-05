import { useQuery, useQueryClient } from "@tanstack/react-query";
import { matchesAPI } from "@/api/endpoints";
import api from "@/api/axios";
import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";

export const useMatches = () => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const fetchMatches = async () => {
        const [live, upcoming, completed, allExternal] = await Promise.all([
            matchesAPI.getLive().catch(() => ({ data: [] })),
            matchesAPI.getUpcoming().catch(() => ({ data: [] })),
            matchesAPI.getAll({ status: "completed" }).catch(() => ({ data: [] })),
            // /api/live returns { status: 'success', data: [...] } (football + cricket merged)
            api.get("/live").catch(() => ({ data: { data: [] } })),
        ]);

        // Handle wrapped response: { status, data: [...] } OR plain array
        // Guard against null / undefined / non-array at every level
        const externalRaw = allExternal?.data ?? null;
        let externalList: any[] = [];
        if (Array.isArray(externalRaw)) {
            externalList = externalRaw;
        } else if (externalRaw && Array.isArray(externalRaw.data)) {
            externalList = externalRaw.data;
        }

        // Deduplicate and filter for Cricket ONLY
        const seen = new Set<string>();
        const deduped = externalList.filter(m => {
            const key = m.id || m._id;
            if (!key || seen.has(key)) return false;
            // Filter out football/others
            if (m.sport && m.sport !== 'cricket') return false;
            seen.add(key);
            return true;
        });

        return {
            live: (live.data || []).filter((m: any) => (m.sport || 'cricket') === 'cricket'),
            upcoming: (upcoming.data || []).filter((m: any) => (m.sport || 'cricket') === 'cricket'),
            completed: (completed.data || []).filter((m: any) => (m.sport || 'cricket') === 'cricket'),
            external: deduped,
        };
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["matches"],
        queryFn: fetchMatches,
        refetchInterval: 10000,
    });

    // Real-time updates via Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handleScoreUpdate = (update: any) => {
            queryClient.setQueryData(["matches"], (old: any) => {
                if (!old) return old;
                const updateList = (list: any[]) =>
                    list.map(m => (m._id === update._id || m.id === update.id ? { ...m, ...update } : m));
                const isExternal = update.source === "cricapi" || update.source === "thesportsdb";
                if (isExternal) {
                    return { ...old, external: updateList(old.external) };
                }
                return {
                    ...old,
                    live: updateList(old.live),
                    upcoming: updateList(old.upcoming),
                    completed: updateList(old.completed),
                };
            });
        };

        const handleStatusChange = () => refetch();

        socket.on("score:update", handleScoreUpdate);
        socket.on("match:status", handleStatusChange);
        return () => {
            socket.off("score:update", handleScoreUpdate);
            socket.off("match:status", handleStatusChange);
        };
    }, [socket, queryClient, refetch]);

    return {
        liveMatches: data?.live || [],
        upcomingMatches: data?.upcoming || [],
        completedMatches: data?.completed || [],
        externalMatches: data?.external || [],
        loading: isLoading,
        error,
    };
};
