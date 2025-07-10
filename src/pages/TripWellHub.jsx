import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const [user, setUser] = useState(null);
  const [tripStatus, setTripStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const { data: whoami } = await axios.get("/tripwell/whoami");
        const { data: tripStatusResp } = await axios.get("/tripwell/tripstatus");

        setUser(whoami.user);
        setTripStatus(tripStatusResp.tripStatus);
        setLoading(false);
      } catch (err) {
        console.error("❌ Home hydration error", err);
        setLoading(false); // still allow Create/Join to render
      }
    };

    hydrate();
  }, []);

  const handleNav = (label) => {
    if (label === "Build My TripWell Experience") {
      if (!tripStatus?.tripId) {
        navigate("/tripwell/tripitineraryrequired");
        return;
      }
      if (user?.role === "participant") {
        navigate("/tripwell/plannerparticipanthub");
        return;
      }
      navigate("/tripwell/tripwellhub");
    }

    else if (label === "I'm TripWell-ing!") {
      if (!tripStatus?.tripId || !tripStatus?.itineraryExists) {
        navigate("/tripwell/tripitineraryrequired");
        return;
      }
      if (user?.role === "participant") {
        navigate(`/tripwell/live-participant/${user.tripId}`);
      } else {
        navigate(`/tripwell/live/${user.tripId}`);
      }
    }

    else if (label === "Trip Reflection") {
      if (tripStatus?.tripId) {
        navigate(`/tripwell/reflections/${user.tripId}`);
      } else {
        navigate("/tripwell/tripitineraryrequired");
      }
    }

    // Default navs (create, join, explainer)
    else if (label === "Create a Trip") {
      navigate("/tripwell/tripsetup");
    } else if (label === "Join a Trip") {
      navigate("/tripwell/join");
    } else if (label === "What is TripWell?") {
      navigate("/tripwell/explainer");
    }
  };

  const navItems = [
    {
      icon: <PlaneTakeoff className="w-5 h-5 mr-2" />,
      label: "Create a Trip",
    },
    {
      icon: <Users className="w-5 h-5 mr-2" />,
      label: "Join a Trip",
    },
    {
      icon: <Hammer className="w-5 h-5 mr-2" />,
      label: "Build My TripWell Experience",
    },
    {
      icon: <CalendarDays className="w-5 h-5 mr-2" />,
      label: "I'm TripWell-ing!",
    },
    {
      icon: <NotebookPen className="w-5 h-5 mr-2" />,
      label: "Trip Reflection",
    },
    {
      icon: <Info className="w-5 h-5 mr-2" />,
      label: "What is TripWell?",
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
            onClick={() => handleNav(item.label)}
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
