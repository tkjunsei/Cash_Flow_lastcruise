import { createClient } from "@supabase/supabase-js";

// サーバーサイド専用 Supabase クライアント
// NEXT_PUBLIC_ プレフィックスを外すことでクライアントバンドルに含まれない
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not found in environment variables.");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
