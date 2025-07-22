import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PlaneTakeoff,
  Users,
  Hammer,
  CalendarDays,
  NotebookPen,
  Info,
  RefreshCcw,
} from "lucide-react";

export default function TripWellHome() {
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <PlaneTakeoff className="w-5 h-5 mr-2" />,
      label: "Create a Trip",
      description: "Start from scratch and build your own adventure",
      route: "/tripsetup",
    },
    {
      icon: <Users className="w-5 h-5 mr-2" />,
      label: "Join a Trip",
      description: "Got a join code? Hop into someone else’s journey",
      route: "/join",
    },
    {
      icon: <Hammer className="w-5 h-5 mr-2" />,
      label: "Build My TripWell Experience",
      description: "Craft the details before you hit the road",
      route: "/tripwellhub",
    },
    {
      icon: <CalendarDays className="w-5 h-5 mr-2" />,
      label: "I'm TripWell-ing!",
      description: "Begin your trip now — we’ll guide the way",
      route: "/prelive",
    },
    {
      icon: <RefreshCcw className="w-5 h-5 mr-2" />,
      label: "Resume My Trip",
      description: "Pick up where you left off — right into the moment",
      route: "/tripliveblock",
    },
    {
      icon: <NotebookPen className="w-5 h-5 mr-2" />,
      label: "Trip Reflection",
      description: "Look back, write, and remember the moments",
      route: "/reflections/last",
    },
    {
      icon: <Info className="w-5 h-5 mr-2" />,
      label: "What is TripWell?",
      description: "Learn how it all works",
      route: "/explainer",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Travel isn’t just about going — it’s about remembering.
        <br />
        <span className="text-blue-600">Welcome to TripWell.</span>
      </h1>

      <div className="grid gap-4 mt-6">
        {navItems.map((item) => (
          <div key={item.label}>
            <Button
              onClick={() => navigate(item.route)}
              className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
            >
              {item.icon}
              {item.label}
            </Button>
            <p className="text-sm text-gray-500 ml-2 mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}