import { RecentGroup } from "@/types/database";

const STORAGE_KEY = "warikan-recent-groups";
const MAX_HISTORY = 10;

export function getRecentGroups(): RecentGroup[] {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addRecentGroup(id: string, name: string): void {
    if (typeof window === "undefined") return;
    try {
        const groups = getRecentGroups().filter((g) => g.id !== id);
        groups.unshift({ id, name, accessed_at: new Date().toISOString() });
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(groups.slice(0, MAX_HISTORY))
        );
    } catch {
        // localStorage unavailable
    }
}

export function removeRecentGroup(id: string): void {
    if (typeof window === "undefined") return;
    try {
        const groups = getRecentGroups().filter((g) => g.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch {
        // localStorage unavailable
    }
}
