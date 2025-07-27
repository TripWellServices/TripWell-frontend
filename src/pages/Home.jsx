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

export default function Home() {
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <PlaneTakeoff className="w-5 h-5 mr-2" />,
      label: "Create a Trip",
      description: "Start from scratch and build something unforgettable.",
      route: "/tripsetup",
    },
    {
      icon: <Users className="w-5 h-5 mr-2" />,
      label: "Join a Trip",
      description: "Enter a join code and sync up with your crew.",
      route: "/join",
    },
    {
      icon: <Hammer className="w-5 h-5 mr-2" />,
      label: "Build My TripWell Experience",
      description: "Plan your itinerary, edit blocks, or restart your vibe.",
      route: "/tripplannerreturn", // ✅ canonical route
    },
    {
      icon: <CalendarDays className="w-5 h-5 mr-2" />,
      label: "I'm TripWelling!",
      description: "Start your adventure. We’ll guide you block by block.",
      route: "/prelive", // ✅ launches TripLiveDay sequence
    },
    {
      icon: <RefreshCcw className="w-5 h-5 mr-2" />,
      label: "Resume My Trip",
      description: "Jump back in exactly where you left off.",
      route: "/tripliveblock", // ✅ fallback-safe re-entry
    },
    {
      icon: <NotebookPen className="w-5 h-5 mr-2" />,
      label: "Trip Reflection",
      description: "See what you captured, what made you laugh, and what you’ll never forget.",
      route: "/reflections/last", // ✅ last completed trip
    },
    {
      icon: <Info className="w-5 h-5 mr-2" />,
      label: "What is TripWell?",
      description: "Learn how we turn travel into lasting memories.",
      route: "/explainer",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Travel isn’t about going — it’s about building core memories with the ones you love.
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
