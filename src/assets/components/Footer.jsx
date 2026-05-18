import logo from "../images/logo.png.jpeg";
import { Mail, MessageCircle, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const footerLinkClass =
    "inline-block px-2 py-1 -mx-2 -my-1 hover:text-[#ff7a00] duration-300 focus:outline-none focus:text-[#ff7a00]";

  return (
    <footer className="bg-[#061b3a] text-white pt-14 pb-6 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        
        {/* Company */}
        <div>
          <div className="relative inline-flex items-center justify-center bg-white rounded-[18px] px-5 py-3 mb-6 shadow-2xl border-b-[5px] border-[#ff7a00]">
            <div className="absolute inset-0 rounded-[18px] bg-[#ff7a00]/10 blur-xl"></div>

            <img
              src={logo}
              alt="Construction Logo"
              className="relative z-10 h-[70px] w-auto object-contain"
            />
          </div>

          <p className="text-gray-300 leading-7">
            We Lions Global Services strive to be a trusted & responsible
            organization, in which we live & work.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-5 text-[#ff7a00]">
            Quick Links
          </h3>

          <ul className="space-y-3 text-gray-300">
            <li>
              <Link to="/" className={footerLinkClass}>
                Home
              </Link>
            </li>

            <li>
              <Link to="/about" className={footerLinkClass}>
                About
              </Link>
            </li>

            <li>
              <Link to="/project" className={footerLinkClass}>
                Project
              </Link>
            </li>

            <li>
              <Link to="/contact" className={footerLinkClass}>
                Contact
              </Link>
            </li>

            <li>
              <Link to="/blogs" className={footerLinkClass}>
                Blog
              </Link>
            </li>

            <li>
              <Link to="/privacy-policy" className={footerLinkClass}>
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xl font-semibold mb-5 text-[#ff7a00]">
            Services
          </h3>

          <ul className="space-y-3 text-gray-300">
            <li>
              <Link
                to="/services/scaffolding-works"
                className={footerLinkClass}
              >
                Scaffolding Works
              </Link>
            </li>

            <li>
              <Link
                to="/services/insulation-works"
                className={footerLinkClass}
              >
                Insulation Works
              </Link>
            </li>

            <li>
              <Link
                to="/services/safety-net"
                className={footerLinkClass}
              >
                Safety Net
              </Link>
            </li>

            <li>
              <Link
                to="/services/building-construction-works"
                className={footerLinkClass}
              >
                Building Construction Works
              </Link>
            </li>

            <li>
              <Link
                to="/services/supply-of-man-power"
                className={footerLinkClass}
              >
                Supply Of Man Power
              </Link>
            </li>

            <li>
              <Link
                to="/services/security-supply"
                className={footerLinkClass}
              >
                Security Supply
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold mb-5 text-[#ff7a00]">
            Contact
          </h3>

          <ul className="space-y-4 text-gray-300">
            
            <li>
              No.33, Tingkat Satu, Jalan Kelang Lama Square 1, Kelang Lama
              Square, 09000 Kulim, Kedah.
            </li>

            {/* Email 1 */}
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#ff7a00]" />

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=info@lionsglobalservices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff7a00] duration-300 break-all"
              >
                info@lionsglobalservices.com
              </a>
            </li>

            {/* Email 2 */}
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#ff7a00]" />

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=lionsglobalservices@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff7a00] duration-300 break-all"
              >
                lionsglobalservices@gmail.com
              </a>
            </li>

            {/* Whatsapp */}
            <li className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-[#ff7a00]" />

              <a
                href="https://wa.me/60164854506"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff7a00] duration-300"
              >
                Whatsapp: +60 16-4854506
              </a>
            </li>

            {/* Phone */}
            <li className="flex items-center gap-3">
              <PhoneCall className="w-4 h-4 text-[#ff7a00]" />

              <a
                href="tel:+6045522076"
                className="hover:text-[#ff7a00] duration-300"
              >
                Landline: +60-45522076
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-10 pt-5 text-center text-gray-400 text-sm">
        © 2026 Lionsglobalservices.com | All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;