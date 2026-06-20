import "../style/contact.css";

export default function Contact() {
    return(
        <section className="contact" id="contact">
            <h2>Contact Information</h2>
                <div className="contact-grid">
                    <div className="contact-card">
                     <h3>Phone Number:</h3>
                        <p>012-345-6789</p>
                    </div>
                    <div className="contact-card">
                        <h3>Email:</h3>
                        <p>KenjiAutoRent@gmail.com</p>
                    </div>
                    <div className="contact-card">
                        <h3>Operation Hours</h3>
                        <p>8:00 AM - 8:00 PM, 7 Days a Week</p>
                    </div>
                    <div className="contact-card">
                        <h3>Location:</h3>
                        <p>Seattle, WA</p>
                    </div>
                </div>
        </section>
    )
}