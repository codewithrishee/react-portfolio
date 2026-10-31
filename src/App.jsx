import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Expertise from "./components/Expertise";
import Journey from "./components/Journey";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Marquee from "./components/Marquee";
import Preloader from "./Preloader";

import AdminLogin from "./ManageAdmin/AdminLogin";
import AdminDashboard from "./ManageAdmin/AdminDashboard";
import AdminLayout from "./ManageAdmin/AdminLayout";
import ManageProjects from "./ManageAdmin/ManageProjects";
import ManageMessages from "./ManageAdmin/ManageMessages";
import SkillsManagement from "./ManageAdmin/SkillsManagement";
import ManageJourney from "./ManageAdmin/ManageJourney";
import ManageMarquee from "./ManageAdmin/ManageMarquee";
import ManageAbout from "./ManageAdmin/ManageAbout";
import ManageHero from "./ManageAdmin/ManageHero";

function PortfolioHome() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading && (
        <Preloader onComplete={handleLoadingComplete} />
      )}

      <div
        className={
          isLoading ? "portfolio-hidden" : "portfolio-visible"
        }
      >
        <Navbar />
        <Hero />
        <Marquee />
        <Projects />
        <Expertise />
        <Journey />
        <About />
        <Contact />
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portfolio */}
        <Route path="/" element={<PortfolioHome />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="projects"
            element={<ManageProjects />}
          />

          <Route
            path="messages"
            element={<ManageMessages />}
          />

          <Route
            path="skills"
            element={<SkillsManagement />}
          />

          <Route
            path="journey"
            element={<ManageJourney />}
          />

          <Route
            path="marquee"
            element={<ManageMarquee />}
          />

          <Route
            path="about"
            element={<ManageAbout />}
          />

          <Route
            path="hero"
            element={<ManageHero />}
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div style={{ padding: "40px" }}>
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;