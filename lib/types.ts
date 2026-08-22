export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  user_id: string;
  title: string;
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
