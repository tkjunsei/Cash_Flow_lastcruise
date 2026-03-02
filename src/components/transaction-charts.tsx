"use client";

import { useMemo } from "react";
import { Transaction } from "@/types/database";
import { CHART_COLORS } from "@/lib/colors";
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



interface TransactionChartsProps {
    transactions: Transaction[];
}

export function TransactionCharts({ transactions }: TransactionChartsProps) {
    const paidByData = useMemo(() => {
        const map = new Map<string, { income: number; expense: number }>();
        transactions.forEach((t) => {
            const key = t.paid_by || "未設定";
            const current = map.get(key) || { income: 0, expense: 0 };
            if (t.type === "income") {
                current.income += t.amount;
            } else {
                current.expense += t.amount;
            }
            map.set(key, current);
        });
        return Array.from(map.entries())
            .map(([name, vals]) => ({
                name,
                income: vals.income,
                expense: vals.expense,
            }))
            .sort((a, b) => b.expense + b.income - (a.expense + a.income));
    }, [transactions]);

    const expenseByPerson = useMemo(() => {
        const map = new Map<string, number>();
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                const key = t.paid_by || "未設定";
                map.set(key, (map.get(key) || 0) + t.amount);
            });
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const dailyData = useMemo(() => {
        const map = new Map<string, { income: number; expense: number }>();
        transactions.forEach((t) => {
            const day = t.date.substring(0, 10); // YYYY-MM-DD
            const current = map.get(day) || { income: 0, expense: 0 };
            if (t.type === "income") {
                current.income += t.amount;
            } else {
                current.expense += t.amount;
            }
            map.set(day, current);
        });
        return Array.from(map.entries())
            .map(([day, vals]) => ({
                day: day.substring(5).replace("-", "/"), // MM/DD形式
                income: vals.income,
                expense: vals.expense,
            }))
            .sort((a, b) => a.day.localeCompare(b.day));
    }, [transactions]);

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <p className="text-sm">
                    グラフを表示するにはデータを追加してください
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
            {/* 支出の人別 円グラフ */}
            {expenseByPerson.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        支出 — タイプ別 割合
                    </h3>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseByPerson}
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
                                    {expenseByPerson.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            stroke="transparent"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [
                                        `${Number(value).toLocaleString()}`,
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
            )}

            {/* 日別 収支 棒グラフ */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    日別 収支
                </h3>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any, name: any) => [
                                    `¥${Number(value).toLocaleString()}`,
                                    name === "income" ? "収入" : "支出",
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor: "#ffffff",
                                    color: "#1e293b",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                }}
                            />
                            <Legend
                                formatter={(value) => (value === "income" ? "収入" : "支出")}
                            />
                            <Bar
                                dataKey="income"
                                fill="#34d399"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="expense"
                                fill="#fb923c"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 人別 収入/支出 棒グラフ */}
            {paidByData.length > 0 && (
                <div className="space-y-3 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        タイプ別 収支
                    </h3>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={paidByData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 12, fill: "#64748b" }}
                                    tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: "#64748b" }}
                                    width={80}
                                />
                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any, name: any) => [
                                        `¥${Number(value).toLocaleString()}`,
                                        name === "income" ? "収入" : "支出",
                                    ]}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        backgroundColor: "#ffffff",
                                        color: "#1e293b",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                    }}
                                />
                                <Legend
                                    formatter={(value) =>
                                        value === "income" ? "収入" : "支出"
                                    }
                                />
                                <Bar
                                    dataKey="income"
                                    fill="#34d399"
                                    radius={[0, 6, 6, 0]}
                                    maxBarSize={30}
                                />
                                <Bar
                                    dataKey="expense"
                                    fill="#fb923c"
                                    radius={[0, 6, 6, 0]}
                                    maxBarSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
