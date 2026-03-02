import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/groups/[id]/transactions — グループの取引一覧取得
export async function GET(_request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    const { data, error } = await supabaseServer
        .from("transactions")
        .select("*")
        .eq("group_id", id)
        .order("date", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

// POST /api/groups/[id]/transactions — 取引追加
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { type, title, amount, paid_by, date } = body;

        // バリデーション
        if (!type || !["income", "expense"].includes(type)) {
            return NextResponse.json(
                { error: "種別は income または expense を指定してください" },
                { status: 400 }
            );
        }
        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return NextResponse.json(
                { error: "項目名は必須です" },
                { status: 400 }
            );
        }
        if (title.trim().length > 255) {
            return NextResponse.json(
                { error: "項目名は255文字以内にしてください" },
                { status: 400 }
            );
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { error: "金額は1以上の数値を指定してください" },
                { status: 400 }
            );
        }
        if (paid_by && typeof paid_by === "string" && paid_by.length > 100) {
            return NextResponse.json(
                { error: "タイプは100文字以内にしてください" },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from("transactions")
            .insert({
                group_id: id,
                type,
                title: title.trim(),
                amount,
                paid_by: paid_by?.trim() || "",
                date: date || new Date().toISOString().split("T")[0],
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "リクエストの処理に失敗しました" },
            { status: 500 }
        );
    }
}
