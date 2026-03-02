-- ============================================
-- 共有型収支管理アプリ データベーススキーマ
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
-- transactions テーブル（旧 expenses）
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  paid_by TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- group_id でのインデックス
CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON transactions(group_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- groups: 全操作を許可
CREATE POLICY "Allow all operations on groups"
  ON groups FOR ALL
  USING (true)
  WITH CHECK (true);

-- transactions: 全操作を許可
CREATE POLICY "Allow all operations on transactions"
  ON transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- マイグレーション: 既存の expenses テーブルがある場合
-- ============================================
-- 以下を手動で実行して既存データをマイグレーションしてください:
--
-- ALTER TABLE expenses RENAME TO transactions;
-- ALTER TABLE transactions ADD COLUMN type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense'));
-- DROP INDEX IF EXISTS idx_expenses_group_id;
-- CREATE INDEX idx_transactions_group_id ON transactions(group_id);
