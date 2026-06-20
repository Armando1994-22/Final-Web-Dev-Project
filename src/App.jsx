import {useState, useEffect} from "react"
import {supabase} from "./supabaseClient"

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Vehicles from "./components/Vehicles";
import AboutUs from "./components/AboutUs";
import Contact from "./components/Contact";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import BookingDetails from "./components/Booking";



export default function App(){
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentView, setCurrentView] = useState(null);
  

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
  })
  const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
  })
  return () => subscription.unsubscribe()}, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentView("home")
  }

  const verifiedFullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Valued Customer";

  return (
  <>
  <Navbar 
    user={user}
    onLoginClick={() => setIsLoginOpen(true)}
    onLogoutClick={handleLogout}
    onViewChange={setCurrentView}
    currentView={currentView}
  />
  {user && (
    <div style={{ padding: "10px", backgroundColor: "#e2e8f0", textAlign: "center", color: "#333" }}>
      <h2>Welcome Back,  {verifiedFullName}</h2>
      <p>Explor our fleet below and login to select your reservation days.</p>
    </div>
  )}

  {user ? (
    currentView === "bookings" ? (
      <BookingDetails user={user} />
    ) : (
      <Vehicles
      user={user}
      onLoginClick={() => setIsLoginOpen(true)}
      />
    )
  ) : (
    <>
  <Hero/>
  <Vehicles 
    user={user}
    onLoginClick={()=> setIsLoginOpen(true)}
  />
  <AboutUs/>
  <Contact/>
  <CTA
  onLoginClick={() => setIsLoginOpen(true)}
  />
  </>
  )}
  <Footer/>
  {isLoginOpen && (
    <LoginModal
    onClose={() => setIsLoginOpen(false)}
    />
  )}
  </>
  );
}