import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/groups/[id] — グループ取得
export async function GET(_request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    const { data, error } = await supabaseServer
        .from("groups")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: "グループが見つかりません" },
            { status: 404 }
        );
    }

    return NextResponse.json(data);
}
