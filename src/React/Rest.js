import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Token is missing. Please request a new password reset link.");
      setIsTokenValid(false);
      return;
    }

    let intervalId;
    try {
      const decodedToken = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000;

      if (expirationTime < Date.now()) {
        setError("Token has expired. Please request a new password reset link.");
        setIsTokenValid(false);
      } else {
        intervalId = setInterval(() => {
          if (expirationTime < Date.now()) {
            setError("Token has expired. Please request a new password reset link.");
            setIsTokenValid(false);
            clearInterval(intervalId); // Stop checking after expiration
          }
        }, 1000); // Check every second
      }
    } catch (err) {
      setError("Invalid token. Please request a new password reset link.");
      setIsTokenValid(false);
    }

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [token]);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post(`https://test-4-d4mt.onrender.com/reset-password/${token}`, { newPassword: password, confirmPassword });
      alert("Password reset successfully!");
    } catch (error) {
      if (error.response && error.response.data.msg) {
        setError(error.response.data.msg);
      } else {
        console.error("Error resetting password:", error);
        setError("An error occurred while resetting the password.");
      }
    }
  };

  return (
    <div className="change-password-container">
      <h2 className="title">Reset Password</h2>
      {error ? (
        <p className="error-message">{error}</p>
      ) : isTokenValid ? (
        <>
          <div className="input-group">
            <input
              className="input-field"
              type="password"
              placeholder="Enter New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              className="input-field"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        </>
      ) : null}
    </div>
  );
};

export default ResetPassword;
