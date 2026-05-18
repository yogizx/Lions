import GL0 from "./images/GL0.png";
import GL1 from "./images/GL1.png";
import GL2 from "./images/GL2.png";
import GL3 from "./images/GL3.png";
import GL4 from "./images/GL4.png";
import GL5 from "./images/GL5.png";
import GL6 from "./images/GL6.png";
import GL7 from "./images/GL7.png";
import GL8 from "./images/GL8.png";
import GL9 from "./images/GL9.png";

function Gallery() {
  const galleryImages = [
    { src: GL0, title: "Site Operations", className: "md:col-span-2 md:row-span-2" },
    { src: GL1, title: "Project Execution", className: "" },
    { src: GL2, title: "Industrial Works", className: "" },
    { src: GL3, title: "Team Coordination", className: "md:col-span-2" },
    { src: GL4, title: "Safety Standards", className: "" },
    { src: GL5, title: "Work Progress", className: "" },
    { src: GL6, title: "Construction Support", className: "md:col-span-2" },
    { src: GL7, title: "Quality Workmanship", className: "" },
    { src: GL8, title: "Service Delivery", className: "" },
    { src: GL9, title: "Completed Works", className: "md:col-span-2" },
  ];

  return (
    <div className="font-['Roboto'] bg-[#f6f8fc] overflow-x-hidden" style={{ fontFamily: "Roboto, sans-serif" }}>
      <section
        className="relative py-32 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(120deg, rgba(8,27,58,0.96), rgba(8,27,58,0.76)), url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=90&w=2200&auto=format&fit=crop")',
        }}
      >
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-[760px]">
          

            <h1 className="text-white text-[46px] md:text-[55px] font-black leading-tight">
              Project Gallery
            </h1>

            <p className="text-white/80 text-[18px] md:text-[21px] leading-[36px] mt-8">
              A look at our industrial, construction, scaffolding, insulation,
              and safety-focused work across project sites.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#f6f8fc]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="text-center mb-14">
            <p className="text-[#ff7a00] uppercase tracking-[5px] font-bold mb-4">
              Our Works
            </p>

            <h2 className="text-[#081b3a] text-[38px] md:text-[44px] font-black leading-tight">
              Gallery of Recent Site Activities
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 auto-rows-[280px] gap-6">
            {galleryImages.map((image, index) => (
              <GalleryCard
                key={image.title}
                image={image}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function GalleryCard({ image, index }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[30px] bg-[#081b3a] shadow-xl ${image.className}`}
    >
      <img
        src={image.src}
        alt={image.title}
        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
        loading={index > 3 ? "lazy" : "eager"}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#081b3a]/90 via-[#081b3a]/25 to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />

      <div className="absolute inset-0 translate-y-6 bg-[#ff7a00]/0 transition duration-500 group-hover:translate-y-0 group-hover:bg-[#ff7a00]/10" />

    </article>
  );
}

export default Gallery;