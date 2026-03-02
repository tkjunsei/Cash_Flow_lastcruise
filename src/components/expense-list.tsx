"use client";

import { useState } from "react";
import { Expense } from "@/types/database";
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
import { ExpenseForm } from "@/components/expense-form";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface ExpenseListProps {
    expenses: Expense[];
    onEdit: (
        id: string,
        data: { title: string; amount: number; paid_by: string; date: string }
    ) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    const handleEdit = async (data: {
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    }) => {
        if (!editingExpense) return;
        await onEdit(editingExpense.id, data);
        setEditingExpense(null);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await onDelete(id);
        } finally {
            setDeletingId(null);
        }
    };

    if (expenses.length === 0) {
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
                    まだ支出がありません
                </p>
                <p className="text-sm mt-1 text-slate-400">
                    上のフォームから支出を追加してみましょう
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
                            <TableHead className="font-semibold text-slate-600">
                                日付
                            </TableHead>
                            <TableHead className="font-semibold text-slate-600">
                                用途
                            </TableHead>
                            <TableHead className="font-semibold text-slate-600">
                                支払い者
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
                        {expenses.map((expense, index) => (
                            <TableRow
                                key={expense.id}
                                className={`group transition-colors hover:bg-blue-50/50 ${index % 2 === 1 ? "bg-slate-50/50" : ""
                                    }`}
                            >
                                <TableCell className="text-slate-500">
                                    {format(new Date(expense.date), "M/d (E)", { locale: ja })}
                                </TableCell>
                                <TableCell className="font-medium text-slate-800">
                                    {expense.title}
                                </TableCell>
                                <TableCell>
                                    {expense.paid_by ? (
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                            {expense.paid_by}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xs">未設定</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-mono font-semibold tabular-nums text-slate-800">
                                    ¥{expense.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingExpense(expense)}
                                            className="h-8 px-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            編集
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(expense.id)}
                                            disabled={deletingId === expense.id}
                                            className="h-8 px-2 text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                        >
                                            {deletingId === expense.id ? "..." : "削除"}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-500">
                        合計 {expenses.length} 件
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-slate-800">
                        ¥{totalAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            <Dialog
                open={!!editingExpense}
                onOpenChange={(open) => !open && setEditingExpense(null)}
            >
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800">支出を編集</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            支出の内容を修正できます。
                        </DialogDescription>
                    </DialogHeader>
                    {editingExpense && (
                        <ExpenseForm
                            onSubmit={handleEdit}
                            initialData={{
                                title: editingExpense.title,
                                amount: editingExpense.amount,
                                paid_by: editingExpense.paid_by,
                                date: editingExpense.date,
                            }}
                            onCancel={() => setEditingExpense(null)}
                            isEditing
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
