import SC1 from "./images/SC1.png";
import SC2 from "./images/SC2.png";
import SC3 from "./images/SC3.png";
import SC4 from "./images/SC4.png";

const projects = [
  {
    no: "PROJECT 01",
    title: "KL ECO CITY — D’SCAFF ENGINEERING",
    description:
      "Installation of safety catch net systems for elevated construction work zones to enhance worker protection and site compliance.",
    images: [SC1, SC2],
    imagePosition: "left",
    details: [
      ["Service Type", "Safety Catch Net Installation"],
      ["Material", "Safety Net System with Reinforced Border Rope"],
      ["Net Measurement", "25m per net roll (Approx.)"],
      ["Work Scope", "Temporary Fall Protection"],
      ["Status", "Completed"],
      ["Year", "2017"],
      ["Location", "Bangsar, Kuala Lumpur"],
    ],
  },
  {
    no: "PROJECT 02",
    title: "MKH SAVILLE — D’SCAFF ENGINEERING",
    description:
      "Deployment of perimeter and working deck safety catch net systems for construction worker fall protection.",
    images: [SC3, SC4],
    imagePosition: "right",
    details: [
      ["Service Type", "Safety Catch Net Installation"],
      ["Material", "Safety Net System with Border Rope"],
      ["Net Measurement", "25m per net roll"],
      ["Work Scope", "Construction Safety Protection"],
      ["Status", "Completed"],
      ["Year", "2017"],
      ["Location", "Cheras, Kuala Lumpur"],
    ],
  },
];

function SafetyCatchNetProjects() {
  return (
    <div
      className="font-['Roboto'] bg-[#f5f7fb] overflow-x-hidden"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      {/* HERO */}
      <section className="relative min-h-[300px] md:min-h-[430px] overflow-hidden flex items-center justify-center">
        <img
          src={SC4}
          alt="Safety Catch Net Projects Banner"
          className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110 saturate-125"
        />

        <div className="absolute inset-0 bg-[#081b3a]/55" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-white text-[40px] md:text-[58px] font-black leading-tight">
            Safety Catch Net Projects
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-16 bg-[#f5f7fb]">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[#ff7a00] uppercase tracking-[5px] font-bold mb-4">
            Project Portfolio
          </p>

          <h2 className="text-[#081b3a] text-[32px] md:text-[38px] font-black">
            Featured Safety Catch Net Works
          </h2>

          <p className="text-[#6b7280] text-[17px] leading-[30px] mt-5 max-w-[820px] mx-auto">
            A professional showcase of completed safety catch net installations
            supporting elevated construction zones, fall protection, and site
            compliance.
          </p>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="pb-20 bg-[#f5f7fb]">
        <div className="max-w-[1250px] mx-auto px-6 lg:px-12 space-y-12">
          {projects.map((project) => (
            <ProjectShowcase key={project.no} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProjectShowcase({ project }) {
  const imagePanel = (
    <ProjectImages images={project.images} title={project.title} />
  );
  const detailsPanel = <ProjectDetails project={project} />;

  return (
    <article className="group relative overflow-hidden rounded-[28px] bg-white shadow-xl border border-[#e8edf5] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl">
      <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-[#ff7a00]/10 rounded-bl-full" />

      <div className="relative grid lg:grid-cols-2 items-stretch">
        {project.imagePosition === "left" ? (
          <>
            {imagePanel}
            {detailsPanel}
          </>
        ) : (
          <>
            {detailsPanel}
            {imagePanel}
          </>
        )}
      </div>
    </article>
  );
}

function ProjectImages({ images, title }) {
  return (
    <div className="flex flex-col gap-3 min-h-[320px] lg:min-h-[460px] overflow-hidden bg-[#081b3a] p-3">
      {images.map((image, index) => (
        <div
          key={image}
          className="flex-1 min-h-[150px] overflow-hidden rounded-[18px] shadow-md"
        >
          <img
            src={image}
            alt={`${title} project image ${index + 1}`}
            className="w-full h-full object-cover transition duration-700 ease-out hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}

function ProjectDetails({ project }) {
  return (
    <div className="relative p-6 md:p-8 lg:p-10 flex flex-col justify-center">
      <h2 className="text-[#081b3a] text-[26px] md:text-[32px] font-black leading-tight uppercase">
        {project.title}
      </h2>

      <div className="mt-6 rounded-[22px] bg-[#f6f8fc] border border-[#e8edf5] p-5 md:p-6">
        <h3 className="text-[#081b3a] text-[20px] font-black mb-3">
          Project Description:
        </h3>

        <p className="text-[#5f6b7a] text-[16px] leading-[29px] font-medium">
          {project.description}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-[#081b3a] text-[22px] font-black mb-4">
          Project Details
        </h3>

        <div className="grid sm:grid-cols-2 gap-3">
          {project.details.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[18px] bg-white border border-[#e8edf5] p-4 shadow-sm transition duration-300 hover:border-[#ff7a00]/45 hover:shadow-md"
            >
              <p className="text-[#ff7a00] text-[12px] uppercase tracking-[2px] font-black">
                {label}
              </p>

              <p className="text-[#081b3a] text-[15px] leading-[24px] font-bold mt-2">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SafetyCatchNetProjects;