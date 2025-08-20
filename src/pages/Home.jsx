import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import BACKEND_URL from "../config";
import { PlaneTakeoff, Users, Hammer, CalendarDays, RefreshCcw, NotebookPen, Info } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
             // Show splash screen for 1000ms
         const timer = setTimeout(() => {
      // Then check auth state and route appropriately
      const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
        if (hasRouted) return; // Prevent multiple routing attempts
        
        if (firebaseUser) {
          // User is authenticated - check access and route
          console.log("🔐 User authenticated, checking access...");
          setHasRouted(true);
          await checkUserAccess(firebaseUser);
                 } else {
           // User not authenticated - go to access page for sign-in
           console.log("🔐 User not authenticated, routing to access...");
           setHasRouted(true);
           navigate("/access");
         }
      });

      return () => unsub();
    }, 200);

    return () => clearTimeout(timer);
  }, [navigate, hasRouted]);

  const checkUserAccess = async (firebaseUser) => {
    try {
      // Check if this is a new or existing user
      const createRes = await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
        }),
      });

      if (!createRes.ok) {
        throw new Error(`User check failed: ${createRes.status}`);
      }

      const userData = await createRes.json();
      console.log("🔍 User check response:", userData);

      // Simple binary check: does user exist or not?
      if (userData && userData._id) {
        // User exists - go to hydrate
        console.log("💾 Existing user, routing to hydrate...");
        navigate("/");
      } else {
        // No user - go to profile setup
        console.log("👋 New user, routing to profile...");
        navigate("/profile");
      }
      
    } catch (err) {
      console.error("❌ Access check error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  
    const navItems = [
      {
        icon: <PlaneTakeoff className="w-5 h-5 mr-2" />,
        label: "Create a Trip",
        description: "Start from scratch and build something unforgettable.",
        route: "/pretrip", // ✅ Updated from /tripsetup
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
        route: "/tripplannerreturn",
      },
      {
        icon: <CalendarDays className="w-5 h-5 mr-2" />,
        label: "I'm TripWelling!",
        description: "Start your adventure. We’ll guide you block by block.",
        route: "/preliveday",
      },
      {
        icon: <RefreshCcw className="w-5 h-5 mr-2" />,
        label: "Resume My Trip",
        description: "Jump back in exactly where you left off.",
        route: "/tripliveblock",
      },
      {
        icon: <NotebookPen className="w-5 h-5 mr-2" />,
        label: "Trip Reflection",
        description:
          "See what you captured, what made you laugh, and what you’ll never forget.",
        route: "/reflections/",
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
          Travel isn’t about going — it’s about building core memories with the
          ones you love.
        </h1>
  
        <div className="grid gap-4 mt-6">
          {navItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => navigate(item.route)}
                className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md bg-blue-300 hover:bg-blue-400"
              >
                {item.icon}
                {item.label}
              </button>
              <p className="text-sm text-gray-500 ml-2 mt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>


        <div>

          {
            process.env.NODE_ENV === "development" && (
              <div className="flex flex-col gap-2">
                <h1>Local for Testing </h1>
                <button
                onClick={() => navigate("/hydratelocal")}
                className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md bg-blue-300 hover:bg-blue-400"
              >
                Hydrate Local
              </button>
              <button
                onClick={() => navigate("/localdebug")}
                className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md bg-blue-300 hover:bg-blue-400"
              >
                Local Debug
              </button>

              <button
                onClick={() => navigate("/localrouter")}
                className="w-full flex items-center justify-start px-4 py-3 text-lg rounded-xl shadow-md bg-blue-300 hover:bg-blue-400"
              >
                Local Router
              </button>
              </div>
            )
          }
        </div>
      </div>
    );
  }
