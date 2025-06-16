import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import gifImage from "../assets/login-gif.gif";
import bgImage from "../assets/bg.jpg";
import hiddenIcon from "../assets/hidden.png";

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inputErrors, setInputErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) errors.email = "Invalid email format.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const errors = validateInputs();
    setInputErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      console.log("Attempting login with:", { email });
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      });

      console.log("Login response:", response.data);

      if (response.data.token) {
        onLogin(response.data.token);
        console.log("Token passed to parent component");
        navigate("/", { replace: true });
        console.log("Navigation to home page initiated");
      } else {
        console.error("No token in response:", response.data);
        setErrorMsg("Login failed: No token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg(
        error.response?.data?.message || 
        error.response?.data?.msg || 
        error.message || 
        "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-main-container" style={{ background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)" }}>
      <div className="auth-gif-section" style={{
        background: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <img
          src={gifImage}
          alt="Login GIF"
          style={{
            width: "90%",
            height: "90%",
            objectFit: "cover",
            margin: 0,
            padding: 0,
            borderRadius: "24px",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
          }}
        />
      </div>
      <div className="auth-form-section" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
        height: "100vh",
        minHeight: "100vh",
        padding: 0,
        margin: 0
      }}>
        <div
          className="auth-container"
          style={{
            width: "100%",
            height: "100vh",
            margin: 0,
            padding: "40px 0",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(255,255,255,0.85)",
            zIndex: 0
          }} />
          <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
            <h2 style={{
              color: "#2563eb",
              fontWeight: 700,
              fontSize: "2.5em",
              marginBottom: "20px",
              textAlign: "center",
              letterSpacing: "1px"
            }}>Login</h2>
            <form
              onSubmit={handleLogin}
              style={{
                width: "100%",
                maxWidth: "400px",
                margin: "0 auto",
                padding: 0,
                boxShadow: "none",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "rgba(255,255,255,0.0)",
                backdropFilter: "blur(2px)"
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
                style={{
                  fontSize: "1.2em",
                  height: "3em",
                  border: "2px solid #2563eb",
                  borderRadius: "10px",
                  paddingLeft: "16px",
                  background: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  opacity: isLoading ? 0.7 : 1
                }}
              />
              {inputErrors.email && <span className="error-message">{inputErrors.email}</span>}
              
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  style={{
                    fontSize: "1.2em",
                    height: "3em",
                    border: "2px solid #2563eb",
                    borderRadius: "10px",
                    paddingLeft: "16px",
                    paddingRight: "40px",
                    width: "100%",
                    background: "none",
                    boxSizing: "border-box",
                    opacity: isLoading ? 0.7 : 1
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "40%",
                    transform: "translateY(-50%)",
                    width: "28px",
                    height: "28px",
                    background: "none",
                    border: "none",
                    padding: "5px",
                    margin: "0 0 5px 0",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isLoading ? 0.7 : 1
                  }}
                  tabIndex={-1}
                >
                  <img
                    src={hiddenIcon}
                    alt={showPassword ? "Hide Password" : "Show Password"}
                    style={{
                      width: "22px",
                      height: "22px",
                      opacity: 0.7,
                      pointerEvents: "none",
                      display: "block",
                      verticalAlign: "middle"
                    }}
                  />
                </button>
              </div>
              {inputErrors.password && <span className="error-message">{inputErrors.password}</span>}
              
              <button 
                type="submit" 
                disabled={isLoading}
                style={{
                  fontSize: "1.2em",
                  height: "3em",
                  background: isLoading 
                    ? "linear-gradient(90deg, #93a5cf 0%, #7b8cb5 100%)"
                    : "linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  marginTop: "10px",
                  marginBottom: "10px",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.15)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                  transition: "background 0.3s",
                  width: "100%"
                }}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
              {errorMsg && <p className="error-message">{errorMsg}</p>}
            </form>
            <p style={{ color: "#2563eb", marginTop: "18px", textAlign: "center" }}>
              Don't have an account? <Link to="/signup" style={{ color: "#1e3a8a", fontWeight: 600 }}>Signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;