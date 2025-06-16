import React, { useState, useEffect } from 'react';
import '../styles/Policy.css';

const Policy = () => {
  const [policyHTML, setPolicyHTML] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPolicyData = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_POLICY_API_URL;
      const response = await fetch(`${API_URL}/api/policy`);
      const data = await response.json();
      setPolicyHTML(data.webpage_html || "No policy data available");
    } catch (error) {
      console.error("Error fetching policy data: ", error);
      setPolicyHTML("Failed to load policy data. Please try again later.");
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
    <div>
      <div className="policy">
        <h1>Agricultural Policy Updates</h1>
        {loading ? (
          <div className="loading">Loading policy data...</div>
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
