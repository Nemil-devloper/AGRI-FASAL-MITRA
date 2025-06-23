import React from "react";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  // Remove redirect for authenticated users
  return children;
};

export default PublicRoute;

