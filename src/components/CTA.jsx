import React from "react";
import "../style/cta.css";

export default function CTA({onLoginClick}){
    return (
        <section className="cta" id="cta">
            <h2>Reserve Your Vehicle Today!</h2>
            <p>Click on the button below to schedule your reservation</p>
            <button className="cta-btn" onClick={onLoginClick}>Reserve Now</button>
        </section>
    )
}