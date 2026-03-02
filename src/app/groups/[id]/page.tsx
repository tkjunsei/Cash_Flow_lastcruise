"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Group, Transaction, TransactionType } from "@/types/database";
import { addRecentGroup } from "@/lib/history";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { TransactionCharts } from "@/components/transaction-charts";
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

export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<Group | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchGroup = useCallback(async () => {
        const res = await fetch(`/api/groups/${groupId}`);
        if (!res.ok) {
            setNotFound(true);
            setLoading(false);
            return;
        }
        const data = await res.json();
        setGroup(data);
        addRecentGroup(data.id, data.name);
    }, [groupId]);

    const fetchTransactions = useCallback(async () => {
        const res = await fetch(`/api/groups/${groupId}/transactions`);
        if (res.ok) {
            const data = await res.json();
            setTransactions(data);
        }
    }, [groupId]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchGroup(), fetchTransactions()]);
            setLoading(false);
        };
        loadData();
    }, [fetchGroup, fetchTransactions]);

    const handleAdd = async (data: {
        type: TransactionType;
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    }) => {
        const res = await fetch(`/api/groups/${groupId}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            toast.error("記録の追加に失敗しました");
            return;
        }

        toast.success(data.type === "income" ? "収入を追加しました" : "支出を追加しました");
        setShowAddForm(false);
        await fetchTransactions();
    };

    const handleEdit = async (
        id: string,
        data: {
            type: TransactionType;
            title: string;
            amount: number;
            paid_by: string;
            date: string;
        }
    ) => {
        const res = await fetch(`/api/groups/${groupId}/transactions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            toast.error("記録の更新に失敗しました");
            return;
        }

        toast.success("記録を更新しました");
        await fetchTransactions();
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/groups/${groupId}/transactions/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            toast.error("記録の削除に失敗しました");
            return;
        }

        toast.success("記録を削除しました");
        await fetchTransactions();
    };

    // 収支計算
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

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
                                収支を管理・共有しましょう
                            </p>
                        </div>
                    </div>
                    <ShareButton />
                </div>

                {/* ① サマリーパネル: 総収入・総支出・残高 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <svg
                                        className="h-4 w-4 text-emerald-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 11l5-5m0 0l5 5m-5-5v12"
                                        />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">総収入</p>
                            </div>
                            <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-2">
                                ¥{totalIncome.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                    <svg
                                        className="h-4 w-4 text-rose-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                        />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">総支出</p>
                            </div>
                            <p className="text-2xl font-bold font-mono tabular-nums text-rose-500 mt-2">
                                ¥{totalExpense.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${balance >= 0 ? "bg-blue-50" : "bg-red-50"
                                        }`}
                                >
                                    <svg
                                        className={`h-4 w-4 ${balance >= 0 ? "text-blue-500" : "text-red-500"
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                        />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">残高</p>
                            </div>
                            <p
                                className={`text-2xl font-bold font-mono tabular-nums mt-2 ${balance >= 0 ? "text-blue-600" : "text-red-500"
                                    }`}
                            >
                                {balance < 0 ? "-" : ""}¥
                                {Math.abs(balance).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 記録を追加 */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-slate-800">
                                    記録を追加
                                </CardTitle>
                                <CardDescription className="text-slate-500">
                                    収入または支出を記録します
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
                            <TransactionForm onSubmit={handleAdd} />
                        </CardContent>
                    )}
                </Card>

                {/* グラフ */}
                <TransactionCharts transactions={transactions} />

                {/* 一覧 */}
                <TransactionList
                    transactions={transactions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </main>
    );
}
