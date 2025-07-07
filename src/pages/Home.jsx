import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PlaneTakeoff,
  Users,
  Hammer,
  CalendarDays,
  NotebookPen,
  Info,
} from "lucide-react";

export default function TripWellHome() {
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <PlaneTakeoff className="w-5 h-5 mr-2" />,
      label: "Create a Trip",
      route: "/tripwell/tripsetup",
    },
    {
      icon: <Users className="w-5 h-5 mr-2" />,
      label: "Join a Trip",
      route: "/tripwell/join",
    },
    {
      icon: <Hammer className="w-5 h-5 mr-2" />,
      label: "Build My TripWell Experience",
      route: "/tripwell/tripwellhub", // ✅ Canonical trip planner UX
    },
    {
      icon: <CalendarDays className="w-5 h-5 mr-2" />,
      label: "I'm TripWell-ing!",
      route: "/tripwell/prelive", // Dynamic redirect based on role
    },
    {
      icon: <NotebookPen className="w-5 h-5 mr-2" />,
      label: "Trip Reflection",
      route: "/tripwell/reflections/last", // Hydrates most recent reflections
    },
    {
      icon: <Info className="w-5 h-5 mr-2" />,
      label: "What is TripWell?",
      route: "/tripwell/explainer",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Travel isn’t just about going — it’s about remembering.
        <br />
        <span className="text-blue-600">Welcome to TripWell.</span>
      </h1>

      <p className="text-center text-gray-600">
        If you're here for the first time, hit <strong>Create a Trip</strong>.
        <br />
        If you’ve got a join code, go <strong>Join a Trip</strong>.
        <br />
        The rest? Go TripWell.
      </p>

      <div className="grid gap-4 mt-6">
        {navItems.map((item) => (
          <Button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md"
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
