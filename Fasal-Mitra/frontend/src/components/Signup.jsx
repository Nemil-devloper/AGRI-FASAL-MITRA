import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inputErrors, setInputErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Reset form fields on mount (or when component remounts)
  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setDob("");
    setErrorMsg("");
    setInputErrors({});
  }, []);

  const validateInputs = () => {
    const errors = {};
    if (!username.trim()) errors.username = "Username is required.";
    else if (username.length < 3) errors.username = "Username must be at least 3 characters.";
    
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) errors.email = "Invalid email format.";
    
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
    
    if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    
    if (!phone) errors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(phone)) errors.phone = "Phone number must be exactly 10 digits.";
    
    if (!dob) errors.dob = "Date of birth is required.";
    return errors;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const errors = validateInputs();
    setInputErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      console.log('Attempting signup with:', { username, email, phone, dob });
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        phone,
        dob: new Date(dob).toISOString(),
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('Signup response:', response.data);

      if (response.data.token) {
        await login(response.data.token); // Use context login
        navigate("/home", { replace: true });
      } else {
        setErrorMsg("Signup failed: No token received");
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Show backend error message, and if available, error details
      let backendMsg = error.response?.data?.message || error.response?.data?.msg;
      if (backendMsg && error.response?.data?.error) {
        backendMsg += ` (${error.response.data.error})`;
      }
      setErrorMsg(
        backendMsg ||
        "Signup failed. Please try again."
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
          Join Agri Fasal Mitra!
        </h2>
        <p style={{ fontSize: "1.1em", lineHeight: 1.6 }}>
          Create your account to connect with fellow farmers, access crop insights, and manage your farming activities efficiently.
        </p>
        <div style={{ marginTop: "2rem", fontSize: "0.95em", opacity: 0.85 }}>
          <span>Already have an account?</span>
          <br />
          <Link to="/auth" style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>
            Login here
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
            Signup
          </h2>
          <form
            onSubmit={handleSignup}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              disabled={isLoading}
              style={{
                fontSize: "1.1em",
                height: "2.8em",
                border: "1.5px solid #2563eb",
                borderRadius: "8px",
                paddingLeft: "14px",
                background: "none",
                width: "100%",
                boxSizing: "border-box",
                opacity: isLoading ? 0.7 : 1,
              }}
            />
            {inputErrors.username && (
              <span className="error-message">{inputErrors.username}</span>
            )}

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
                border: "1.5px solid #2563eb",
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
                  border: "1.5px solid #2563eb",
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
                  color: "#2563eb",
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

            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                disabled={isLoading}
                style={{
                  fontSize: "1.1em",
                  height: "2.8em",
                  border: "1.5px solid #2563eb",
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
                onClick={() => setShowConfirm((prev) => !prev)}
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
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: "1.2em",
                  opacity: isLoading ? 0.7 : 1,
                }}
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {inputErrors.confirmPassword && (
              <span className="error-message">{inputErrors.confirmPassword}</span>
            )}

            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Phone Number"
              required
              disabled={isLoading}
              style={{
                fontSize: "1.1em",
                height: "2.8em",
                border: "1.5px solid #2563eb",
                borderRadius: "8px",
                paddingLeft: "14px",
                background: "none",
                width: "100%",
                boxSizing: "border-box",
                opacity: isLoading ? 0.7 : 1,
              }}
            />
            {inputErrors.phone && (
              <span className="error-message">{inputErrors.phone}</span>
            )}

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              disabled={isLoading}
              style={{
                fontSize: "1.1em",
                height: "2.8em",
                border: "1.5px solid #2563eb",
                borderRadius: "8px",
                paddingLeft: "14px",
                background: "none",
                width: "100%",
                boxSizing: "border-box",
                opacity: isLoading ? 0.7 : 1,
              }}
            />
            {inputErrors.dob && (
              <span className="error-message">{inputErrors.dob}</span>
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
              {isLoading ? "Signing up..." : "Signup"}
            </button>
            {errorMsg && <p className="error-message">{errorMsg}</p>}
          </form>
          <div style={{ textAlign: "center", marginTop: "1.2em" }}>
            <span style={{ color: "#6b8e23" }}>Already have an account? </span>
            <Link to="/auth" style={{ color: "#a0522d", fontWeight: 600, textDecoration: "underline" }}>
              Login
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

export default Signup;
// No changes needed for cookie logic; handled in AuthContext


