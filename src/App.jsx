import { Routes, Route } from "react-router-dom";

import Header from "./assets/components/Header";
import Footer from "./assets/components/Footer";
import MobileOverview from "./assets/components/MobileOverview";

import Home from "./pages/Home";
import About from "./pages/about/About";
import Gallery from "./pages/about/Gallery";
import Services from "./pages/services/services";
import ScaffoldingWorks from "./pages/services/ScaffoldingWorks";
import InsulationWorks from "./pages/services/InsulationWorks";
import SafetyNet from "./pages/services/SafetyNet";
import BuildingConstructionWorks from "./pages/services/BuildingConstructionWorks";
import SupplyOfManPower from "./pages/services/SupplyOfManPower";
import SecuritySupply from "./pages/services/SecuritySupply";
import Project from "./pages/project/Project";
import ScaffoldingProjects from "./pages/project/ScaffoldingProjects";
import InsulationProjects from "./pages/project/InsulationProjects";
import SafetyCatchNetProjects from "./pages/project/SafetyCatchNetProjects";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// ── Blog & Admin ──────────────────────────────────────────────
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { Blogs, BlogDetail } from "./pages/blog/BlogPages";

// ── Admin Route Guard ─────────────────────────────────────────
import { isAdminLoggedIn } from "./pages/admin/AdminLogin";
import { Navigate } from "react-router-dom";

function ProtectedAdmin({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/blog/admin" replace />;
}

// ── Layout wrapper: hide header/footer for admin pages ────────
function AdminLayout({ children }) {
  return <>{children}</>;
}

function App() {
  return (
    <>
      <Routes>
        {/* ── Admin Routes (no Header/Footer) ── */}
        <Route
          path="/blog/admin"
          element={
            <AdminLayout>
              <AdminLogin />
            </AdminLayout>
          }
        />
        <Route
          path="/blog/admin/dashboard"
          element={
            <AdminLayout>
              <ProtectedAdmin>
                <AdminDashboard />
              </ProtectedAdmin>
            </AdminLayout>
          }
        />

        {/* ── All other routes (with Header/Footer) ── */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/about/gallery" element={<Gallery />} />
                <Route path="/about/*" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/scaffolding-works" element={<ScaffoldingWorks />} />
                <Route path="/services/insulation-works" element={<InsulationWorks />} />
                <Route path="/services/safety-net" element={<SafetyNet />} />
                <Route path="/services/building-construction-works" element={<BuildingConstructionWorks />} />
                <Route path="/services/supply-of-man-power" element={<SupplyOfManPower />} />
                <Route path="/services/security-supply" element={<SecuritySupply />} />
                <Route path="/project" element={<Project />} />
                <Route path="/projects/scaffolding-projects" element={<ScaffoldingProjects />} />
                <Route path="/projects/insulation-projects" element={<InsulationProjects />} />
                <Route path="/projects/safety-catch-net-projects" element={<SafetyCatchNetProjects />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:slug" element={<BlogDetail />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              </Routes>
              <Footer />
              <MobileOverview />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
