"use client";

import { useState, useMemo } from "react";
import { Transaction, TransactionType } from "@/types/database";
import { getColorMap } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction-form";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (
        id: string,
        data: {
            type: TransactionType;
            title: string;
            amount: number;
            paid_by: string;
            date: string;
        }
    ) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function TransactionList({
    transactions,
    onEdit,
    onDelete,
}: TransactionListProps) {
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

    // paid_by の値ごとにカラーマッピングを生成（円グラフと同じ色順）
    const colorMap = useMemo(() => {
        const keys = transactions.map((t) => t.paid_by || "未設定");
        return getColorMap(keys);
    }, [transactions]);

    const handleEdit = async (data: {
        type: TransactionType;
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    }) => {
        if (!editingTx) return;
        await onEdit(editingTx.id, data);
        setEditingTx(null);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await onDelete(id);
        } finally {
            setDeletingId(null);
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <svg
                    className="mb-4 h-16 w-16 opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                    />
                </svg>
                <p className="text-lg font-medium text-slate-500">
                    まだ記録がありません
                </p>
                <p className="text-sm mt-1 text-slate-400">
                    上のフォームから収入や支出を追加してみましょう
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold text-slate-600 w-[40px]">
                                収入or支出
                            </TableHead>
                            <TableHead className="font-semibold text-slate-600">
                                日付
                            </TableHead>
                            <TableHead className="font-semibold text-slate-600">
                                項目
                            </TableHead>
                            <TableHead className="font-semibold text-slate-600">
                                タイプ
                            </TableHead>
                            <TableHead className="text-right font-semibold text-slate-600">
                                金額
                            </TableHead>
                            <TableHead className="text-right font-semibold text-slate-600 w-[120px]">
                                操作
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx, index) => (
                            <TableRow
                                key={tx.id}
                                className={`group transition-colors hover:bg-blue-50/50 ${index % 2 === 1 ? "bg-slate-50/50" : ""
                                    }`}
                            >
                                <TableCell>
                                    {tx.type === "income" ? (
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50">
                                            <svg
                                                className="h-3.5 w-3.5 text-emerald-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2.5}
                                                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                                                />
                                            </svg>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-50">
                                            <svg
                                                className="h-3.5 w-3.5 text-rose-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2.5}
                                                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                                />
                                            </svg>
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {format(new Date(tx.date), "M/d (E)", { locale: ja })}
                                </TableCell>
                                <TableCell className="font-medium text-slate-800">
                                    {tx.title}
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const key = tx.paid_by || "未設定";
                                        const colors = colorMap.get(key);
                                        return (
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                style={{
                                                    backgroundColor: colors?.bg || "#f1f5f9",
                                                    color: colors?.main || "#64748b",
                                                }}
                                            >
                                                {key}
                                            </span>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell
                                    className={`text-right font-mono font-semibold tabular-nums ${tx.type === "income"
                                        ? "text-emerald-600"
                                        : "text-rose-500"
                                        }`}
                                >
                                    {tx.type === "income" ? "+" : "-"} ¥
                                    {tx.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingTx(tx)}
                                            className="h-8 px-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            編集
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(tx.id)}
                                            disabled={deletingId === tx.id}
                                            className="h-8 px-2 text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                        >
                                            {deletingId === tx.id ? "..." : "削除"}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-500">
                        合計 {transactions.length} 件
                    </span>
                    <div className="flex gap-4 items-center">
                        <span className="text-sm font-mono tabular-nums text-emerald-600">
                            +¥{totalIncome.toLocaleString()}
                        </span>
                        <span className="text-sm font-mono tabular-nums text-rose-500">
                            -¥{totalExpense.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <Dialog
                open={!!editingTx}
                onOpenChange={(open) => !open && setEditingTx(null)}
            >
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800">記録を編集</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            記録の内容を修正できます。
                        </DialogDescription>
                    </DialogHeader>
                    {editingTx && (
                        <TransactionForm
                            onSubmit={handleEdit}
                            initialData={{
                                type: editingTx.type,
                                title: editingTx.title,
                                amount: editingTx.amount,
                                paid_by: editingTx.paid_by,
                                date: editingTx.date,
                            }}
                            onCancel={() => setEditingTx(null)}
                            isEditing
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
