import React, { useState } from "react";
import "../style/navbar.css";



export default function Navbar({user, onLoginClick, onLogoutClick, onViewChange, currentView}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (viewName) => {
    onViewChange(viewName);
    setIsOpen(false); 
  };

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={() => handleNavClick("home")} style={{cursor: "pointer"}}>Kenjis Autos</h2>
      <ul className={`nav-link ${isOpen ? 'active' : ''}`}>
        <li><a href="#home" onClick={() => handleNavClick("home")}>Home</a></li>
        {!user && (
          <>
          <li><a href="#vehicles">Vehicles</a></li>
          <li><a href="#about-us">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
          </>
        )}
        
        {user && (
          <li>
            <button
            className={`nav-btn-link ${currentView === 'bookings' ? 'active-tab' : ''}`}
            onClick={() => handleNavClick("bookings")}>
              My Bookings
            </button>
          </li>
        )}
        <li>
          {!user ? (
            <button className="nav-btn" onClick={() => {
                onLoginClick();
                setIsOpen(false);
              }}>
              Get Started
            </button>
          ) : (
            <button className="nav-btn logout-theme" onClick={() => {
              onLogoutClick();
              setIsOpen(false);
              handleNavClick("home");
            }} >
              Logout
            </button>
          )}
        </li>
      </ul>
      <div className="menu-icon" onClick={toggleMenu}>
        {isOpen ? '✕' : '☰'}
      </div>
    </nav>
  );
}