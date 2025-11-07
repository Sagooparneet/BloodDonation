import { BrowserRouter as Router, Routes, Route,useLocation } from "react-router-dom";

import Header from "./components/Header";
import DashboardHeader from "./components/DashboardHeader"; 
import SignupForm from "./pages/SignUp/SignUpForm";
import LoginForm from "./pages/Login/LoginForm";
import LandingPage from "./pages/LandingPage/LandingPage";
import RecipientDashboard from "./pages/RecipientDashboard/RecipientDashboard";
import BloodRequestForm from "./pages/BloodRequestForm/BloodRequestForm"; 
import DonorMatching from './pages/DonorMatching/DonorMatching';
import { Toaster } from 'sonner';
import CommunityHub from "./pages/CommunityHub/CommunityHub";
import DonorDashboard from "./pages/Donor Dashboard/DonorDashboard";
import HealthcareProviderDashboard from "./pages/HealthProviderDashboard/HealthProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import AdminLogin from "./pages/AdminLogin/AdminLogin";

function AppContent() {
  const location = useLocation();
  const path = location.pathname; 

  const isDashboard = 
  path.startsWith("/recipient")||
  path.startsWith("/donor-dashboard")||
  path.startsWith("/healthcare-dashboard")||
  path.startsWith("/admin-dashboard")||
  path.startsWith("/blood-request")||
  path.startsWith("/community");
  path.startsWith("/donors");

  return (
    <>
    {isDashboard ? <DashboardHeader /> : <Header />}

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/recipient" element={<RecipientDashboard/>} />
          <Route path="/blood-request" element={<BloodRequestForm />} />
          <Route path="/donors" element={<DonorMatching />} />
          <Route path="/community" element={<CommunityHub />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/healthcare-dashboard" element={<HealthcareProviderDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      <Toaster
        icons={{
          success: '🎉',
          error: '❌'
          }
        }
        richColors
        position="top-right"
        toastOptions={{
          closeButton: true,
          style: {
            padding: '15px 25px',
            fontSize: '20px',
            fontWeight: 'bold',
            gap: '20px',
            alignItems: 'flex-start',
          }
        }}
      />
    </>
  );
}
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

