export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  task_date: string; // yyyy-MM-dd, no fuso America/Sao_Paulo
  created_at: string; // timestamptz ISO
  completed_at: string | null;
  updated_at: string;
}

export interface DashboardStats {
  today: number;
  completedToday: number;
  pendingToday: number;
  completedThisMonth: number;
}

export type HistoryFilter = "all" | "completed" | "pending";

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  expense_date: string; // yyyy-MM-dd, no fuso America/Sao_Paulo
  created_at: string;
  updated_at: string;
}

export interface ExpenseStats {
  totalToday: number;
  totalThisMonth: number;
  averagePerDay: number;
}
