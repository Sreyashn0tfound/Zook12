import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing our two master pages
import LandingPage from "./pages/page"; // <-- Make sure this path is correct for your landing page!
import DashboardPage from "./dashboard/page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The root URL ("/") will show your beautiful dark-mode Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* The "/dashboard" URL will launch the 60-FPS AI Traffic Simulator */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;