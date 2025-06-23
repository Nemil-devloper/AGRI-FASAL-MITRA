import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inputErrors, setInputErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Reset form fields on mount (or when component remounts)
  useEffect(() => {
    setEmail("");
    setPassword("");
    setErrorMsg("");
    setInputErrors({});
  }, []);

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
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log("Login response:", response.data);

      if (response.data.token) {
        await login(response.data.token);
        console.log("Token passed to parent component");
        navigate("/home", { replace: true });
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
    <div
      className="auth-main-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        background: "linear-gradient(120deg, #e8f5e9 0%, #fbeee6 100%)",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        position: "relative",
      }}
    >
      {/* Subtle farm background accent */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          background: "url('https://www.transparenttextures.com/patterns/grass.png') repeat",
          opacity: 0.08,
          zIndex: 0,
        }}
      />
      <div
        className="auth-prompt-section"
        style={{
          flex: 1,
          minWidth: "220px",
          maxWidth: "400px",
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(120deg, #6b8e23 0%, #a0522d 100%)",
          color: "#fff",
          borderRadius: "18px 0 0 18px",
          boxShadow: "0 8px 32px 0 rgba(107, 142, 35, 0.18)",
          minHeight: "400px",
          zIndex: 1,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: "2em", marginBottom: "1rem" }}>
          Welcome Back, Farmer!
        </h2>
        <p style={{ fontSize: "1.1em", lineHeight: 1.6 }}>
          Log in to manage your crops, connect with fellow farmers, and access tools to grow your farm.
        </p>
        <div style={{ marginTop: "2rem", fontSize: "0.95em", opacity: 0.85 }}>
          <span>Don't have an account?</span>
          <br />
          <Link to="/signup" style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>
            Signup here
          </Link>
        </div>
      </div>
      <div
        className="auth-form-section"
        style={{
          flex: 1,
          minWidth: "260px",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
          background: "#fff",
          borderRadius: "0 18px 18px 0",
          boxShadow: "0 8px 32px 0 rgba(107, 142, 35, 0.18)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%" }}>
          <h2
            style={{
              color: "#6b8e23",
              fontWeight: 700,
              fontSize: "2em",
              marginBottom: "1.5rem",
              textAlign: "center",
              letterSpacing: "1px",
            }}
          >
            Login
          </h2>
          <form
            onSubmit={handleLogin}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
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
                fontSize: "1.1em",
                height: "2.8em",
                border: "1.5px solid #6b8e23",
                borderRadius: "8px",
                paddingLeft: "14px",
                background: "none",
                width: "100%",
                boxSizing: "border-box",
                opacity: isLoading ? 0.7 : 1,
              }}
            />
            {inputErrors.email && (
              <span className="error-message">{inputErrors.email}</span>
            )}

            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
                style={{
                  fontSize: "1.1em",
                  height: "2.8em",
                  border: "1.5px solid #6b8e23",
                  borderRadius: "8px",
                  paddingLeft: "14px",
                  paddingRight: "40px",
                  width: "100%",
                  background: "none",
                  boxSizing: "border-box",
                  opacity: isLoading ? 0.7 : 1,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "28px",
                  height: "28px",
                  background: "none",
                  border: "none",
                  padding: "0",
                  margin: "0",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  color: "#6b8e23",
                  fontWeight: 700,
                  fontSize: "1.2em",
                  opacity: isLoading ? 0.7 : 1,
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {inputErrors.password && (
              <span className="error-message">{inputErrors.password}</span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                fontSize: "1.1em",
                height: "2.8em",
                background:
                  "linear-gradient(90deg, #6b8e23 0%, #a0522d 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                marginTop: "10px",
                marginBottom: "10px",
                boxShadow: "0 2px 8px rgba(107,142,35,0.10)",
                cursor: isLoading ? "not-allowed" : "pointer",
                letterSpacing: "1px",
                transition: "background 0.3s",
                width: "100%",
              }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            {errorMsg && <p className="error-message">{errorMsg}</p>}
          </form>
          <div style={{ textAlign: "center", marginTop: "1.2em" }}>
            <span style={{ color: "#6b8e23" }}>Don't have an account? </span>
            <Link to="/signup" style={{ color: "#a0522d", fontWeight: 600, textDecoration: "underline" }}>
              Signup
            </Link>
          </div>
        </div>
      </div>
      {/* Responsive stacking for mobile */}
      <style>
        {`
        @media (max-width: 900px) {
          .auth-main-container {
            flex-direction: column !important;
          }
          .auth-prompt-section {
            border-radius: 18px 18px 0 0 !important;
            max-width: 100vw !important;
          }
          .auth-form-section {
            border-radius: 0 0 18px 18px !important;
            max-width: 100vw !important;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Auth;