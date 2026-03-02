"use client";

import { useMemo } from "react";
import { Expense } from "@/types/database";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

/* パステル調・くすみカラーのグラフパレット */
const COLORS = [
    "#60a5fa", /* soft blue */
    "#34d399", /* soft green */
    "#fbbf24", /* soft yellow */
    "#a78bfa", /* soft purple */
    "#fb923c", /* soft orange */
    "#38bdf8", /* soft cyan */
    "#f472b6", /* soft pink */
    "#4ade80", /* soft lime */
];

interface ExpenseChartsProps {
    expenses: Expense[];
}

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
    const paidByData = useMemo(() => {
        const map = new Map<string, number>();
        expenses.forEach((e) => {
            const key = e.paid_by || "未設定";
            map.set(key, (map.get(key) || 0) + e.amount);
        });
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const monthlyData = useMemo(() => {
        const map = new Map<string, number>();
        expenses.forEach((e) => {
            const month = e.date.substring(0, 7); // YYYY-MM
            map.set(month, (map.get(month) || 0) + e.amount);
        });
        return Array.from(map.entries())
            .map(([month, amount]) => ({
                month: month.replace("-", "/"),
                amount,
            }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }, [expenses]);

    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <p className="text-sm">
                    グラフを表示するには支出データを追加してください
                </p>
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderCustomLabel = (props: any) => {
        const { name, percent } = props as { name: string; percent: number };
        if (percent < 0.05) return null;
        return `${name} (${(percent * 100).toFixed(0)}%)`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 支払い者別 円グラフ */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    支払い者別 割合
                </h3>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paidByData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={50}
                                paddingAngle={2}
                                label={renderCustomLabel}
                                labelLine={true}
                            >
                                {paidByData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="transparent"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any) => [
                                    `¥${Number(value).toLocaleString()}`,
                                    "金額",
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor: "#ffffff",
                                    color: "#1e293b",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 月別 棒グラフ */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    月別 支出額
                </h3>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: "#64748b" }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any) => [
                                    `¥${Number(value).toLocaleString()}`,
                                    "合計",
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor: "#ffffff",
                                    color: "#1e293b",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                fill="#60a5fa"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
