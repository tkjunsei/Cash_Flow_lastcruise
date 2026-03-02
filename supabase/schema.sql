-- ============================================
-- 共有型家計簿アプリ データベーススキーマ
-- ============================================

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- groups テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- expenses テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  paid_by TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- group_id でのインデックス
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- 認証不要: anon ユーザーに全操作を許可
-- グループIDを知っている人のみアクセスできるURLベースのセキュリティモデル

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- groups: 全操作を許可
CREATE POLICY "Allow all operations on groups"
  ON groups FOR ALL
  USING (true)
  WITH CHECK (true);

-- expenses: 全操作を許可
CREATE POLICY "Allow all operations on expenses"
  ON expenses FOR ALL
  USING (true)
  WITH CHECK (true);
