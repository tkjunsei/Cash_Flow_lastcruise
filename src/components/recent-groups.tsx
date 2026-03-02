"use client";

import { useEffect, useState } from "react";
import { RecentGroup } from "@/types/database";
import { getRecentGroups, removeRecentGroup } from "@/lib/history";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function RecentGroups() {
    const [groups, setGroups] = useState<RecentGroup[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setGroups(getRecentGroups());
    }, []);

    if (!mounted || groups.length === 0) return null;

    const handleRemove = (id: string) => {
        removeRecentGroup(id);
        setGroups(getRecentGroups());
    };

    return (
        <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                最近見たグループ
            </h2>
            <div className="space-y-2">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm"
                    >
                        <Link href={`/groups/${group.id}`} className="flex-1 min-w-0">
                            <p className="font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                {group.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {formatDistanceToNow(new Date(group.accessed_at), {
                                    addSuffix: true,
                                    locale: ja,
                                })}
                            </p>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemove(group.id);
                            }}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
