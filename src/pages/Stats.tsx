import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRoutineStore from "@/store/routineStore";
import { useState } from "react";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import type { HabitHistoryEntry } from "@/types/routine";
import { Badge } from "@/components/ui/badge";

const Stats = () => {
  const { stats, updateStats, selectRoutine, routines } = useRoutineStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleUpdateDayOffLimit = (newLimit: number) => {
    updateStats({
      dayOff: {
        ...stats.dayOff,
        limit: newLimit,
      },
    });
  };

  const handleDayOff = () => {
    if (stats.dayOff.used < stats.dayOff.limit && !stats.dayOff.usedToday) {
      updateStats({
        dayOff: {
          ...stats.dayOff,
          used: stats.dayOff.used + 1,
          usedToday: true,
          lastUpdated: new Date(),
        },
      });
      toast({
        title: "Day Off Taken",
        description: "Your day off has been recorded.",
      });
    }
  };

  const handleUndoDayOff = () => {
    if (stats.dayOff.usedToday) {
      updateStats({
        dayOff: {
          ...stats.dayOff,
          used: Math.max(0, stats.dayOff.used - 1),
          usedToday: false,
        },
      });
      toast({
        title: "Day Off Undone",
        description: "Your day off has been removed.",
      });
    }
  };

  const handleResetStats = () => {
    selectRoutine(null);
    updateStats({
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
    });
    toast({
      title: "Stats Reset",
      description: "All stats have been reset to zero.",
    });
  };

  const isDayOff = (date: Date): boolean => {
    if (!stats.dayOff.lastUpdated) return false;
    return format(stats.dayOff.lastUpdated, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
           stats.dayOff.usedToday;
  };

  const calculateRoutineStreaks = () => {
    const streaks: Record<string, {
      daysFollowed: number;
      lastCompletedDate: string | null;
    }> = {};
    
    routines.forEach(routine => {
      const routineEntries = stats.habitHistory
        .filter(entry => entry.routineName === routine.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let daysFollowed = 0;
      let lastCompletedDate = null;

      for (const entry of routineEntries) {
        const allComplete = entry.habits.every(h => 
          h.status === 'completed' || h.status === 'neutral'
        );
        
        if (allComplete) {
          daysFollowed++;
          if (!lastCompletedDate) {
            lastCompletedDate = entry.date;
          }
        }
      }

      streaks[routine.name] = {
        daysFollowed,
        lastCompletedDate
      };
    });

    return streaks;
  };

  const calculateHabitStats = () => {
    const habitStats: Record<string, {
      routineName: string;
      habits: Array<{
        name: string;
        daysFollowed: number;
        isNeutral: boolean;
      }>;
    }> = {};

    routines.forEach(routine => {
      if (!habitStats[routine.name]) {
        habitStats[routine.name] = {
          routineName: routine.name,
          habits: routine.tasks.map(task => ({
            name: task.habit,
            daysFollowed: 0,
            isNeutral: task.isNeutral
          }))
        };
      }
    });

    if (stats.habitHistory && Array.isArray(stats.habitHistory)) {
      stats.habitHistory.forEach((entry: HabitHistoryEntry) => {
        entry.habits.forEach(habit => {
          const routineStats = habitStats[entry.routineName];
          if (routineStats) {
            const habitStat = routineStats.habits.find(h => h.name === habit.name);
            if (habitStat && (habit.status === 'completed' || habit.status === 'neutral')) {
              habitStat.daysFollowed++;
            }
          }
        });
      });
    }

    return habitStats;
  };

  const routineStreaks = React.useMemo(() => calculateRoutineStreaks(), [stats.habitHistory, routines]);
  const habitStats = React.useMemo(() => calculateHabitStats(), [stats.habitHistory, routines]);

  const getSelectedDayHistory = () => {
    if (!selectedDate) return null;
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    return stats.habitHistory.find(entry => entry.date === formattedDate);
  };

  const selectedDayHistory = getSelectedDayHistory();

  const getDayStatus = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const entry = stats.habitHistory.find(h => h.date === formattedDate);
    
    if (!entry) return null;
    
    if (isDayOff(date)) {
      return 'day-off';
    }
    
    const allCompleted = entry.habits.every(h => h.status === 'completed' || h.status === 'neutral');
    const someCompleted = entry.habits.some(h => h.status === 'completed' || h.status === 'neutral');
    
    if (allCompleted) return 'complete';
    if (someCompleted) return 'partial';
    return 'incomplete';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stats</h1>
        <Button variant="outline" onClick={handleResetStats}>
          Reset Stats
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Day Off Settings</h3>
          <div className="space-x-2">
            <Button 
              onClick={handleDayOff}
              disabled={stats.dayOff.used >= stats.dayOff.limit || stats.dayOff.usedToday}
            >
              Take Day Off
            </Button>
            <Button 
              variant="outline"
              onClick={handleUndoDayOff}
              disabled={!stats.dayOff.usedToday}
            >
              Undo Day Off
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Monthly Limit</label>
            <Input
              type="number"
              min="0"
              value={stats.dayOff.limit}
              onChange={(e) => handleUpdateDayOffLimit(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-500">Days Off Used</div>
            <div className="text-2xl font-bold">{stats.dayOff.used} / {stats.dayOff.limit}</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendar & History</TabsTrigger>
            <TabsTrigger value="routines">Routine Stats</TabsTrigger>
            <TabsTrigger value="habits">Habit History</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    completed: (date) => getDayStatus(date) === 'complete',
                    partial: (date) => getDayStatus(date) === 'partial',
                    dayOff: (date) => getDayStatus(date) === 'day-off',
                  }}
                  modifiersClassNames={{
                    completed: "bg-green-100 text-green-900 hover:bg-green-200",
                    partial: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
                    dayOff: "bg-gray-100 text-gray-900 hover:bg-gray-200",
                  }}
                />
                <div className="mt-4 flex gap-2 justify-center">
                  <Badge variant="outline" className="bg-green-100">Completed</Badge>
                  <Badge variant="outline" className="bg-yellow-100">Partial</Badge>
                  <Badge variant="outline" className="bg-gray-100">Day Off</Badge>
                </div>
              </div>
              
              {selectedDayHistory ? (
                <Card className="p-4">
                  <h3 className="font-medium text-lg mb-4">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                  </h3>
                  
                  {isDayOff(selectedDate!) && (
                    <div className="mb-4">
                      <Badge className="bg-gray-100 text-gray-900">Day Off Taken</Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{selectedDayHistory.routineName}</h4>
                      <div className="space-y-2">
                        {selectedDayHistory.habits.map((habit, index) => (
                          <div key={index} 
                               className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{habit.name}</span>
                            <Badge 
                              variant="outline"
                              className={`${
                                habit.status === 'completed' ? 'bg-green-100 text-green-900' :
                                habit.status === 'neutral' ? 'bg-yellow-100 text-yellow-900' :
                                'bg-red-100 text-red-900'
                              }`}
                            >
                              {habit.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 flex items-center justify-center text-gray-500">
                  No data available for selected date
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="routines" className="space-y-4">
            {Object.entries(routineStreaks).map(([routineName, stats]) => (
              <Card key={routineName} className="p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{routineName}</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Days Followed</p>
                    <p className="text-xl font-bold">{stats.daysFollowed} days</p>
                  </div>
                  {stats.lastCompletedDate && (
                    <p className="text-sm text-gray-500">
                      Last completed: {format(new Date(stats.lastCompletedDate), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="habits" className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Habits</h2>
            {Object.values(habitStats).map((routineStats) => (
              <Card key={routineStats.routineName} className="p-4">
                <h3 className="text-xl font-semibold mb-4">{routineStats.routineName}</h3>
                <div className="grid gap-3">
                  {routineStats.habits.map((habit, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{habit.name}</p>
                        {habit.isNeutral && (
                          <span className="text-sm text-gray-500">Neutral day</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {habit.daysFollowed} days followed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Stats;
