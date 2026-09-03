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

export type SubscriptionStatus = "active" | "inactive";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  monthly_amount: number;
  due_day_label: string | null;
  status: SubscriptionStatus;
  observation: string | null;
  /** 'fixed_day': due_day_label é a referência. 'payment_date': o vencimento se baseia em last_paid_date. */
  renewal_type: "fixed_day" | "payment_date";
  /** Data (yyyy-MM-dd, America/Sao_Paulo) do último pagamento registrado. */
  last_paid_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStats {
  totalMonthly: number;
  totalPaidThisMonth: number;
  totalYearlyEstimate: number;
}
