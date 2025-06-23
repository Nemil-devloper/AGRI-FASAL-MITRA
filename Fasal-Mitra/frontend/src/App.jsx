import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Header from "./components/Header";
import "./styles/App.css";
import Policy from "./components/Policy";

// Lazy load other components
const Home = lazy(() => import("./components/Home"));
const Auth = lazy(() => import("./components/Auth"));
const Signup = lazy(() => import("./components/Signup"));
const ChatBot = lazy(() => import("./components/ChatBot"));
const SmartIrrigation = lazy(() => import("./components/SmartIrrigation"));
const WaterLevelAndWasteManagementPlanner = lazy(() => import("./components/WaterLevelAndWasteManagementPlanner"));
const PestAttackPrediction = lazy(() => import("./components/PestAttackPrediction"));
const AIPestDetection = lazy(() => import("./components/AIPestDetection"));
const ClimatePrediction = lazy(() => import("./components/ClimatePrediction"));
const MachineRental = lazy(() => import("./components/MachineRental"));
const PlantDiseaseDetection = lazy(() => import("./components/PlantDiseaseDetection"));
const Lender = lazy(() => import("./components/Lender"));
const Receiver = lazy(() => import("./components/Receiver"));
const Potato = lazy(() => import("./components/Potato"));
const BellPepper = lazy(() => import("./components/BellPepper"));
const Tomato = lazy(() => import("./components/Tomato"));
const FarmProfitability = lazy(() => import("./components/FarmProfitability"));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)"
  }}>
    <div style={{
      padding: "20px",
      borderRadius: "10px",
      background: "rgba(255, 255, 255, 0.9)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    }}>
      Loading...
    </div>
  </div>
);

const App = () => {
  // Helper to conditionally render Header
  const ShowHeader = () => {
    const location = useLocation();
    return !["/login", "/signup"].includes(location.pathname) ? <Header /> : null;
  };

  const MainContent = ({ children }) => {
    const location = useLocation();
    const noHeader = ["/login", "/signup"].includes(location.pathname);
    return (
      <div className={`main-content${noHeader ? " no-header-padding" : ""}`}>
        {children}
      </div>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <ShowHeader />
        <MainContent>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Auth />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />

              {/* Private routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/machine-rental/lender" 
                element={
                  <ProtectedRoute>
                    <Lender />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/machine-rental/receiver" 
                element={
                  <ProtectedRoute>
                    <Receiver />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/machine-rental" 
                element={
                  <ProtectedRoute>
                    <MachineRental />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chatbot" 
                element={
                  <ProtectedRoute>
                    <ChatBot />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/smart-irrigation" 
                element={
                  <ProtectedRoute>
                    <SmartIrrigation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/smart-irrigation/water-level-and-waste-management-planner" 
                element={
                  <ProtectedRoute>
                    <WaterLevelAndWasteManagementPlanner />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/smart-irrigation/pest-attack-prediction" 
                element={
                  <ProtectedRoute>
                    <PestAttackPrediction />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/smart-irrigation/farm-profit" 
                element={
                  <ProtectedRoute>
                    <FarmProfitability />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-pest-detection" 
                element={
                  <ProtectedRoute>
                    <AIPestDetection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/climate-prediction" 
                element={
                  <ProtectedRoute>
                    <ClimatePrediction />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plant-disease-detection" 
                element={
                  <ProtectedRoute>
                    <PlantDiseaseDetection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plant-disease-detection/potato" 
                element={
                  <ProtectedRoute>
                    <Potato />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plant-disease-detection/bellpepper" 
                element={
                  <ProtectedRoute>
                    <BellPepper />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plant-disease-detection/tomato" 
                element={
                  <ProtectedRoute>
                    <Tomato />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/policy" 
                element={
                  <ProtectedRoute>
                    <Policy />
                  </ProtectedRoute>
                } 
              />
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </MainContent>
      </Router>
    </AuthProvider>
  );
};

// NOTE: JWT/session is now stored in cookies via js-cookie in AuthContext.
// Make sure cookie options are set for both localhost (dev) and your live domain (e.g., secure: true, sameSite: 'Lax' or 'None', domain: 'yourapp.com' in production).

export default App;

