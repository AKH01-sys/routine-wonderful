
export type TimeZone = "IST";

export interface RoutineTime {
  hour: number;
  minute: number;
  timezone: TimeZone;
}

export type TaskDuration = "today" | "2days" | "3days" | "4days" | "5days" | "6days" | "7days" | "30days" | `${number}days`;

export interface Task {
  id: string;
  title: string;
  duration: TaskDuration;
  createdAt: Date;
  dueDate: Date;
  completed: boolean;
  description?: string;
}

export interface RoutineTask {
  id: string;
  habit: string;
  time: RoutineTime;
  notes: string;
  isComplete: boolean;
  isNeutral: boolean;
}

export interface Routine {
  id: string;
  name: string;
  tasks: RoutineTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DayOffStats {
  used: number;
  limit: number;
  lastUpdated: Date;
  usedToday: boolean;
}

export interface HabitHistoryEntry {
  date: string;
  routineName: string;
  habits: Array<{
    name: string;
    streak: number;
    status: 'completed' | 'neutral' | 'failed';
  }>;
}

export interface Stats {
  streaks: number;
  currentStreak: number;
  routineStreak: number;
  dayOff: DayOffStats;
  neutralDays: number;
  habitHistory: HabitHistoryEntry[];
}
