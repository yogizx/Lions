import IP1 from "./images/IP1.png";
import IP2 from "./images/IP2.png";
import IP3 from "./images/IP3.png";
import IP4 from "./images/IP4.png";
import IP5 from "./images/IP5.png";
import IP6 from "./images/IP6.png";
import IP7 from "./images/IP7.png";

const projects = [
  {
    no: "PROJECT 01",
    title: "KENCANA HL (SAPURA KENCANA)",
    description:
      "Execution of hot insulation systems for industrial process piping to improve thermal retention and operational efficiency.",
    images: [IP1],
    imageType: "single",
    imagePosition: "left",
    details: [
      ["Insulation Type", "Hot Insulation"],
      ["Material", "SS304 / SS316 Aluminum Cladding + Rockwool"],
      ["Thickness", "50mm"],
      ["Pipe Sizes", '10", 16", 18"'],
      ["Status", "Completed"],
      ["Year", "2015"],
      ["Location", "Lumut, Perak"],
    ],
  },
  {
    no: "PROJECT 02",
    title: "KENCANA HL (SAPURA KENCANA)",
    description:
      "Personnel protection insulation for exposed process piping to reduce surface temperature risks.",
    images: [IP2, IP3],
    imageType: "single",
    imagePosition: "right",
    details: [
      ["Insulation Type", "Personnel Protection"],
      ["Material", "Weld Mesh + Calcium Silicate + SS Cladding"],
      ["Pipe Sizes", '6", 8", 10"'],
      ["Status", "Completed"],
      ["Year", "2015"],
      ["Location", "Lumut, Perak"],
    ],
  },
  {
    no: "PROJECT 03",
    title: "KENCANA HL (SAPURA KENCANA)",
    description:
      "Removable thermal insulation jackets designed for maintenance accessibility and operational heat control.",
    images: [IP4, IP5],
    imageType: "collage",
    imagePosition: "left",
    details: [
      ["Insulation Type", "Removable Insulation"],
      ["Material", "Weld Mesh + Ceramic Wool + SS316"],
      ["Pipe Sizes", '4", 6", 8"'],
      ["Status", "Completed"],
      ["Year", "2015"],
      ["Location", "Lumut, Perak"],
    ],
  },
  {
    no: "PROJECT 04",
    title: "KENCANA HL (SAPURA KENCANA)",
    description:
      "Cold insulation systems designed for condensation prevention and process stability.",
    images: [IP6, IP7],
    imageType: "collage",
    imagePosition: "right",
    details: [
      ["Insulation Type", "Cold Insulation"],
      ["Material", "Corrugated Cladding + Rockwool"],
      ["Pipe Sizes", '6", 8", 10"'],
      ["Status", "Completed"],
      ["Year", "2015"],
      ["Location", "Lumut, Perak"],
    ],
  },
];

function InsulationProjects() {
  return (
    <div
      className="font-['Roboto'] bg-[#f5f7fb] overflow-x-hidden"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      <section className="relative min-h-[300px] md:min-h-[430px] overflow-hidden flex items-center justify-center">
        <img
          src={IP2}
          alt="Insulation Projects Banner"
          className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110 saturate-125"
        />
        <div className="absolute inset-0 bg-[#081b3a]/55" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-white text-[40px] md:text-[58px] font-black leading-tight">
            Insulation Projects
          </h1>
        </div>
      </section>

      <section className="py-16 bg-[#f5f7fb]">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[#ff7a00] uppercase tracking-[5px] font-bold mb-4">
            Project Portfolio
          </p>

          <h2 className="text-[#081b3a] text-[32px] md:text-[38px] font-black">
            Featured Insulation Works
          </h2>

          <p className="text-[#6b7280] text-[17px] leading-[30px] mt-5 max-w-[820px] mx-auto">
            A professional showcase of completed insulation works delivered for
            thermal performance, process stability, and safer industrial
            operations.
          </p>
        </div>
      </section>

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
  const imagePanel =
    project.imageType === "collage" ? (
      <ProjectCollage images={project.images} title={project.title} />
    ) : (
      <ProjectImage images={project.images} title={project.title} />
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

function ProjectImage({ images, title }) {
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

function ProjectCollage({ images, title }) {
  return (
    <div className="flex flex-col gap-3 min-h-[320px] lg:min-h-[460px] bg-[#081b3a] p-3">
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
      <p className="text-[#ff7a00] text-[13px] uppercase tracking-[3px] font-black mb-3">
      </p>

      <h2 className="text-[#081b3a] text-[24px] md:text-[30px] font-black leading-tight uppercase">
        {project.title}
      </h2>

      <div className="mt-5 rounded-[22px] bg-[#f6f8fc] border border-[#e8edf5] p-5 md:p-6">
        <h3 className="text-[#081b3a] text-[19px] font-black mb-3">
          Project Description:
        </h3>

        <p className="text-[#5f6b7a] text-[16px] leading-[29px] font-medium">
          {project.description}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-[#081b3a] text-[21px] font-black mb-4">
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

export default InsulationProjects;
