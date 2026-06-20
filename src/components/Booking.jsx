import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import '../style/booking.css'; 

export default function BookingDetails({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null)

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
      setBookings([]); // Wipes state safely whenever user profiles shift or exit
    };

  }, [user]);

  const handleCancelBooking = async (bookingId, carName) => {
    const confirmCancel = window.confirm(`Are you sure you want to cancel your reservation for ${carName}?`);
    if (!confirmCancel) return;

    try{
      const {error} = await supabase
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

  if (loading) return <div className="booking-message">Loading your reservations...</div>;
  if (!user) return <div className="booking-message">Please log in to view your bookings.</div>;
  
  if (bookings.length === 0) {
    return (
      <div className="booking-message">
        <p>You have no bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <h2 className="bookings-title">My Bookings</h2>
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-card-content">
              <h3 className="booking-car-name">{booking.car_name}</h3>
              <div className="booking-dates">
                <p>
                  <strong>Pickup Time:</strong> {new Date(booking.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <p>
                  <strong>Return Time:</strong> {new Date(booking.end_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                {booking.wants_delivery && (
                  <p style={{ color: "#4d2c2c", marginTop: "5px" }}>
                    📍 <strong>Delivery To:</strong> {booking.delivery_location}
                  </p>
                )}
              </div>
              
              {/* 3. Updated Footer with Status and Cancel Button */}
              <div className="booking-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span className="status-badge">Confirmed</span>
                <button
                  type="button"
                  className="cancel-booking-btn"
                  disabled={isDeletingId === booking.id}
                  onClick={() => handleCancelBooking(booking.id, booking.car_name)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: isDeletingId === booking.id ? 'not-allowed' : 'pointer',
                    opacity: isDeletingId === booking.id ? 0.5 : 1,
                    fontSize: '14px',
                    fontWeight: '6px'
                  }}
                >
                  {isDeletingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}