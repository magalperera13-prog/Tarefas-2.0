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
  renewal_type: "fixed_day" | "payment_date";
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  user_id: string;
  subscription_id: string;
  month_key: string; // 'YYYY-MM'
  paid_date: string; // 'yyyy-MM-dd'
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStats {
  totalMonthly: number;
  totalPaidThisMonth: number;
  totalYearlyEstimate: number;
}

export interface Balance {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  created_at: string;
  updated_at: string;
}
