export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export interface Expense {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  paid_by: string;
  date: string;
  created_at: string;
}

export interface RecentGroup {
  id: string;
  name: string;
  accessed_at: string;
}
