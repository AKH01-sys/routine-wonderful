
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

const timezones = [
  { label: "IST", offset: 5.5 },
  { label: "UTC", offset: 0 },
  { label: "PST", offset: -8 },
];

const Index = () => {
  const [times, setTimes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: { [key: string]: string } = {};
      const now = new Date();

      timezones.forEach(({ label, offset }) => {
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const time = new Date(utc + (3600000 * offset));
        newTimes[label] = time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      });

      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 animate-fade-in">
      <h1 className="text-5xl font-bold text-primary">
        Jaiveek Hegde Routine
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timezones.map(({ label }) => (
          <Card key={label} className="p-6 flex flex-col items-center justify-center space-y-2">
            <div className="text-lg font-medium text-gray-500">{label}</div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{times[label] || "--:--:-- --"}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
