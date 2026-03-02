export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  group_id: string;
  type: TransactionType;
  title: string;
  amount: number;
  paid_by: string;
  date: string;
  created_at: string;
}

/** @deprecated Use Transaction instead */
export type Expense = Transaction;

export interface RecentGroup {
  id: string;
  name: string;
  accessed_at: string;
}
