import {
  Building2,
  Wrench,
  Shield,
  Users,
  Hammer,
  Briefcase,
  ShieldCheck,
  Clock3,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import ServicesBanner from "./images/services.png";
import ScaffoldingImage from "./images/scaffolding.png";
import InsulationImage from "./images/insulation.png";
import SafetyImage from "./images/safety.png";
import ManpowerImage from "./images/manpower.png";
import BuildingImage from "./images/Building.png";
import SecurityImage from "./images/security.png";

function Services() {
  return (
    <div
      className="font-['Roboto'] bg-[#f5f7fb] overflow-x-hidden"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      {/* HERO */}
      <section className="relative min-h-[320px] md:min-h-[500px] overflow-hidden flex items-center justify-center">
        <img
          src={ServicesBanner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110 saturate-125"
        />

        <div className="absolute inset-0 bg-[#081b3a]/55"></div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="relative text-white text-[46px] md:text-[64px] font-black leading-tight">
              Services
            </h1>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 bg-[#f5f7fb] relative overflow-hidden">
        <div className="absolute left-[-150px] top-[100px] w-[350px] h-[350px] rounded-full bg-[#ff7a00]/10 blur-[80px]" />

        <div className="max-w-[1450px] mx-auto px-6 lg:px-16">
          <div className="text-center mb-20">
            <p className="text-[#ff7a00] uppercase tracking-[6px] font-bold mb-4">
              Our Expertise
            </p>

            <h2 className="text-[#081b3a] text-[42px] md:text-[38px] font-black">
              Professional Services
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <ServiceCard
              image={ScaffoldingImage}
              icon={<Building2 />}
              title="Scaffolding"
              text="Scaffolding is a temporary structure used to provide safe and efficient access for workers to perform tasks at heights during construction or maintenance projects."
              path="/services/scaffolding-works"
            />

            <ServiceCardDark
              image={InsulationImage}
              icon={<Wrench />}
              title="Insulation"
              text="Insulation is essential for controlling heat transfer, improving energy efficiency, and creating comfortable industrial and commercial environments."
              path="/services/insulation-works"
            />

            <ServiceCard
              image={SafetyImage}
              icon={<Shield />}
              title="Safety Catch Net"
              text="Safety catch nets are designed to prevent falls and create secure working conditions in high-rise construction and industrial environments."
              path="/services/safety-net"
            />

            <ServiceCardDark
              image={ManpowerImage}
              icon={<Users />}
              title="Supply Of Man Power"
              text="We provide experienced and skilled manpower support for industrial, construction, maintenance, and engineering projects with flexible workforce solutions."
              path="/services/supply-of-man-power"
            />

            <ServiceCard
              image={BuildingImage}
              icon={<Hammer />}
              title="Building Construction Works"
              text="We handle industrial and commercial construction works with quality materials, proper planning, structural safety, and modern construction practices."
              path="/services/building-construction-works"
            />

            <ServiceCardDark
              image={SecurityImage}
              icon={<Briefcase />}
              title="Security Supply"
              text="Security supply services include professional guards, monitoring support, access control, and industrial site protection for safe operations."
              path="/services/security-supply"
            />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-24 bg-[#081b3a] relative overflow-hidden">
        <div className="absolute right-[-100px] bottom-[-100px] w-[320px] h-[320px] bg-[#ff7a00]/20 rounded-full blur-[70px]" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative">
          <div className="text-center mb-16">
            <p className="text-[#ff7a00] uppercase tracking-[6px] font-bold mb-4">
              Why Choose Us
            </p>

            <h2 className="text-white text-[42px] md:text-[38px] font-black">
              Quality Service With Safety
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <WhyCard
              icon={<ShieldCheck />}
              title="Safety Focused"
              text="Strong safety procedures and trained workforce."
            />

            <WhyCard
              icon={<Clock3 />}
              title="On-Time Delivery"
              text="Timely execution with organized project planning."
            />

            <WhyCard
              icon={<Users />}
              title="Experienced Team"
              text="Skilled manpower and professional supervisors."
            />

            <WhyCard
              icon={<Award />}
              title="Quality Standards"
              text="High-quality service and project management support."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ image, icon, title, text, path }) {
  return (
    <Link to={path} className="group block bg-white rounded-[36px] overflow-hidden shadow-2xl hover:-translate-y-2 duration-300 no-underline">
      <div className="grid md:grid-cols-2 md:min-h-[450px]">
        <div className="overflow-hidden h-[280px] sm:h-[360px] md:h-auto md:min-h-[512px]">
  <img
    src={image}
    className="w-full h-full object-cover duration-500 group-hover:scale-110"
    alt={title}
  />
</div>

        <div className="p-10 flex flex-col justify-center">
          <div className="w-[75px] h-[75px] rounded-[24px] bg-[#ff7a00] flex items-center justify-center mb-7 text-white">
            {icon}
          </div>

          <h3 className="text-[#081b3a] text-[32px] font-black mb-5">
            {title}
          </h3>

          <p className="text-[#5f6b7a] leading-[32px] text-[17px]">
            {text}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ServiceCardDark({ image, icon, title, text, path }) {
  return (
    <Link to={path} className="group block bg-[#081b3a] rounded-[36px] overflow-hidden shadow-2xl hover:-translate-y-2 duration-300 no-underline">
      <div className="grid md:grid-cols-2 md:min-h-[450px]">
        <div className="p-10 order-2 md:order-1 flex flex-col justify-center">
          <div className="w-[75px] h-[75px] rounded-[24px] bg-[#ff7a00] flex items-center justify-center mb-7 text-white">
            {icon}
          </div>

          <h3 className="text-white text-[32px] font-black mb-5">
            {title}
          </h3>

          <p className="text-white/75 leading-[32px] text-[17px]">
            {text}
          </p>
        </div>

       <div className="overflow-hidden order-1 md:order-2 h-[280px] sm:h-[360px] md:h-auto md:min-h-[512px]">
  <img
    src={image}
    className="w-full h-full object-cover duration-500 group-hover:scale-110"
    alt={title}
  />
</div>
      </div>
    </Link>
  );
}

function WhyCard({ icon, title, text }) {
  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-[30px] p-8 border border-white/10 transition duration-300 ease-out hover:-translate-y-2 hover:bg-white/15 hover:border-[#ff7a00]/45 hover:shadow-2xl hover:shadow-[#ff7a00]/10">
      <div className="text-[#ff7a00] w-11 h-11 mb-6 transition duration-300 ease-out group-hover:scale-110 group-hover:text-white">{icon}</div>

      <h3 className="text-white text-[24px] font-bold mb-4">{title}</h3>

      <p className="text-white/70 leading-[30px]">{text}</p>
    </div>
  );
}

export default Services;
