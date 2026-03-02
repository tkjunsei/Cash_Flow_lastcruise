"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExpenseFormProps {
    onSubmit: (data: {
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    }) => Promise<void>;
    initialData?: {
        title: string;
        amount: number;
        paid_by: string;
        date: string;
    };
    onCancel?: () => void;
    isEditing?: boolean;
}

export function ExpenseForm({
    onSubmit,
    initialData,
    onCancel,
    isEditing = false,
}: ExpenseFormProps) {
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-600">
                        用途 *
                    </Label>
                    <Input
                        id="title"
                        placeholder="例: ランチ代"
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
                        支払った人
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
                    className="min-w-[100px] bg-blue-500 hover:bg-blue-600 text-white transition-colors"
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
