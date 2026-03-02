"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RecentGroups } from "@/components/recent-groups";
import { toast } from "sonner";

export default function HomePage() {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert({ name: groupName.trim() })
        .select()
        .single();

      if (error) throw error;
      router.push(`/groups/${data.id}`);
    } catch {
      toast.error("グループの作成に失敗しました", {
        description: "ネットワーク接続を確認してください。",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-500 shadow-md shadow-blue-500/20 mb-2">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            収支管理
          </h1>
          <p className="text-slate-500 leading-relaxed">
            ログイン不要。URLを共有するだけで
            <br />
            みんなの収支をかんたんに管理。
          </p>
        </div>

        {/* Create Group Card */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="group-name"
                  className="text-sm font-medium text-slate-600"
                >
                  グループ名
                </label>
                <Input
                  id="group-name"
                  placeholder="例: 2025年 沖縄旅行"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-12 text-base border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !groupName.trim()}
                className="w-full h-12 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    作成中...
                  </span>
                ) : (
                  "グループを作成"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Groups */}
        <RecentGroups />

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          © 2026 収支管理 — 共有型家計簿アプリ
        </p>
      </div>
    </main>
  );
}
