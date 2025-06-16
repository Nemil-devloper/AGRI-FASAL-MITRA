import React, { useState, useEffect } from 'react';
import '../styles/Policy.css';

const Policy = () => {
  const [policyHTML, setPolicyHTML] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_URL = import.meta.env.VITE_POLICY_API_URL || 'http://localhost:8002';
      console.log('Fetching policy data from:', `${API_URL}/api/policy`);
      
      const response = await fetch(`${API_URL}/api/policy`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.webpage_html) {
        setPolicyHTML(data.webpage_html);
      } else {
        setError("No policy data available");
      }
    } catch (error) {
      console.error("Error fetching policy data: ", error);
      setError("Failed to load policy data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicyData();
    const interval = setInterval(fetchPolicyData, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="policy-container">
      <div className="policy">
        <h1>Agricultural Policy Updates</h1>
        {loading ? (
          <div className="loading">Loading policy data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="policy-content">
            <div dangerouslySetInnerHTML={{ __html: policyHTML }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Policy;
