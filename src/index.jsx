import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ✅ Tailwind styles loaded
import { TripProvider } from './context/TripContext'; // ✅ Add this

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<TripProvider> {/* ✅ This gives context to your entire app */}
			<App />
		</TripProvider>
	</React.StrictMode>
);
