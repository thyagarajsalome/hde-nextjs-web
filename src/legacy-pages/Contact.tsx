import React from "react";

const Contact = () => {
  return (
    <div className="info-page-container" style={{ textAlign: "center" }}>
      <h1>Contact Us</h1>
      <p>
        For any questions, support requests, or feedback, please do not hesitate
        to reach out to us.
      </p>
      <p style={{ fontSize: "1.0rem", margin: "0.5rem 0" }}>
        You can email us at:
        <br />
        <a
          href="mailto:hdeadmin@gmail.com"
          className="text-primary underline"
        >
          hdeadmin@gmail.com
        </a>
        
      </p>
      <p>We aim to respond to all inquiries within 48 business hours.</p>
    </div>
  );
};

export default Contact;
