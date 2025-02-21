import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Clock } from "lucide-react";
import useRoutineStore from "@/store/routineStore";
import { v4 as uuidv4 } from "uuid";
import type { Routine, RoutineTask } from "@/types/routine";

interface HabitInput {
  habit: string;
  time: string;
}

const ManageRoutines = () => {
  const { routines, addRoutine, updateRoutine, deleteRoutine } = useRoutineStore();
  const [routineName, setRoutineName] = useState("");
  const [habits, setHabits] = useState<HabitInput[]>([]);
  const [currentHabit, setCurrentHabit] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const handleAddHabit = () => {
    if (!currentHabit.trim() || !currentTime) return;
    
    setHabits([...habits, { 
      habit: currentHabit,
      time: currentTime
    }]);
    setCurrentHabit("");
    setCurrentTime("");
  };

  const handleRemoveHabit = (index: number) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setRoutineName(routine.name);
    setHabits(routine.tasks.map(task => ({
      habit: task.habit,
      time: `${task.time.hour.toString().padStart(2, '0')}:${task.time.minute.toString().padStart(2, '0')}`
    })));
  };

  const handleSaveRoutine = () => {
    if (!routineName || habits.length === 0) return;

    const tasks: RoutineTask[] = habits.map(habit => ({
      id: editingRoutine ? editingRoutine.tasks[0]?.id || uuidv4() : uuidv4(),
      habit: habit.habit,
      time: {
        hour: parseInt(habit.time.split(":")[0]),
        minute: parseInt(habit.time.split(":")[1]),
        timezone: "IST"
      },
      notes: "",
      isComplete: false,
      isNeutral: false
    }));

    const routineData: Routine = {
      id: editingRoutine ? editingRoutine.id : uuidv4(),
      name: routineName,
      tasks,
      createdAt: editingRoutine ? editingRoutine.createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (editingRoutine) {
      updateRoutine(routineData);
    } else {
      addRoutine(routineData);
    }

    setRoutineName("");
    setHabits([]);
    setEditingRoutine(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Create / Manage Routines</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">
          {editingRoutine ? 'Edit Routine' : 'Create New Routine'}
        </h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Routine Name:</label>
              <Input
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Enter routine name"
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Habit Title:</label>
                  <Input
                    value={currentHabit}
                    onChange={(e) => setCurrentHabit(e.target.value)}
                    placeholder="Enter habit"
                  />
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <label className="text-sm font-medium">Time:</label>
                  <Input
                    type="time"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(e.target.value)}
                  />
                </div>
                <div className="sm:pt-7">
                  <Button 
                    onClick={handleAddHabit}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Add Habit
                  </Button>
                </div>
              </div>

              {habits.map((habit, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <span className="font-medium">{habit.habit}</span>
                    <span className="ml-4 text-gray-500">
                      <Clock className="inline-block mr-1" size={16} />
                      {habit.time}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveHabit(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSaveRoutine}
                className="w-auto"
                disabled={!routineName || habits.length === 0}
              >
                {editingRoutine ? 'Update Routine' : 'Save Routine'}
              </Button>
              {editingRoutine && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingRoutine(null);
                    setRoutineName("");
                    setHabits([]);
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Routines</h2>
        {routines.length === 0 ? (
          <p className="text-gray-500">No routines available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{routine.name}</h3>
                    <p className="text-sm text-gray-500">
                      {routine.tasks.length} tasks
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRoutine(routine)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteRoutine(routine.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageRoutines;
