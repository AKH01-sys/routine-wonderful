
export type ThemeName = "simple" | "space" | "abstract" | "gradient";

export interface Theme {
  name: ThemeName;
  background: string;
  text: string;
  accent: string;
  cardBackground: string;
  illustration?: string;
}

export const themes: Theme[] = [
  {
    name: "simple",
    background: "bg-white",
    text: "text-gray-900",
    accent: "bg-primary",
    cardBackground: "bg-white",
  },
  {
    name: "space",
    background: "bg-[#1A1F2C] bg-[url('/lovable-uploads/73e7029c-7ea6-451d-9cab-97a11a65e046.png')] bg-cover bg-center bg-fixed",
    text: "text-white",
    accent: "bg-[#D6BCFA]",
    cardBackground: "bg-[#403E43]/50 backdrop-blur-sm border border-white/10",
  },
  {
    name: "abstract",
    background: "bg-white bg-[url('/lovable-uploads/a605647f-c0ce-43c0-8e66-9b0f63b54572.png')] bg-[length:800px] bg-repeat relative before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,transparent_0%,#F1F0FB_100%)] before:opacity-90 before:pointer-events-none",
    text: "text-[#1A1F2C]",
    accent: "bg-[#8B5CF6]",
    cardBackground: "bg-white/90 backdrop-blur-sm shadow-lg",
  },
  {
    name: "gradient",
    background: "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100",
    text: "text-gray-900",
    accent: "bg-gradient-to-r from-blue-500 to-purple-500",
    cardBackground: "bg-white/80",
  },
];
