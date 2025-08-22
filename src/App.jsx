import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase";

// ✅ Axios auth interceptor
axios.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("⚠️ Firebase auth error in interceptor:", error);
    }

    if (config.url && (config.url.includes('/tripwell/whoami') || config.url.includes('/tripwell/tripstatus'))) {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Canonical Pages
import Home from "./pages/Home";
import HomeArchive from "./pages/HomeArchive";
import Explainer from "./pages/Explainer";
import Access from "./pages/Access";
import JoinAccess from "./pages/JoinAccess";
import PreJoinTrip from "./pages/PreJoinTrip";
import TripJoin from "./pages/TripJoin";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileParticipant from "./pages/ProfileParticipant";
import TripSetup from "./pages/TripSetup";
import PreTripSetup from "./pages/PreTripSetup";
import TripCreated from "./pages/TripCreated";
import PrepBuild from "./pages/TripPreBuild";
import TripIntentForm from "./pages/TripIntentForm";
import AnchorSelectPage from "./pages/AnchorSelect";
import TripItineraryBuild from "./pages/TripItineraryBuilder";
import TripDayOverview from "./pages/TripDaysOverview";
import TripItineraryComplete from "./pages/TripItineraryComplete";
import ModifyDay from "./pages/TripModifyDay";
import ModifyBlock from "./pages/TripModifyBlock";
import TripPlannerReturn from "./pages/TripPlannerReturn";
import PlannerParticipantHub from "./pages/PlannerParticipantHub";
import CuratedHighlights from "./pages/CuratedHighlights";
import PreLiveDay from "./pages/PreLiveDay";
import TripLiveDay from "./pages/TripLiveDay";
import TripLiveDayBlock from "./pages/TripLiveDayBlock";
import TripLiveDayParticipant from "./pages/TripLiveDayParticipant";
import TripDayLookback from "./pages/TripDayLookback";
import PreviewLiveDay from "./pages/TripLiveDay";
import TripComplete from "./pages/TripComplete";
import CurrentTripReflection from "./pages/CurrentTripReflection";
import TripReflectionsHub from "./pages/TripReflectionsHub";
import TripWellHub from "./pages/TripWellHub";
import TripPlannerAI from "./pages/TripPlannerAI";
import YourStuck from "./pages/YourStuck";
import TripNotCreated from "./pages/TripNotCreated";
import TripItineraryRequired from "./pages/TripItineraryRequired";

// ✅ Test Pages
import TripIDTest from "./pages/TripIDTest"; // 👈 new
import AnchorGPTTest from "./pages/anchorgpttest"; // 👈 new

// ✅ Local State Test Flow Pages
import LocalUniversalRouter from "./pages/LocalUniversalRouter";
import HydrateLocal from "./pages/HydrateLocal";
import HydrateTest from "./pages/HydrateTest";
import PreTripHub from "./pages/PreTripHub";
import ReflectionHub from "./pages/ReflectionHub";

import LocalStateDebug from "./pages/LocalStateDebug";

export default function App() {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/homearchive" element={<HomeArchive />} />
      <Route path="/explainer" element={<Explainer />} />
      <Route path="/joinaccess" element={<JoinAccess />} />

      {/* ✅ Participant Flow */}
      <Route path="/prejointrip" element={<PreJoinTrip />} />
      <Route path="/join" element={<TripJoin />} />
      <Route path="/profileparticipant" element={<ProfileParticipant />} />
      <Route path="/plannerparticipanthub" element={<PlannerParticipantHub />} />
      <Route path="/triplivedayparticipant" element={<TripLiveDayParticipant />} />
      <Route path="/daylookback" element={<TripDayLookback />} />

      {/* ✅ Originator Flow */}
      <Route path="/profilesetup" element={<ProfileSetup />} />
      <Route path="/pretrip" element={<PreTripSetup />} />
      <Route path="/tripsetup" element={<TripSetup />} />

      <Route path="/tripcreated" element={<TripCreated />} />
      <Route path="/tripnotcreated" element={<TripNotCreated />} />
      <Route path="/tripwell/tripitineraryrequired" element={<TripItineraryRequired />} />

      {/* ✅ PrepBuild + alias */}
      <Route path="/prepbuild" element={<PrepBuild />} />
      <Route path="/tripprebuild" element={<PrepBuild />} /> {/* legacy alias */}

      {/* ✅ Test routes */}
      <Route path="/tripidtest" element={<TripIDTest />} />
      <Route path="/anchorgpttest" element={<AnchorGPTTest />} />

      {/* ✅ Local State Test Flow Routes */}
      <Route path="/localrouter" element={<LocalUniversalRouter />} />
      <Route path="/hydratelocal" element={<HydrateLocal />} />
      <Route path="/hydratetest" element={<HydrateTest />} />
      <Route path="/prephub" element={<PreTripHub />} />
      <Route path="/reflectionhub" element={<ReflectionHub />} />

      <Route path="/localdebug" element={<LocalStateDebug />} />

      <Route path="/tripintent" element={<TripIntentForm />} />
      <Route path="/anchorselect" element={<AnchorSelectPage />} />
      <Route path="/tripwell/itinerarybuild" element={<TripItineraryBuild />} />
      <Route path="/tripwell/itineraryupdate" element={<TripDayOverview />} />
      <Route path="/tripdaysoverview" element={<TripDayOverview />} />
      <Route path="/tripwell/itinerarycomplete" element={<TripItineraryComplete />} />
      <Route path="/modify/day/:tripId?/:dayIndex?" element={<ModifyDay />} />
      <Route path="/modify/block/:tripId?/:dayIndex?/:timeOfDay?" element={<ModifyBlock />} />
      <Route path="/modifyblock/:tripId/:dayIndex/:blockName" element={<ModifyBlock />} />
      <Route path="/tripplannerreturn" element={<TripPlannerReturn />} />

      {/* ✅ Execution Phase (Shared) */}
      <Route path="/preliveday" element={<PreLiveDay />} />
      <Route path="/tripliveday/:tripId" element={<TripLiveDay />} />
      <Route path="/tripliveblock" element={<TripLiveDayBlock />} />
      <Route path="/previewliveday" element={<PreviewLiveDay />} />
      <Route path="/tripcomplete" element={<TripComplete />} />

      {/* ✅ Reflection */}
      <Route path="/reflections/:tripId" element={<CurrentTripReflection />} />
      <Route path="/reflections" element={<TripReflectionsHub />} />

      {/* 🔜 Future Pages */}
      <Route path="/tripwellhub" element={<TripWellHub />} />
      <Route path="/trip-planner-ai" element={<TripPlannerAI />} />
      <Route path="/yourstuck" element={<YourStuck />} />

      {/* ✅ Fallback */}
      <Route path="*" element={<Access />} />
    </Routes>
  );
}
