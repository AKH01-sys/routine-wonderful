
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Routine, RoutineTask, Task, HabitHistoryEntry } from '@/types/routine';
import { type ThemeName } from "@/types/theme";

interface RoutineState {
  routines: Routine[];
  selectedRoutine: Routine | null;
  todayNotes: {
    permanent: string;
    temporary: string;
  };
  stats: {
    streaks: number;
    currentStreak: number;
    routineStreak: number;
    neutralDays: number;
    dayOff: {
      used: number;
      limit: number;
      lastUpdated: Date;
      usedToday: boolean;
    };
    habitHistory: HabitHistoryEntry[];
  };
  tasks: Task[];
  addRoutine: (routine: Routine) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;
  selectRoutine: (routine: Routine | null) => void;
  updateTodayNotes: (notes: { permanent?: string; temporary?: string }) => void;
  updateStats: (statsUpdate: Partial<RoutineState['stats']>) => void;
  addTask: (task: Task) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const useRoutineStore = create<RoutineState>()(
  persist(
    (set) => ({
      routines: [],
      selectedRoutine: null,
      todayNotes: {
        permanent: '',
        temporary: '',
      },
      stats: {
        streaks: 0,
        currentStreak: 0,
        routineStreak: 0,
        neutralDays: 0,
        dayOff: {
          used: 0,
          limit: 3,
          lastUpdated: new Date(),
          usedToday: false,
        },
        habitHistory: [],
      },
      tasks: [],
      addRoutine: (routine) =>
        set((state) => ({ routines: [...state.routines, routine] })),
      updateRoutine: (routine) =>
        set((state) => ({
          routines: state.routines.map((r) => (r.id === routine.id ? routine : r)),
        })),
      deleteRoutine: (routineId) =>
        set((state) => ({
          routines: state.routines.filter((routine) => routine.id !== routineId),
          selectedRoutine:
            state.selectedRoutine?.id === routineId ? null : state.selectedRoutine,
        })),
      selectRoutine: (routine) => set({ selectedRoutine: routine }),
      updateTodayNotes: (notes) =>
        set((state) => ({
          todayNotes: { ...state.todayNotes, ...notes },
        })),
      updateStats: (statsUpdate) =>
        set((state) => {
          const newStats = { ...state.stats, ...statsUpdate };
          
          if (statsUpdate.habitHistory) {
            const sortedHistory = [...statsUpdate.habitHistory].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            let currentStreak = 0;
            let routineStreak = 0;
            
            for (const entry of sortedHistory) {
              const allComplete = entry.habits.every(h => 
                h.status === 'completed' || h.status === 'neutral'
              );
              
              if (allComplete) {
                routineStreak++;
              } else {
                break;
              }
            }
            
            newStats.routineStreak = routineStreak;
          }
          
          return { stats: newStats };
        }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      completeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: true } : task
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      theme: "simple" as ThemeName,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'routine-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key: string, value: any) => {
          // Handle Date objects during deserialization
          if (
            typeof value === 'string' && 
            (key === 'lastUpdated' || key === 'createdAt' || key === 'updatedAt' || key === 'dueDate')
          ) {
            return new Date(value);
          }
          return value;
        },
        replacer: (key: string, value: any) => {
          // Handle Date objects during serialization
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        },
      })
    }
  )
);

export default useRoutineStore;
