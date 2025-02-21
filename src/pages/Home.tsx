import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themes } from "../types/theme";
import useRoutineStore from "@/store/routineStore";

const timezones = [
  { label: "IST", offset: 5.5 },
  { label: "UTC", offset: 0 },
  { label: "PST", offset: -8 },
  { label: "EST", offset: -5 },
  { label: "GMT", offset: 0 },
  { label: "CST", offset: -6 },
];

const Home = () => {
  const [selectedTimezone, setSelectedTimezone] = useState("IST");
  const [currentTime, setCurrentTime] = useState("");
  const { theme, setTheme } = useRoutineStore();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timezone = timezones.find(tz => tz.label === selectedTimezone);
      if (timezone) {
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const time = new Date(utc + (3600000 * timezone.offset));
        setCurrentTime(time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  const currentTheme = themes.find(t => t.name === theme);

  return (
    <div className={`min-h-screen flex flex-col items-center space-y-8 animate-fade-in ${
      currentTheme?.background || ''
    }`}>
      <div className="w-full flex justify-end px-4 pt-4">
        <Select
          value={theme}
          onValueChange={setTheme}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {themes.map(({ name }) => (
              <SelectItem key={name} value={name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-32 h-32 mb-4">
        <img 
          src="/lovable-uploads/89a650a8-5904-4b2d-813a-b1c664fb2d78.png"
          alt="JH Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <h1 className={`text-5xl font-bold text-center ${currentTheme?.text}`}>
        Jaiveek Hegde Routine
      </h1>

      <div className="w-full max-w-md space-y-6">
        <Select
          value={selectedTimezone}
          onValueChange={setSelectedTimezone}
        >
          <SelectTrigger className={`${currentTheme?.cardBackground}`}>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezones.map(({ label }) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Card className={`p-8 flex flex-col items-center space-y-4 ${currentTheme?.cardBackground}`}>
          <div className={`text-2xl font-medium ${currentTheme?.text}`}>{selectedTimezone}</div>
          <div className="flex items-center space-x-4">
            <Clock className={`h-8 w-8 ${currentTheme?.text}`} />
            <span className={`text-4xl font-bold ${currentTheme?.text}`}>
              {currentTime}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
