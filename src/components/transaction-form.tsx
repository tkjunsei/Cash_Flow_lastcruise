"use client";

import { useState } from "react";
import { TransactionType } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransactionFormProps {
    onSubmit: (data: {
        type: TransactionType;
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    }) => Promise<void>;
    initialData?: {
        type: TransactionType;
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    };
    onCancel?: () => void;
    isEditing?: boolean;
}

export function TransactionForm({
    onSubmit,
    initialData,
    onCancel,
    isEditing = false,
}: TransactionFormProps) {
    const [type, setType] = useState<TransactionType>(
        initialData?.type ?? "expense"
    );
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [amount, setAmount] = useState(
        initialData?.amount ? String(initialData.amount) : ""
    );
    const [paidBy, setPaidBy] = useState(initialData?.paid_by ?? "");
    const [date, setDate] = useState(
        initialData?.date ?? new Date().toISOString().split("T")[0]
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !amount || Number(amount) <= 0) return;

        setLoading(true);
        try {
            await onSubmit({
                type,
                title: title.trim(),
                amount: Number(amount),
                paid_by: paidBy.trim(),
                date,
            });
            if (!isEditing) {
                setTitle("");
                setAmount("");
                setPaidBy("");
                setDate(new Date().toISOString().split("T")[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* 収入/支出 タブ切り替え */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit">
                <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${type === "income"
                            ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-200"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <span className="flex items-center gap-1.5">
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
                                d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                        </svg>
                        収入
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${type === "expense"
                            ? "bg-orange-50 text-orange-600 shadow-sm border border-orange-200"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <span className="flex items-center gap-1.5">
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
                                d="M17 13l-5 5m0 0l-5-5m5 5V6"
                            />
                        </svg>
                        支出
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-600">
                        項目名 *
                    </Label>
                    <Input
                        id="title"
                        placeholder={type === "income" ? "例: 給料" : "例: ランチ代"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount" className="text-slate-600">
                        金額 (円) *
                    </Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="例: 1500"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="paid_by" className="text-slate-600">
                        {type === "income" ? "受取人" : "支払った人"}
                    </Label>
                    <Input
                        id="paid_by"
                        placeholder="例: 太郎"
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        className="border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-600">
                        日付 *
                    </Label>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-slate-200 text-slate-600"
                    >
                        キャンセル
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={loading}
                    className={`min-w-[100px] text-white transition-colors ${type === "income"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-orange-500 hover:bg-orange-600"
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            保存中...
                        </span>
                    ) : isEditing ? (
                        "更新"
                    ) : (
                        "追加"
                    )}
                </Button>
            </div>
        </form>
    );
}
