import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TripProvider } from "./context/TripContext"; // ✅ import context
import "./index.css"; // ✅ if you're using Tailwind or styles

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<TripProvider> {/* ✅ wrap app in trip context */}
			<App />
		</TripProvider>
	</React.StrictMode>
);