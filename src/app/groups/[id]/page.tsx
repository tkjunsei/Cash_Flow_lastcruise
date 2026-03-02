"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Group, Expense } from "@/types/database";
import { addRecentGroup } from "@/lib/history";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { ExpenseCharts } from "@/components/expense-charts";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

type TabType = "list" | "chart";

export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<Group | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("list");
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchGroup = useCallback(async () => {
        const { data, error } = await supabase
            .from("groups")
            .select("*")
            .eq("id", groupId)
            .single();

        if (error || !data) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        setGroup(data);
        addRecentGroup(data.id, data.name);
    }, [groupId]);

    const fetchExpenses = useCallback(async () => {
        const { data, error } = await supabase
            .from("expenses")
            .select("*")
            .eq("group_id", groupId)
            .order("date", { ascending: false });

        if (!error && data) {
            setExpenses(data);
        }
    }, [groupId]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchGroup(), fetchExpenses()]);
            setLoading(false);
        };
        loadData();
    }, [fetchGroup, fetchExpenses]);

    const handleAddExpense = async (data: {
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    }) => {
        const { error } = await supabase.from("expenses").insert({
            group_id: groupId,
            ...data,
        });

        if (error) {
            toast.error("支出の追加に失敗しました");
            return;
        }

        toast.success("支出を追加しました");
        setShowAddForm(false);
        await fetchExpenses();
    };

    const handleEditExpense = async (
        id: string,
        data: { title: string; amount: number; paid_by: string; date: string }
    ) => {
        const { error } = await supabase
            .from("expenses")
            .update(data)
            .eq("id", id);

        if (error) {
            toast.error("支出の更新に失敗しました");
            return;
        }

        toast.success("支出を更新しました");
        await fetchExpenses();
    };

    const handleDeleteExpense = async (id: string) => {
        const { error } = await supabase.from("expenses").delete().eq("id", id);

        if (error) {
            toast.error("支出の削除に失敗しました");
            return;
        }

        toast.success("支出を削除しました");
        await fetchExpenses();
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
                    <p className="text-sm text-slate-500">読み込み中...</p>
                </div>
            </main>
        );
    }

    if (notFound) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50">
                        <svg
                            className="h-8 w-8 text-rose-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">
                        グループが見つかりません
                    </h1>
                    <p className="text-slate-500 text-sm">
                        URLが正しくないか、グループが削除された可能性があります。
                    </p>
                    <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="border-slate-200"
                    >
                        トップページへ戻る
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
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
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                                {group?.name}
                            </h1>
                            <p className="text-sm text-slate-500">
                                支出を管理・共有しましょう
                            </p>
                        </div>
                    </div>
                    <ShareButton />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-slate-500 font-medium">合計支出</p>
                            <p className="text-2xl font-bold font-mono tabular-nums text-slate-800 mt-1">
                                ¥{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-slate-500 font-medium">件数</p>
                            <p className="text-2xl font-bold font-mono tabular-nums text-slate-800 mt-1">
                                {expenses.length}
                                <span className="text-sm text-slate-400 ml-1">件</span>
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs text-slate-500 font-medium">メンバー</p>
                            <p className="text-2xl font-bold font-mono tabular-nums text-slate-800 mt-1">
                                {new Set(expenses.map((e) => e.paid_by).filter(Boolean)).size}
                                <span className="text-sm text-slate-400 ml-1">人</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Expense */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-slate-800">
                                    支出を追加
                                </CardTitle>
                                <CardDescription className="text-slate-500">
                                    新しい支出を記録します
                                </CardDescription>
                            </div>
                            <Button
                                variant={showAddForm ? "outline" : "default"}
                                size="sm"
                                onClick={() => setShowAddForm(!showAddForm)}
                                className={
                                    !showAddForm
                                        ? "bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                        : "border-slate-200 text-slate-600"
                                }
                            >
                                {showAddForm ? "閉じる" : "+ 追加"}
                            </Button>
                        </div>
                    </CardHeader>
                    {showAddForm && (
                        <CardContent>
                            <ExpenseForm onSubmit={handleAddExpense} />
                        </CardContent>
                    )}
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit">
                    <button
                        onClick={() => setActiveTab("list")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "list"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        一覧
                    </button>
                    <button
                        onClick={() => setActiveTab("chart")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "chart"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        グラフ
                    </button>
                </div>

                {/* Content */}
                {activeTab === "list" ? (
                    <ExpenseList
                        expenses={expenses}
                        onEdit={handleEditExpense}
                        onDelete={handleDeleteExpense}
                    />
                ) : (
                    <ExpenseCharts expenses={expenses} />
                )}
            </div>
        </main>
    );
}
