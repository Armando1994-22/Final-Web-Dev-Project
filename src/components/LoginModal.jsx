import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../style/loginmodal.css"; 

export default function LoginModal({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(false); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

  
  if (isSignUp && password !== confirmPassword) {
    alert("Passwords do not match! Please check and try again.");
    return;
  }

    setLoading(true);

    if (isSignUp) {
     
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

      
      if (data?.user) {
        alert("🎉 Account created successfully! Welcome to our rental fleet.");
        onClose(); 
      }
    } else {
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        alert(signInError.message);
      } else {
        onClose(); 
      }
    }
    setLoading(false);
  };

  const toggleView = () => {

  setEmail("");
  setPassword("");
  setConfirmPassword("");
  setFullName("");
  

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