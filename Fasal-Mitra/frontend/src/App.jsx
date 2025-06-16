import { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from './context/AuthContext';
import Header from "./components/Header";
import "./styles/App.css";

// Import Policy component directly
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await axios.get("https://agri-fasal-mitra.onrender.com/api/auth/profile");
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("authToken");
            delete axios.defaults.headers.common["Authorization"];
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("authToken");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const handleLogin = (token) => {
    if (token) {
      localStorage.setItem("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common["Authorization"];
  };

  const ShowHeader = () => {
    const location = useLocation();
    return !["/auth", "/signup"].includes(location.pathname) ? (
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} user={user} />
    ) : null;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider>
      <Router>
        <ShowHeader />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/auth" 
              element={!isAuthenticated ? <Auth onLogin={handleLogin} /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/signup" 
              element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />} 
            />

            {/* Protected routes */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Home user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/machine-rental/lender" 
              element={isAuthenticated ? <Lender user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/machine-rental/receiver" 
              element={isAuthenticated ? <Receiver user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/machine-rental" 
              element={isAuthenticated ? <MachineRental user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/chatbot" 
              element={isAuthenticated ? <ChatBot user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/smart-irrigation" 
              element={isAuthenticated ? <SmartIrrigation user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/smart-irrigation/water-level-and-waste-management-planner" 
              element={isAuthenticated ? <WaterLevelAndWasteManagementPlanner user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/smart-irrigation/pest-attack-prediction" 
              element={isAuthenticated ? <PestAttackPrediction user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/smart-irrigation/farm-profit" 
              element={isAuthenticated ? <FarmProfitability user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/ai-pest-detection" 
              element={isAuthenticated ? <AIPestDetection user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/climate-prediction" 
              element={isAuthenticated ? <ClimatePrediction user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/plant-disease-detection" 
              element={isAuthenticated ? <PlantDiseaseDetection user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/plant-disease-detection/potato" 
              element={isAuthenticated ? <Potato user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/plant-disease-detection/bellpepper" 
              element={isAuthenticated ? <BellPepper user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/plant-disease-detection/tomato" 
              element={isAuthenticated ? <Tomato user={user} /> : <Navigate to="/auth" replace />} 
            />
            <Route 
              path="/policy" 
              element={isAuthenticated ? <Policy user={user} /> : <Navigate to="/auth" replace />} 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
