import React, {useState} from "react";
import {supabase} from "../supabaseClient";
import "../style/vehicles.css";

const Fleet = [
    {
        id: 1, 
        name: "2017 Chevrolet Cruze LT", 
        intro: "The 2017 Chevrolet Cruze LT is a practical and comfortable compact car available as a sedan or hatchback. Powered by a peppy 1.4L turbocharged engine, it delivers excellent fuel economy (up to 40 mpg highway), solid mid-range torque, and comes generously equipped with modern tech like Apple CarPlay and Android Auto", 
        price: "$45/day",
        images: [
            "https://images.turo.com/media/vehicle/images/FdNuh1T1S2imkgSmpzamgw.1242x745.jpg",
            "https://images.turo.com/media/vehicle/images/f3leQOYXQxC7wNPqkhUMgA.1242x745.jpg",
            "https://images.turo.com/media/vehicle/images/-JTrvYglRnCZTATnuxDoeQ.1242x745.jpg"
        ]
    },
    {
        id: 2, 
        name: "2020 Pacifica Cryslter - Hybrid Limited", 
        intro: "The 2020 Chrysler Pacifica Hybrid Limited is a highly efficient plug-in hybrid minivan that combines family-friendly practicality with upscale comfort. It features a 3.6-liter V6 engine paired with dual electric motors, delivering 260 horsepower, 32 miles of all-electric range, and 82 MPGe", 
        price: "$65/day",
        images: [
            "https://images.turo.com/media/vehicle/images/K4Wqz92cTpWVaZZg4PCjsw.1242x745.jpg",
            "https://images.turo.com/media/vehicle/images/zDTjqy68QAactk190i17hg.1242x745.jpg",
            "https://images.turo.com/media/vehicle/images/yevP94hORdSgOdJoQYOs1g.1242x745.jpg"
        ]
    }
];

