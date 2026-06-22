import React, {useState, useEffect} from "react";
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
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

export default function Vehicles({ user, onLoginClick, onBookingSuccess  }) {
    const [selectedCar, setSelectedCar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [wantsDelivery, setWantsDelivery] = useState(false);
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

   
    const [dateRange, setDateRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key:"selection"
    }]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [startHour, setStartHour] = useState('09'); 
    const [endHour, setEndHour] = useState('17');   

   
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

    
    const getTodayDateString = () => {
        const now = new Date();
        return now.toISOString().split("T")[0];
    };

    const handleReservationSubmit = async (e) => {
    e.preventDefault();

    
    const formattedStartDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(dateRange[0].endDate, 'yyyy-MM-dd');

    const finalStartTime = `${formattedStartDate}T${startHour}:00:00`;
    const finalEndTime = `${formattedEndDate}T${endHour}:00:00`;

    if (new Date(finalStartTime) >= new Date(finalEndTime)) {
        return alert("Return date and hour must be after the pick-up date and hour.");
    }
    
    if (!user) return alert("Your login session expired. Please log in again.");

    setIsSubmitting(true);

    try {
        
        const { data: profileRow, error: profileError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle(); 

        if (profileError) console.error("Profile matching error:", profileError);

        const verifiedFullName = profileRow?.full_name || 
                                 user.user_metadata?.full_name || 
                                 user.email.split('@')[0];


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

       
        const { error: insertError } = await supabase
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

        alert(`🎉 Success! Your ${selectedCar.name} reservation is confirmed!`);
            
        
        setSelectedCar(null);
        setWantsDelivery(false);
        setDeliveryLocation("");
        
        
        setDateRange([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }]);

      
        if (onBookingSuccess) {
            onBookingSuccess(); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }

    } catch (error) {
        console.error("System Transaction Error Details:", error);
        
        
        const errorMessage = error.message || "";

        
        if (errorMessage.includes('unique_reservation_car_time_slot')) {
            alert(`Sorry, the ${selectedCar.name} has already been reserved for these day(s). Please try a different time slot!`);
            return; 
        } 
        
        
        if (errorMessage.includes('overlappingBookings')) {
            alert(`Sorry, the ${selectedCar.name} is already reserved during your selected hours.`);
            return;
        }

        
        alert(`Booking Error: ${errorMessage || "Something went wrong."}`);

    } finally {
        setIsSubmitting(false);
    }
};
    return (
        <section className="vehicles-section" id="vehicles">
            <h2>Explore Our Vehicle Catalog—small but mighty!</h2>

            <div className="vehicles-grid">
                {Fleet.map((car) =>(
                    <div key={car.id} className="car-card">
                        <div className="car-image-container" onClick={(e) => {
                            const currentSrc = e.currentTarget.querySelector('.car-main-img').src;
                            setLightboxImage(currentSrc)
                        }}>
                            <img 
                                src={car.images[0]} 
                                alt={car.name} 
                                className="car-main-img" 
                                style={{ cursor: "zoom-in" }} 
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
                                Log In To See Daily Rates & Reserve
                            </button>
                        ):(
                            <button 
                            className="reserve-btn" 
                            onClick={() => setSelectedCar(car)}
                            >
                                Select Day(s) & Time
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {selectedCar && (
    <div className="booking-overlay">
        <div className="booking-modal" style={{ overflow: "visible" }}> 
            <button className="close-booking" style={{color: "black", padding: "0 2px", fontSize: "small"}} onClick={()=> setSelectedCar(null)}>x</button>
            <h3>Booking Schedule: {selectedCar.name}</h3>

            <form onSubmit={handleReservationSubmit} className="booking-form">
                
                
                <div className="calendar-input-wrapper">
    <label>Rental Duration Dates:</label>
    <div 
        className="custom-date-trigger"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
    >
        📅 {format(dateRange[0].startDate, 'MMM dd, yyyy')} — {format(dateRange[0].endDate, 'MMM dd, yyyy')}
    </div>

    {isCalendarOpen && (
        <div className="calendar-popover-box">
            <button 
            type="button" 
            className="calendar-close-x" 
            onClick={() => setIsCalendarOpen(false)}
            aria-label="Close calendar"
        >
            ✕
        </button>
            <DateRangePicker
                onChange={item => setDateRange([item.selection])}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2} 
                ranges={dateRange}
                direction="horizontal"
                minDate={new Date()}
                staticRanges={[]} 
                inputRanges={[]}  
                months={isMobile ? 1 : 2} 
                direction={isMobile ? "vertical" : "horizontal"}
            />
            <button 
                type="button" 
                onClick={() => setIsCalendarOpen(false)}
                className="calendar-confirm-btn"
            >
                Confirm Selection
            </button>
        </div>
    )}
</div>

                
                <div className="form-group-time" style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ color: 'black', display: 'block', marginBottom: '4px' }}>Pick-Up Hour:</label>
                        <select value={startHour} onChange={(e) => setStartHour(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', cursor: "pointer"}}>
                            {hoursDropdownOptions.map(hourObj => (
                                <option key={hourObj.value} value={hourObj.value}>{hourObj.label}</option> 
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <label style={{ color: 'black', display: 'block', marginBottom: '4px' }}>Return Hour:</label>
                        <select value={endHour} onChange={(e) => setEndHour(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', cursor: "pointer" }}>
                            {hoursDropdownOptions.map(hourObj => (
                                <option key={hourObj.value} value={hourObj.value}>{hourObj.label}</option>
                            ))}
                        </select>
                    </div>
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
                                required={wantsDelivery}
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