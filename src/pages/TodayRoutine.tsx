import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useRoutineStore from "@/store/routineStore";
import { Check, Circle, Undo2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskDuration } from "@/types/routine";
import { toast } from "sonner";

const DURATION_OPTIONS = ["2days", "3days", "4days", "5days", "6days", "7days", "30days", "custom"] as const;
type DurationOption = typeof DURATION_OPTIONS[number];

const TodayRoutine = () => {
  const [todayTaskTitle, setTodayTaskTitle] = useState("");
  const [longTermTaskTitle, setLongTermTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDuration, setTaskDuration] = useState<TaskDuration>("2days");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [customDays, setCustomDays] = useState<number>(2);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>("2days");

  const {
    routines,
    selectedRoutine,
    selectRoutine,
    todayNotes,
    updateTodayNotes,
    stats,
    updateStats,
    tasks,
    addTask,
    completeTask,
    deleteTask,
  } = useRoutineStore();

  const handleRoutineSelect = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (routine) {
      selectRoutine(routine);
      toast.success("Routine selected for today");
    }
  };

  const handleTaskComplete = (taskId: string, isComplete: boolean, isNeutral: boolean) => {
    if (!selectedRoutine) return;

    const currentTask = selectedRoutine.tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const updatedTasks = selectedRoutine.tasks.map((task) =>
      task.id === taskId
        ? { ...task, isComplete, isNeutral }
        : task
    );

    const routine = { ...selectedRoutine, tasks: updatedTasks };
    selectRoutine(routine);

    const today = format(new Date(), 'yyyy-MM-dd');
    const existingEntry = stats.habitHistory.find(entry => entry.date === today);
    
    let newHabitHistory = [...stats.habitHistory];
    
    if (existingEntry) {
      newHabitHistory = stats.habitHistory.map(entry => {
        if (entry.date === today) {
          return {
            ...entry,
            habits: entry.habits.map(habit => {
              if (habit.name === currentTask.habit) {
                const status: "completed" | "neutral" | "failed" = 
                  isComplete ? 'completed' : isNeutral ? 'neutral' : 'failed';
                return {
                  ...habit,
                  status
                };
              }
              return habit;
            })
          };
        }
        return entry;
      });
    } else {
      const status: "completed" | "neutral" | "failed" = 
        isComplete ? 'completed' : isNeutral ? 'neutral' : 'failed';
      
      newHabitHistory.push({
        date: today,
        routineName: selectedRoutine.name,
        habits: selectedRoutine.tasks.map(task => ({
          name: task.habit,
          streak: 0,
          status: task.id === taskId ? status : 'failed'
        }))
      });
    }

    updateStats({
      ...stats,
      habitHistory: newHabitHistory
    });
  };

  const handleTaskUndo = (taskId: string) => {
    if (!selectedRoutine) return;

    const currentTask = selectedRoutine.tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const updatedTasks = selectedRoutine.tasks.map((task) =>
      task.id === taskId
        ? { ...task, isComplete: false, isNeutral: false }
        : task
    );

    const routine = { ...selectedRoutine, tasks: updatedTasks };
    selectRoutine(routine);

    const today = format(new Date(), 'yyyy-MM-dd');
    const newHabitHistory = stats.habitHistory.map(entry => {
      if (entry.date === today) {
        return {
          ...entry,
          habits: entry.habits.map(habit => {
            if (habit.name === currentTask.habit) {
              return {
                ...habit,
                status: 'failed' as const
              };
            }
            return habit;
          })
        };
      }
      return entry;
    });

    updateStats({
      ...stats,
      habitHistory: newHabitHistory
    });
  };

  const handleAddTodayTask = () => {
    if (!todayTaskTitle.trim()) return;
    
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    
    addTask({
      id: uuidv4(),
      title: todayTaskTitle,
      duration: "today",
      createdAt: new Date(),
      dueDate: now,
      completed: false,
    });

    setTodayTaskTitle("");
  };

  const handleAddLongTermTask = () => {
    if (!longTermTaskTitle.trim()) return;
    
    const now = new Date();
    
    const duration = selectedDuration === "custom" 
      ? `${customDays}days` as TaskDuration
      : selectedDuration;
    
    addTask({
      id: uuidv4(),
      title: longTermTaskTitle,
      duration,
      createdAt: now,
      dueDate: selectedDate || now,
      completed: false,
      description: taskDescription.trim() || undefined,
    });

    setLongTermTaskTitle("");
    setTaskDescription("");
  };

  const handleResetToday = () => {
    if (selectedRoutine) {
      const resetRoutine = {
        ...selectedRoutine,
        tasks: selectedRoutine.tasks.map(task => ({
          ...task,
          isComplete: false,
          isNeutral: false
        }))
      };
      selectRoutine(null);
    }

    updateStats({
      currentStreak: 0,
      neutralDays: Math.max(0, stats.neutralDays - 1)
    });

    toast.success("Day reset successfully. Please select a new routine.");
  };

  const handleDurationChange = (value: DurationOption) => {
    setSelectedDuration(value);
    if (value === "custom") {
      setTaskDuration(`${customDays}days` as TaskDuration);
    } else {
      setTaskDuration(value as TaskDuration);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Today's Routine</h1>
          <p className="text-gray-500">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleResetToday}
          className="hover:bg-red-100"
        >
          Reset Day
        </Button>
      </div>

      <div className="space-y-4">
        <Select
          onValueChange={handleRoutineSelect}
          value={selectedRoutine?.id}
          disabled={selectedRoutine !== null}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedRoutine ? "Routine selected for today" : "Choose a routine"} />
          </SelectTrigger>
          <SelectContent>
            {routines.map((routine) => (
              <SelectItem key={routine.id} value={routine.id}>
                {routine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!selectedRoutine && (
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-800">
              Please select a routine for today to get started
            </p>
          </Card>
        )}

        <div className="grid gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <Textarea
              placeholder="Add notes..."
              value={todayNotes.permanent}
              onChange={(e) =>
                updateTodayNotes({ permanent: e.target.value })
              }
              className="mb-2"
            />
            <Textarea
              placeholder="Temporary notes (24h)..."
              value={todayNotes.temporary}
              onChange={(e) =>
                updateTodayNotes({ temporary: e.target.value })
              }
            />
          </Card>
        </div>

        {selectedRoutine && (
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">
              {selectedRoutine.name}
            </h2>
            <div className="space-y-4">
              {selectedRoutine.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col space-y-4 p-4 bg-white rounded-lg border"
                >
                  <div className="space-y-2">
                    <h3 className="font-medium">{task.habit}</h3>
                    <p className="text-sm text-gray-500">
                      {`${task.time.hour}:${task.time.minute
                        .toString()
                        .padStart(2, "0")} ${task.time.timezone}`}
                    </p>
                    {task.notes && (
                      <p className="text-sm text-gray-600">{task.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() =>
                        handleTaskComplete(task.id, true, false)
                      }
                      className={`p-2 rounded-full transition-colors ${
                        task.isComplete
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      disabled={task.isNeutral}
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleTaskComplete(task.id, false, true)
                      }
                      className={`p-2 rounded-full transition-colors ${
                        task.isNeutral
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      disabled={task.isComplete}
                    >
                      <Circle size={20} />
                    </button>
                    {(task.isComplete || task.isNeutral) && (
                      <button
                        onClick={() => handleTaskUndo(task.id)}
                        className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                      >
                        <Undo2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Today's Tasks</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a task for today..."
                value={todayTaskTitle}
                onChange={(e) => setTodayTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && todayTaskTitle.trim()) {
                    handleAddTodayTask();
                  }
                }}
              />
              <Button onClick={handleAddTodayTask}>Add</Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {tasks
                .filter(task => task.duration === "today")
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className={task.completed ? "line-through" : ""}>
                      {task.title}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => completeTask(task.id)}
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-red-500 hover:bg-gray-200"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Long-term Tasks</h3>
          <div className="space-y-4">
            <div className="grid gap-4">
              <Input
                placeholder="Task title..."
                value={longTermTaskTitle}
                onChange={(e) => setLongTermTaskTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <Select
                  value={selectedDuration}
                  onValueChange={handleDurationChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2days">2 days</SelectItem>
                    <SelectItem value="3days">3 days</SelectItem>
                    <SelectItem value="4days">4 days</SelectItem>
                    <SelectItem value="5days">5 days</SelectItem>
                    <SelectItem value="6days">6 days</SelectItem>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="custom">Custom days</SelectItem>
                  </SelectContent>
                </Select>
                {selectedDuration === "custom" && (
                  <Input
                    type="number"
                    min="2"
                    max="60"
                    value={customDays}
                    onChange={(e) => {
                      const value = Math.max(2, Math.min(60, parseInt(e.target.value) || 2));
                      setCustomDays(value);
                      setTaskDuration(`${value}days` as TaskDuration);
                    }}
                    className="w-24"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <Input
                    placeholder="Description (optional)"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddLongTermTask}>Add</Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {tasks
                .filter(task => task.duration !== "today")
                .map(task => (
                  <div key={task.id} className="p-2 bg-gray-50 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={task.completed ? "line-through" : ""}>
                        {task.title}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => completeTask(task.id)}
                          className="p-1 rounded hover:bg-gray-200"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 rounded text-red-500 hover:bg-gray-200"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TodayRoutine;
