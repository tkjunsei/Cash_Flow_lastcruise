# 💰 収支管理 — 共有型家計簿アプリ

ログイン不要・URL共有だけで複数人が収入と支出を記録・可視化できるWebアプリケーション。

🔗 **デモ**: [cashflowlastcruise.vercel.app](https://cashflowlastcruise.vercel.app)

## 主な機能

- **グループ作成** — グループ名を入力するだけでUUID付きの専用ページを生成
- **収入/支出の記録** — タブ切り替えで収入・支出を簡単に入力（CRUD対応）
- **サマリーパネル** — 総収入・総支出・残高をリアルタイム表示
- **グラフ可視化** — タイプ別円グラフ、日別・担当者別の収支棒グラフ（Recharts）
- **URL共有** — ワンクリックでURLをクリップボードにコピー
- **閲覧履歴** — localStorageで最近見たグループを記憶

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| グラフ | Recharts |
| データベース | Supabase (PostgreSQL) |
| ホスティング | Vercel |

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/tkjunsei/Cash_Flow_lastcruise.git
cd Cash_Flow_lastcruise
npm install
```

### 2. Supabaseプロジェクトの準備

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. SQL Editorで `supabase/schema.sql` の内容を実行
3. **Settings → API** からURLとAnon Keyをコピー

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## デプロイ

```bash
npm i -g vercel
vercel --prod
```

> Vercelダッシュボードの **Settings → Environment Variables** に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定してください。

## プロジェクト構成

```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # トップページ（グループ作成）
│   ├── globals.css         # グローバルCSS
│   └── groups/[id]/
│       └── page.tsx        # グループ専用ページ
├── components/
│   ├── transaction-form.tsx    # 収入/支出入力フォーム
│   ├── transaction-list.tsx    # 取引一覧テーブル
│   ├── transaction-charts.tsx  # グラフコンポーネント
│   ├── share-button.tsx        # URLコピーボタン
│   ├── recent-groups.tsx       # 最近見たグループ一覧
│   └── ui/                     # shadcn/ui コンポーネント
├── lib/
│   ├── supabase.ts         # Supabaseクライアント
│   ├── history.ts          # localStorage操作
│   └── colors.ts           # 共有カラーパレット
└── types/
    └── database.ts         # 型定義
```

## ライセンス

MIT
