import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  HardHat,
  Award,
  ShieldCheck,
  Wrench,
  Users,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import bannerOne from "./images/h1.png.jpg";
import bannerTwo from "./images/h2.png.jpg";

const banners = [
  {
    image: bannerOne,
    heading: "Building Industrial Excellence With Safety & Precision",
    text: "Delivering high-quality scaffolding, insulation, safety systems, manpower supply, and industrial construction services across multiple industries.",
    buttonText: "Explore Services",
    path: "/services",
  },
  {
    image: bannerTwo,
    heading: "Specialized Industrial Solutions For Critical Operations",
    text: "Supporting oil & gas, power plants, steel mills, manufacturing facilities, and industrial infrastructure with reliable technical solutions.",
    buttonText: "Request Consultation",
    path: "/contact",
  },
];

function Home() {
  const navigate = useNavigate();

  const [currentBanner, setCurrentBanner] = useState(0);

  const activeBanner = banners[currentBanner];
  const isFirstBanner = currentBanner === 0;

  return (
    <main className="bg-[#f5f7fb] font-['Roboto'] overflow-x-hidden" style={{ fontFamily: "Roboto, sans-serif" }}>
      {/* HERO SECTION */}
      <section className="relative w-full h-[78vh] overflow-hidden">
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner.image}
            className={`absolute inset-0 w-full h-full object-cover brightness-105 contrast-110 saturate-125 transition-opacity duration-1000 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
            alt="Construction Banner"
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-[#081b3a]/95 via-[#081b3a]/70 to-transparent"></div>

        <div className="absolute inset-0 flex items-center">
          <div className="w-full pl-8 md:pl-16 lg:pl-28 xl:pl-40">
            <div className="max-w-[900px]">
              <p className="text-[#ff7a00] uppercase tracking-[4px] font-semibold mb-5">
                Lions Global Services
              </p>

              <h1 className="text-white text-[45px] md:text-[55px] leading-tight font-black">
                {activeBanner.heading}
              </h1>

              <p className="text-white/90 text-[18px] md:text-[22px] mt-8 leading-relaxed">
                {activeBanner.text}
              </p>

              <div className="flex flex-wrap gap-5 mt-10">
                <button
                  onClick={() => navigate(activeBanner.path)}
                  className="bg-[#ff7a00] hover:bg-[#ea6f00] duration-300 text-white px-9 py-4 rounded-full font-semibold"
                >
                  {activeBanner.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentBanner(isFirstBanner ? 1 : 0)}
          aria-label={isFirstBanner ? "Show second banner" : "Show first banner"}
          className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 bg-[#ff7a00] hover:bg-[#ea6f00] duration-300 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl"
        >
          {isFirstBanner ? (
            <ChevronRight className="w-7 h-7" />
          ) : (
            <ChevronLeft className="w-7 h-7" />
          )}
        </button>
      </section>

      {/* TRUST METRICS */}
      <section className="py-[72px] md:py-20 bg-[#f4f7fb] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          <div className="text-center">
            <h2 className="text-[34px] md:text-[38px] font-black text-[#081b3a]">
              TRUST METRICS SECTION
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7 mt-12">
            {[
              [
                "150+",
                "Projects Delivered",
                Building2,
                "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=90&w=1200&auto=format&fit=crop",
              ],
              [
                "300+",
                "Skilled Workforce",
                HardHat,
                "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=90&w=1200&auto=format&fit=crop",
              ],
              [
                "Malaysia-Wide",
                "Nationwide Coverage",
                Award,
                "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=90&w=1200&auto=format&fit=crop",
              ],
              [
                "Safety First",
                "Compliance Commitment",
                ShieldCheck,
                "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=90&w=1200&auto=format&fit=crop",
              ],
            ].map(([num, title, Icon, image], index) => (
              <div
                key={index}
                className="relative bg-white rounded-[28px] overflow-hidden shadow-2xl hover:-translate-y-3 duration-300"
              >
                <div className="h-[145px] overflow-hidden">
                  <img
                    src={image}
                    className="w-full h-full object-cover"
                    alt={title}
                  />
                </div>

                <div className="absolute top-[108px] left-6 w-[74px] h-[74px] rounded-2xl bg-[#ff7a00] flex items-center justify-center shadow-xl">
                  <Icon className="text-white w-9 h-9" />
                </div>

                <div className="p-6 pt-14">
                  <h2 className="text-[28px] md:text-[30px] xl:text-[32px] font-black text-[#081b3a] leading-tight">
                    {num}
                  </h2>
                  <p className="text-[20px] text-[#4b5563] font-semibold">
                    {title}
                  </p>

                  <div className="mt-5 h-[6px] bg-[#edf1f6] rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-[#ff7a00] rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-[35px] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1974&auto=format&fit=crop"
                className="w-full h-[650px] object-cover"
                alt="About"
              />
            </div>

            <div className="absolute -bottom-10 -right-5 bg-[#ff7a00] text-white p-10 rounded-[30px] shadow-2xl">
              <h2 className="text-[60px] font-black">18+</h2>
              <p className="text-[22px] font-semibold">
                Years <br /> Experience
              </p>
            </div>
          </div>

          <div>
            <p className="text-[#ff7a00] uppercase tracking-[4px] font-semibold mb-5">
              About Company
            </p>

            <h2 className="text-[30px] md:text-[38px] font-black text-[#081b3a] leading-tight">
            Trusted Industrial Service Partner for Malaysia’s Project Demands

            </h2>

            <p className="text-[#6b7280] text-[18px] leading-[36px] mt-8">
             Lions Global Services is a trusted industrial service provider supporting infrastructure, industrial maintenance, shutdown operations, construction access, and workforce deployment across Malaysia.
With a commitment to operational safety, technical precision, and responsive project execution, we help clients maintain productivity while ensuring compliance and site readiness.
From industrial scaffolding systems and insulation works to manpower deployment and engineered access solutions, our team is positioned to deliver practical support for time-sensitive and complex project environments.

            </p>

           
            <button
              onClick={() => navigate("/about")}
              className="mt-10 bg-[#081b3a] hover:bg-[#12305f] duration-300 text-white px-8 py-4 rounded-full font-semibold"
            >
              Learn More About Lions
            </button>
          </div>
        </div>
      </section>

      {/* MAN HOURS */}
      <section className="relative py-28 overflow-hidden bg-[#081b3a]">
        <img
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=90&w=2200&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          alt=""
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#081b3a] via-[#081b3a]/90 to-[#081b3a]/70"></div>

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#ff7a00] uppercase tracking-[6px] font-bold mb-5">
              Safety & Excellence
            </p>

            <h2 className="font-black leading-[0.9] tracking-normal md:tracking-[-6px] mt-6">
              <span
                className="block text-white"
                style={{ fontSize: "clamp(36px, 8vw, 60px)", lineHeight: "1" }}
              >
                Crossed More Than
              </span>

              <div className="flex items-end gap-5">
                <span
                  className="text-[#ff7a00]"
                  style={{ fontSize: "clamp(36px, 8vw, 60px)", lineHeight: "1" }}
                >
                  3,70,000
                </span>

                <span
                  className="text-white"
                  style={{ fontSize: "clamp(36px, 8vw, 60px)", lineHeight: "1" }}
                >
                  Man
                </span>
              </div>

              <span
                className="block text-white"
                style={{ fontSize: "clamp(38px, 8vw, 65px)", lineHeight: "1" }}
              >
                Hours
              </span>
            </h2>

            <p className="text-white/75 text-[18px] leading-[34px] mt-8 max-w-[650px]">
              Delivering exceptional industrial construction solutions with
              strong commitment towards workforce safety, operational excellence,
              and world-class project execution.
            </p>

            <div className="flex flex-wrap gap-5 mt-10">
              <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl px-6 py-5">
                <h3 className="text-white text-[30px] font-black">0</h3>
                <p className="text-white/70">Major Accidents</p>
              </div>

              <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl px-6 py-5">
                <h3 className="text-white text-[30px] font-black">100%</h3>
                <p className="text-white/70">Safety Focused</p>
              </div>
            </div>
          </div>

          <div className="relative bg-white rounded-[38px] p-10 md:p-14 shadow-2xl">
            <div className="w-[90px] h-[90px] rounded-[28px] bg-[#ff7a00] flex items-center justify-center mb-10">
              <ShieldCheck className="text-white w-12 h-12" />
            </div>

            <h3 className="text-[#081b3a] text-[34px] md:text-[38px] font-black leading-tight">
              Safety Driven Project Culture
            </h3>

            <p className="text-[#475569] text-[18px] md:text-[19px] leading-[36px] mt-6 max-w-[660px] font-normal">
              Reliable and trustworthy, with a proven track record of delivering
              high-quality work on time and within budget. They should be licensed,
              insured, and compliant with all relevant regulations and standards,
              and have a strong reputation for excellence and customer satisfaction.
            </p>

            <div className="mt-12 space-y-8">
              {[
                ["Scaffolding Works", "95%"],
                ["Insulation Works", "92%"],
                ["Safety Net", "96%"],
                ["Building Construction Works", "90%"],
                ["Supply of Man Power", "94%"],
                ["Security Supply", "91%"],
              ].map(([name, percent]) => (
                <div key={name}>
                  <div className="mb-3">
                    <span className="text-[#081b3a] font-bold text-[18px]">
                      {name}
                    </span>
                  </div>
                  <div className="h-[10px] bg-[#e8edf5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff7a00] rounded-full"
                      style={{ width: percent }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OUR EXPERTISE */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center">
            <p className="text-[#ff7a00] uppercase tracking-[4px] font-semibold mb-4">
              What We Do
            </p>
            <h2 className="text-[42px] md:text-[38px] font-black text-[#081b3a]">
              Our Expertise
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[
              ["Scaffolding", Building2],
              ["Insulation", Wrench],
              ["Safety Catch Net", ShieldCheck],
              ["Supply Of Man Power", Users],
              ["Building Construction", HardHat],
              ["Security Supply", BriefcaseBusiness],
            ].map(([title, Icon]) => (
              <div
                key={title}
                className="bg-[#f8fafc] hover:bg-[#081b3a] duration-300 rounded-[30px] p-10 shadow-lg group hover:-translate-y-3"
              >
                <div className="w-[80px] h-[80px] rounded-2xl bg-[#ff7a00] flex items-center justify-center mb-8">
                  <Icon className="text-white w-9 h-9" />
                </div>

                <h3 className="text-[28px] font-bold text-[#081b3a] group-hover:text-white">
                  {title}
                </h3>

                <p className="text-[#6b7280] group-hover:text-white/80 leading-[32px] mt-5">
                  Professional {title.toLowerCase()} solutions for industrial
                  and construction projects with quality and safety standards.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="bg-[#ff7a00] py-24">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-white text-[42px] md:text-[58px] font-black leading-tight">
           Need Industrial Project <br /> Support in Malaysia?
          </h2>

          <p className="text-white/90 text-[18px] leading-[34px] mt-8 max-w-[800px] mx-auto">
           Talk to Lions Global Services for scaffolding, insulation, manpower supply, safety net systems, and construction execution support.

          </p>

          <button
            onClick={() => navigate("/contact")}
            className="mt-10 bg-[#081b3a] hover:bg-[#0f2d5f] duration-300 text-white px-10 py-5 rounded-full font-semibold"
          >
             Request Quote 
          </button>
        </div>
      </section>
    </main>
  );
}

export default Home;