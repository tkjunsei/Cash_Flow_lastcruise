import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string; txId: string }>;
}

// PUT /api/groups/[id]/transactions/[txId] — 取引更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id, txId } = await params;

    try {
        const body = await request.json();
        const { type, title, amount, paid_by, date } = body;

        // バリデーション
        if (type && !["income", "expense"].includes(type)) {
            return NextResponse.json(
                { error: "種別は income または expense を指定してください" },
                { status: 400 }
            );
        }
        if (title && title.trim().length > 255) {
            return NextResponse.json(
                { error: "項目名は255文字以内にしてください" },
                { status: 400 }
            );
        }
        if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
            return NextResponse.json(
                { error: "金額は1以上の数値を指定してください" },
                { status: 400 }
            );
        }
        if (paid_by && paid_by.length > 100) {
            return NextResponse.json(
                { error: "タイプは100文字以内にしてください" },
                { status: 400 }
            );
        }

        // group_idスコープで更新（他グループの取引を更新できないようにする）
        const { data, error } = await supabaseServer
            .from("transactions")
            .update({
                ...(type && { type }),
                ...(title && { title: title.trim() }),
                ...(amount && { amount }),
                ...(paid_by !== undefined && { paid_by: paid_by.trim() }),
                ...(date && { date }),
            })
            .eq("id", txId)
            .eq("group_id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "リクエストの処理に失敗しました" },
            { status: 500 }
        );
    }
}

// DELETE /api/groups/[id]/transactions/[txId] — 取引削除
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const { id, txId } = await params;

    const { error } = await supabaseServer
        .from("transactions")
        .delete()
        .eq("id", txId)
        .eq("group_id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
