import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../style/loginmodal.css"; // Assuming you have some basic styles for the modal

export default function LoginModal({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(false); // Toggles between Login and Sign Up views
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If signing up, verify passwords match first
  if (isSignUp && password !== confirmPassword) {
    alert("Passwords do not match! Please check and try again.");
    return;
  }

    setLoading(true);

    if (isSignUp) {
      // 1. Sign up the user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName || "Valued Customer"
          }
        }
      });

      if (signUpError) {
        alert(signUpError.message);
        setLoading(false);
        return;
      }

      // 2. Insert the user's full name into the profiles table we created
      if (data?.user) {
        alert("🎉 Account created successfully! Welcome to our rental fleet.");
        onClose(); 
      }
    } else {
      // Handle normal Log In
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        alert(signInError.message);
      } else {
        onClose(); // Close modal on success; App.jsx automatically shifts state
      }
    }
    setLoading(false);
  };

  const toggleView = () => {
  // 1. Clear out all the text input states
  setEmail("");
  setPassword("");
  setConfirmPassword("");
  setFullName("");
  
  // 2. Switch the modal view
  setIsSignUp(!isSignUp);
};

  return (
    <div className="modal-overlay">
    <div className="modal-content">
      <button className="modal-close-btn" onClick={onClose}>
        ✕
      </button>
      <h2>{isSignUp ? "Create An Account" : `Welcome Back`}</h2>
      
      <form onSubmit={handleSubmit} className="modal-form">
        {isSignUp && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="modal-input"
          />
        )}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="modal-input"
        />
        <div className="password-input-container" style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"} 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="modal-input"
            style={{ width: "100%", paddingRight: "45px" }} 
          />
          <button
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-btn"
          >
            {showPassword ? " 👀 " : " 🕵️‍♂️ "}
          </button>
        </div>
        {isSignUp && (
          <div className="password-input-container" style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="modal-input"
              style={{ width: "100%", paddingRight: "45px" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle-btn"
            >
              {showConfirmPassword ? " 👀 " : " 🕵️‍♂️ "}
            </button>
          </div>
        )}
        <button type="submit" disabled={loading} className="modal-submit-btn">
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      {/* Updated toggle footer using the state-clearing toggleView handler */}
      <p className="modal-toggle-text">
        {isSignUp ? "Already have an account? " : "New to Kenji Auto Rentals? "}
        <button 
          type="button" 
          onClick={toggleView} 
          className="modal-toggle-link"
          style={{ background: "none", border: "none", color: "red", cursor: "pointer", textDecoration: "underline", font: "inherit", padding: 0 }}
        >
          {isSignUp ? "Log In here" : "Sign up here"}
        </button>
      </p>
    </div>
  </div>
  );
}