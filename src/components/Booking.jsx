import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import '../style/booking.css'; 

export default function BookingDetails({ user, onLoginClick }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }

    async function fetchBookings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            id,
            car_name,
            start_time,
            end_time,
            client_name,
            wants_delivery,
            delivery_location
          `)
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });

        if (error) {
          console.error('Error fetching bookings:', error.message);
        } else {
          setBookings(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();

    return () => {
      setBookings([]); 
    };
  }, [user]);

  const handleCancelBooking = async (bookingId, carName) => {
    const confirmCancel = window.confirm(`Are you sure you want to cancel your reservation for ${carName}?`);
    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setBookings((prevBookings) => prevBookings.filter((b) => b.id !== bookingId));
      alert('🎉 Your reservation has been successfully cancelled.');
    } catch (err) {
      console.error('Cancellation failed:', err);
      alert(`Error cancelling reservation: ${err.message || 'Please try again.'}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleCheck = window.confirm(
      "⚠️ WARNING: Are you sure you want to permanently delete your account? This will cancel your reservations and erase your login identity immediately."
    );
    if (!doubleCheck) return;

    const finalConfirm = window.prompt("Type DELETE to confirm account closure:");
    if (finalConfirm !== "DELETE") return alert("Action aborted. Word mismatched.");

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      await supabase.auth.signOut();
      alert("👋 Your login account and profile history have been successfully deleted.");
      window.location.reload(); 

    } catch (err) {
      console.error("Account erasure failure:", err);
      alert(`Error: ${err.message || "Please try again later."}`);
    }
  };

   if (!user) {
    return (
      <div className="booking-message">
        <h3>Access Your Fleet Reservations</h3>
        <p>Please log in or create an account to view and manage your car rental details.</p>
        <button onClick={onLoginClick} className="auth-cta-btn">
          Sign In / Register
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="booking-message">Loading your reservations...</div>;
  }
  
  return (
    <>
      
      <div className="bookings-container">
        <h2 className="bookings-title">My Bookings</h2>

        {bookings.length === 0 ? (
          <div className="booking-empty-notice" style={{ padding: "40px 20px", color: "#9ca3af", textAlign: "center" }}>
            <p>You have no active car reservations at this time.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <h3 className="booking-car-name">{booking.car_name}</h3>
                <div className="booking-dates">
                  <p><strong>Pick-Up:</strong> {new Date(booking.start_time).toLocaleString()}</p>
                  <p><strong>Return:</strong> {new Date(booking.end_time).toLocaleString()}</p>
                  {booking.wants_delivery && <p>📍 Deliver to: {booking.delivery_location}</p>}
                </div>
                <div className="booking-footer">
                  <span className="status-badge">Confirmed</span>
                  <button 
                    onClick={() => handleCancelBooking(booking.id, booking.car_name)}
                    className="cancel-booking-btn"
                    style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 8px", borderRadius: "999px", cursor: "pointer" }}
                  >
                    Cancel Rental
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> 

      
      <div className="danger-zone-wrapper" style={{ maxWidth: "800px", margin: "30px auto" }}>
        <h4></h4>
        <p>Permanently remove your profile details and data history from our active records.</p>
        <button onClick={handleDeleteAccount} className="delete-account-btn">
          Delete My Account
        </button>
      </div>
    </>
  );
}