export default function Vehicles({ user, onLoginClick }) {
    const [selectedCar, setSelectedCar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [wantsDelivery, setWantsDelivery] = useState(false);
    const [deliveryLocation, setDeliveryLocation] = useState('');

    // 1. Split state into clear, separate Date and Hour values
    const [startDate, setStartDate] = useState('');
    const [startHour, setStartHour] = useState('09'); // Default to 9 AM
    const [endDate, setEndDate] = useState('');
    const [endHour, setEndHour] = useState('17');   // Default to 5 PM

    // Generate an array of 24 hours formatted as ["00", "01", ... "23"]
    const hoursDropdownOptions = Array.from({ length: 24 }, (_, i) => {
        const hour24 = i.toString().padStart(2, '0');
        const ampm = i >= 12 ? "PM" : "AM";
        let hour12 = i % 12;
        if (hour12 === 0) hour12 = 12
        
        return {
            value: hour24,
            label: `${hour12}:00 ${ampm}`
        };
    });

    // Helper utility to get today's date string for calendar restriction (YYYY-MM-DD)
    const getTodayDateString = () => {
        const now = new Date();
        return now.toISOString().split("T")[0];
    };

    const handleReservationSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) return alert("Please pick your rental pickup and drop-off dates.");
    if (!user) return alert("Your login session expired. Please log in again.");

    setIsSubmitting(true);

    try {
        // 1. Explicitly fetch the profile row matching this authenticated user ID
        const { data: profileRow, error: profileError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle(); // Prevents crashing if profile is missing

        if (profileError) console.error("Profile matching error:", profileError);

        // 2. Prioritize: 1. Public Profile Table, 2. Account Metadata, 3. Email backup
        const verifiedFullName = profileRow?.full_name || 
                                 user.user_metadata?.full_name || 
                                 user.email.split('@')[0];

        const finalStartTime = `${startDate}T${startHour}:00:00`;
        const finalEndTime = `${endDate}T${endHour}:00:00`;

        if (new Date(finalStartTime) >= new Date(finalEndTime)) {
            setIsSubmitting(false);
            return alert("Return date and hour must be after the pick-up date and hour.");
        }

        // 3. Run overlap checks
        const { data: overlappingBookings, error: checkError } = await supabase
            .from("reservations")
            .select("id")
            .eq("car_name", selectedCar.name)
            .lte("start_time", finalEndTime)
            .gte("end_time", finalStartTime);

        if (checkError) throw checkError;

        if (overlappingBookings && overlappingBookings.length > 0) {
            alert(`Sorry, the ${selectedCar.name} is already reserved during your selected hours.`);
            setIsSubmitting(false);
            return;
        }

        // 4. Record row into database using the verifiedFullName variable
        const { data, error: insertError } = await supabase
            .from("reservations")
            .insert([{
                user_id: user.id,
                client_name: verifiedFullName, 
                car_name: selectedCar.name,
                start_time: finalStartTime, 
                end_time: finalEndTime,
                wants_delivery: wantsDelivery,
                delivery_location: wantsDelivery ? deliveryLocation : null 
            }])
            .select();

        if (insertError) throw insertError;

        alert(`🎉 Success! Your ${selectedCar.name} reservation is confirmed! Review your reervation in "My Bookings" tab.`);
        setSelectedCar(null);
        setStartDate("");
        setEndDate("");
        setWantsDelivery(false);
        setDeliveryLocation("");

    } catch (error) {
        console.error("System Transaction Error:", error);
        alert(`Booking Error: ${error.message || "Something went wrong."}`);
    } finally {
        setIsSubmitting(false);
    }
};
    return (
        <section className="vehicles-section" id="vehicles">
            <h2>Explor Our Vehicle Catalog, small but mighty!</h2>

            <div className="vehicles-grid">
                {Fleet.map((car) =>(
                    <div key={car.id} className="car-card">
                        <div className="car-image-container" onClick={(e) => {
                            const currentSrc = e.currentTarget.querySelector('.car-main-img').src;
                            setLightboxImage(currentSrc)
                        }}>
                            <img 
                                src={car.images[0]} // Displays the first image link from the list
                                alt={car.name} 
                                className="car-main-img" 
                                style={{ cursor: "zoom-in" }} // Gives the user a visual anchor hint that it is clickable
                                />
                         </div>
                         <div className="car-thumbnails">
                            {car.images.map((imgUrl, index) => (
                                <img 
                                    key={index} 
                                    src={imgUrl} 
                                    alt="Preview thumbnail" 
                                    className="thumb-img"
                                    onClick={(e) => {
                                             // Click trick: Swaps the main featured image to the one clicked
                                        const card = e.target.closest('.car-card');
                                        const mainImg = card.querySelector('.car-main-img');
                                            if (mainImg) mainImg.src = imgUrl;
                                    }}
                                />
                            ))}
                        </div>
                        <h3>{car.name}</h3>
                        {user && <p className="car-price">{car.price}</p>}
                        <p className="car-intro">{car.intro}</p>
                        {!user ? (
                            <button className="reserve-btn unlock-btn" onClick={onLoginClick}>
                                Log in to Reserve & See Daily Rates
                            </button>
                        ):(
                            <button 
                            className="reserve-btn" 
                            onClick={() => setSelectedCar(car)}
                            >
                                Select Days & Time
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {selectedCar && (
                <div className="booking-overlay">
                    <div className="booking-modal">
                        <button className="close-booking" style={{color: "black", padding: "0 2px", fontSize: "small"}} onClick={()=> setSelectedCar(null)}>x</button>
                        <h3>Booking Schedule: {selectedCar.name}</h3>

                        <form onSubmit={handleReservationSubmit} className="booking-form">
                             <div className="form-group-time">
                                <label>Pick-Up Date:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    min={getTodayDateString()} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                                <label>Pick-Up Hour:  </label>
                                    <select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
                                     {hoursDropdownOptions.map(hourObj => (
                                        <option key={hourObj.value} value={hourObj.value}>
                                            {hourObj.label} 
                                        </option> 
                                         ))}
                                    </select>
                            </div>

                            {/* 4. Re-engineered Return Field with standalone hour selector */}
                            <div className="form-group-time">
                                <label>Return Date:  </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || getTodayDateString()}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                                <label>Return Hour: </label>
                                    <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
                                        {hoursDropdownOptions.map(hourObj => (
                                        <option key={hourObj.value} value={hourObj.value}>
                                            {hourObj.label}
                                        </option>
                                         ))}
                                    </select>
                            </div>
                            <div className="delivery-section" style={{ margin: "15px 0", textAlign: "left" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "black" }}>
                                    <input 
                                        type="checkbox" 
                                        checked={wantsDelivery} 
                                        onChange={(e) => setWantsDelivery(e.target.checked)} 
                                        style={{ width: "auto" }}
                                    />
                                <strong>We can deliver your rental vehicle!</strong>
                            </label>

                            {/* Conditionally displays the location input text field only when the checkbox is ticked */}
                            {wantsDelivery && (
                                <div style={{ marginTop: "10px" }}>
                                    <label style={{ color: "black", display: "block", marginBottom: "5px" }}>
                                        Delivery Address / Drop-off Location:
                                    </label>
                                    <input 
                                     type="text" 
                                     placeholder="Enter complete street address, hotel, or airport name" 
                                    value={deliveryLocation} 
                                    onChange={(e) => setDeliveryLocation(e.target.value)} 
                                    required={wantsDelivery} // Automatically forces them to write an address if checked
                                    className="modal-input"
                                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                                />
                            </div>
                            )}
                            </div>
                            <button type="submit" disabled={isSubmitting} className="confirm-booking-btn">
                                {isSubmitting ? "Securing Your Car..." : "Confirm Reservation"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {lightboxImage && (
                <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
                    <button className="lightbox-close">✕</button>
                        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                            <img src={lightboxImage} alt="Enlarged vehicle preview" className="lightbox-img" />
                        </div>
                </div>
            )}
        </section>
    );
}