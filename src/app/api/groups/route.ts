import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/groups — グループ作成
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "グループ名は必須です" },
                { status: 400 }
            );
        }

        if (name.trim().length > 100) {
            return NextResponse.json(
                { error: "グループ名は100文字以内にしてください" },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from("groups")
            .insert({ name: name.trim() })
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
