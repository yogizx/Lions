import { useRef } from "react";
import emailjs from "@emailjs/browser";
import { PhoneCall, MapPin } from "lucide-react";
import ContactBanner from "./images/contact.png";

function Contact() {
  const formRef = useRef();

 const sendEmail = (e) => {
  e.preventDefault();

  emailjs
    .sendForm(
      "service_k4o2f0k",
      "template_6aqmtyr",
      formRef.current,
      "rOj0SI81v4KfxkduV"
    )
    .then(
      (result) => {
        console.log("SUCCESS:", result.text);
        alert("Message sent successfully!");
        formRef.current.reset();
      },
      (error) => {
        console.log("EMAILJS ERROR:", error);
        alert(error.text || "Something went wrong. Please try again.");
      }
    );
};

  return (
    <div
      className="font-['Roboto'] bg-[#f5f7fb] overflow-x-hidden"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      {/* Banner */}
      <section className="relative min-h-[320px] md:min-h-[500px] overflow-hidden flex items-center justify-center">
        <img
          src={ContactBanner}
          className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110 saturate-125"
          alt="Contact Banner"
        />

        <div className="absolute inset-0 bg-[#081b3a]/55" />

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="relative text-white text-[46px] md:text-[64px] font-black leading-tight">
              Contact
            </h1>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-[#f5f7fb]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <p className="text-[#ff7a00] uppercase tracking-[5px] font-bold mb-4">
              Get In Touch
            </p>

            <h2 className="text-[#081b3a] text-[40px] md:text-[38px] font-black">
              Let’s Discuss Your Project
            </h2>
          </div>

          {/* Contact Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20">
            <ContactCard
              icon={<MapPin />}
              title="Address - Head Quarters"
              text={
                <>
                  No.33 , Tingkat Satu, Jalan Kelang Lama Square 1,
                  Kelang Lama Square, 09000 Kulim, Kedah.
                  <br />
                  info@lionsglobalservices.com
                </>
              }
            />

            <ContactCard
              icon={<PhoneCall />}
              title="Contact"
              text={
                <>
                  Monday-Thursday (8:00am - 6:00pm) | Friday
                  (8:00am - 5:00pm)
                  <br />
                  Saturday & Sunday Closed
                  <br />
                  lionsglobalservices@gmail.com
                  <br />
                  Whatsapp : +60 16-4854506
                  <br />
                  Landline : +60-45522076
                </>
              }
            />
          </div>

          {/* Form Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#ff7a00] uppercase tracking-[5px] font-bold mb-4">
                Send Message
              </p>

              <h2 className="text-[#081b3a] text-[38px] md:text-[40px] font-black leading-tight mb-8">
                Ready To Start Your Construction Project?
              </h2>

              <p className="text-[#6b7280] leading-[34px] text-[17px]">
                Contact our experienced industrial and construction
                team for scaffolding works, insulation services,
                manpower supply, safety net installation, and more.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mt-12">
                <StatCard number="18+" text="Years Experience" />
                <StatCard number="230+" text="Expert Engineers" />
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-[36px] shadow-2xl p-8 md:p-12">
              <h3 className="text-[#081b3a] text-[36px] font-black mb-8">
                Request A Quote
              </h3>

              <form
                ref={formRef}
                onSubmit={sendEmail}
                className="space-y-6"
              >
                <input
                  type="text"
                  name="user_name"
                  placeholder="Full Name"
                  required
                  className="w-full h-[65px] bg-[#f5f7fb] rounded-2xl px-6 text-[#081b3a] outline-none"
                />

                <input
                  type="email"
                  name="user_email"
                  placeholder="Email Address"
                  required
                  className="w-full h-[65px] bg-[#f5f7fb] rounded-2xl px-6 text-[#081b3a] outline-none"
                />

                <input
                  type="text"
                  name="user_phone"
                  placeholder="Phone Number"
                  required
                  className="w-full h-[65px] bg-[#f5f7fb] rounded-2xl px-6 text-[#081b3a] outline-none"
                />

                <select
                  name="service"
                  required
                  defaultValue=""
                  className="w-full h-[65px] bg-[#f5f7fb] rounded-2xl px-6 text-[#081b3a] outline-none"
                >
                  <option value="" disabled>
                    Select Service
                  </option>

                  <option value="Scaffolding Works">
                    Scaffolding Works
                  </option>

                  <option value="Insulation Works">
                    Insulation Works
                  </option>

                  <option value="Safety Net">
                    Safety Net
                  </option>

                  <option value="Building Construction">
                    Building Construction
                  </option>

                  <option value="Supply Of Man Power">
                    Supply Of Man Power
                  </option>

                  <option value="Security Supply">
                    Security Supply
                  </option>
                </select>

                <textarea
                  rows="5"
                  name="message"
                  placeholder="Your Message"
                  required
                  className="w-full bg-[#f5f7fb] rounded-2xl px-6 py-5 text-[#081b3a] outline-none"
                />

                <button
                  type="submit"
                  className="w-full h-[65px] bg-[#ff7a00] text-white rounded-2xl font-bold text-[18px] hover:bg-[#e66e00] transition duration-300"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="pb-24 bg-[#f5f7fb]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="rounded-[40px] overflow-hidden shadow-2xl h-[500px]">
            <iframe
              src="https://maps.google.com/maps?q=No.33%20Tingkat%20Satu%2C%20Jalan%20Kelang%20Lama%20Square%201%2C%20Kulim%2C%20Kedah%2C%20Malaysia&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full"
              loading="lazy"
              title="Lions Global Services Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon, title, text }) {
  return (
    <div className="bg-white rounded-[30px] p-10 shadow-xl text-center hover:-translate-y-2 duration-300">
      <div className="w-20 h-20 rounded-full bg-[#ff7a00] flex items-center justify-center mx-auto mb-8 text-white">
        {icon}
      </div>

      <h3 className="text-[#081b3a] text-[28px] font-black mb-4">
        {title}
      </h3>

      <p className="text-[#6b7280] leading-[32px]">
        {text}
      </p>
    </div>
  );
}

function StatCard({ number, text }) {
  return (
    <div className="bg-white rounded-[24px] p-8 shadow-lg">
      <h3 className="text-[#ff7a00] text-[42px] font-black">
        {number}
      </h3>

      <p className="text-[#081b3a] font-semibold mt-2">
        {text}
      </p>
    </div>
  );
}

export default Contact;