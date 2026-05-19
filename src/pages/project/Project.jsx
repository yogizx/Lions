import { useMemo, useRef, useState } from "react";
import ProjectBanner from "./images/project.png";

const ITEMS_PER_PAGE = 8;

const projects = [
  [1, "2014", "KENCANA HL SDN BHD", "LUMUT, PERAK", "TO CARRY OUT SCAFFOLDING/INSULATION WORKS FOR EPCIC OF EVA PROJECT", "40,000", "COMPLETED"],
  [2, "2014", "SAMSUNG ENGINEERING & CON SDN BHD", "PRAI, PENANG", "TO CARRY OUT SCAFFOLDING/INSULATION WORKS FOR BOILER BUILDING", "10,000", "COMPLETED"],
  [3, "2014", "TECHNOFIT SDN BHD", "PRAI, PENANG", "TO CARRY OUT SCAFFOLDING WORKS FOR BOILER AREA", "15,000", "COMPLETED"],
  [4, "2014", "TECHNOFIT SDN BHD", "PRAI, PENANG", "TO CARRY OUT SCAFFOLDING WORKS FOR CCGT PRAI POWER PLANT", "933", "COMPLETED"],
  [5, "2014", "BOILER CARE SDN BHD", "LUMUT, PERAK", "TO CARRY OUT SCAFFOLDING/INSULATION WORKS FOR SEGARI POWER PLANT", "4,000", "COMPLETED"],
  [6, "2014", "KENCANA HL SDN BHD", "LUMUT, PERAK", "TO CARRY OUT SCAFFOLDING WORK FOR KM3 (SSTDU) PROJECT", "33,000", "COMPLETED"],
  [7, "2015", "KENCANA HL SDN BHD", "LUMUT, PERAK", "TO CARRY OUT SCAFFOLDING/INSULATION WORK FOR CENDOR PROJECT", "3,800", "COMPLETED"],
  [8, "2015", "KENCANA HL SDN BHD", "LUMUT, PERAK", "TO CARRY OUT SCAFFOLDING/INSULATION WORK FOR CPOC PROJECT", "10,000", "COMPLETED"],
  [9, "2015", "TNB JANAMANJUNG", "LUMUT, PERAK", "TO SUPPLY MANPOWER FOR 1000MW POWER STATION PROJECT", "2,000", "COMPLETED"],
  [10, "2016", "MRCB WESTINE & CONFERENCE", "DESARU, JOHOR", "TO CARRY OUT SCAFFOLDING WORK FOR WESTINE/CONFERENCE HOTEL PROJECT", "120,000", "COMPLETED"],
  [11, "2016", "LAUBROS", "DESARU, JOHOR", "TO CARRY OUT SCAFFOLDING WORK FOR WATER PARK HOTEL PROJECT", "1,500", "COMPLETED"],
  [12, "2016", "BIOCON (M) SDN BHD – PO1", "GELANG PATAH, JOHOR", "TO CARRY OUT COLD & HOT INSULATION WORK", "500", "COMPLETED"],
  [13, "2016", "BIOCON (M) SDN BHD – PO2", "GELANG PATAH, JOHOR", "TO CARRY OUT COLD INSULATION WORK", "700", "COMPLETED"],
  [14, "2017", "VEMO REMO ENGINEERING", "TELUK INTAN, PERAK", "TO CARRY OUT SCAFFOLDING WORK AT INTERNAL BOILER, SIME DARBY OIL MILL", "2,000", "COMPLETED"],
  [15, "2017", "DSCAFF ENGINEERING SDN BHD", "BANGSAR, KL", "TO CARRY OUT SCAFFOLDING & INSTALLATION OF SAFETY CATCH NETTING AT KL ECO CITY PROJECT", "1,000", "COMPLETED"],
  [16, "2017", "MALAKOFF POWER PLANT", "PONTIAN, JOHOR", "TO CARRY OUT SCAFFOLDING WORK IN TURBINE AREA", "5,000", "COMPLETED"],
  [17, "2017", "DSCAFF ENGINEERING SDN BHD", "CHERAS, KL", "TO CARRY OUT SCAFFOLDING & INSTALLATION OF SAFETY CATCH NETTING AT METRO KAJANG HOLDINGS SAVILLE PROJECT", "5,000", "COMPLETED"],
  [18, "2017", "DSCAFF ENGINEERING SDN BHD", "BUKIT BINTANG, KL", "TO CARRY OUT SCAFFOLDING WORK, INSTALLATION OF MODULAR SCAFFOLD PEDESTRIAN BRIDGE FOR LANDLEASE AT TUN RAZAK EXCHANGE PROJECT", "10,000", "COMPLETED"],
  [19, "2017", "DSCAFF ENGINEERING SDN BHD", "BUKIT BINTANG, KL", "TO CARRY OUT SCAFFOLDING WORK, INSTALLATION OF MODULAR ACCESS TOWERS FOR BATCHY SOLETANCHE AT TUN RAZAK EXCHANGE PROJECT", "8,000", "COMPLETED"],
  [20, "2017", "PRINCIPLE PERSPECTIVE ENGINEERING SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT INSTALLATION OF SCAFFOLDING MODULAR MATERIAL HEAVY WEIGHT LOADING PLATFORM FOR UGL AT KULIM HI-TECH INFINEON PROJECT", "4,000", "COMPLETED"],
  [21, "2017", "KINGSMEN – KEB SYSTEMS SDN BHD", "DESARU, JOHOR", "TO CARRY OUT SCAFFOLDING WORK AT WATER PARK AREA – THEME PARK", "48,000", "COMPLETED"],
  [22, "2017", "DIWAN ASIA SDN BHD", "DESARU, JOHOR", "TO CARRY OUT SCAFFOLDING WORK & BASIC TRAINING FOR IKBN BANDAR PENAWAR, DESARU JOHOR", "2,000", "COMPLETED"],
  [23, "2017", "FREEZY CONSTRUCTION SDN BHD", "LEBUH VICTORIA, PENANG", "TO CARRY OUT SCAFFOLDING WORK FOR PDC HERITAGE", "10,000", "COMPLETED"],
  [24, "2017", "DSCAFF ENGINEERING SDN BHD", "KAPAR, SELANGOR", "TO SUPPLY GENERAL WORKERS & SCAFFOLDERS", "15,000", "COMPLETED"],
  [25, "2017", "BIOCON (M) SDN BHD", "GELANG PATAH, JOHOR", "TO CARRY OUT HOT INSULATION WORK", "9,000", "COMPLETED"],
  [26, "2017", "BIOCON (M) SDN BHD", "GELANG PATAH, JOHOR", "TO CARRY OUT COLD INSULATION WORK", "7,000", "COMPLETED"],
  [27, "2017", "VALE MINERAL MALAYSIA SDN BHD", "LUMUT, PERAK", "TO CARRY OUT SCAFFOLDING WORK – MAINTENANCE WORK FOR 2 YEARS", "NA", "COMPLETED"],
  [28, "2018", "TNB JANAMANJUNG", "MANJUNG, PERAK", "TO CARRY OUT SCAFFOLDING WORK", "3,000", "COMPLETED"],
  [29, "2022", "PEMBINAAN ZAMAN", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT INFINEON KLM 3", "NA", "COMPLETED"],
  [30, "2022", "LEJEN ENGINEERING SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT INFINEON KLM 3", "1,000", "COMPLETED"],
  [31, "2023", "EASTERN PRETECH (MALAYSIA) SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT INFINEON KLM 3", "NA", "COMPLETED"],
  [32, "2023-2025", "HEXATECH ENGINEERING SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT INFINEON KLM 3", "NA", "COMPLETED"],
  [33, "2023", "LINEAR COOLING TECHNOLOGY SDN BHD", "PRAI, PENANG", "TO CARRY OUT SCAFFOLDING WORK AT ANN JOO STEEL BERHAD", "NA", "COMPLETED"],
  [34, "2023", "PAN ENGINEERING NORTH SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT INFINEON KLM 3", "NA", "COMPLETED"],
  [35, "2024", "ZHONGSHI CHEMICAL ENGINEERING CONSTRUCTION (MALAYSIA) SDN. BHD", "BAYAN LEPAS, PENANG", "TO CARRY OUT SCAFFOLDING WORK AT PELICAN ALPHA PROJECT", "NA", "COMPLETED"],
  [36, "2024", "KEJURUTERAAN METECH SDN. BHD.", "BAYAN LEPAS, PENANG", "TO CARRY OUT SCAFFOLDING WORK AT PELICAN ALPHA PROJECT", "NA", "COMPLETED"],
  [37, "2024", "MITROCON BINA SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT INFINEON KLM 3", "NA", "COMPLETED"],
  [39, "2024", "YHY RESOURCES SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT BRIDGE KULIM", "NA", "COMPLETED"],
  [40, "2024", "PC INSTALLATION & CONTRACTION SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK", "NA", "COMPLETED"],
  [41, "2025", "HEXATECH ENGINEERING SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AND INSTALLATION OF LIFELINE AT INFINEON KULIM", "NA", "COMPLETED"],
  [42, "2025", "ALPINE UTILITY SERVICES SDN BHD", "HI-TECH KULIM, KEDAH", "TO CARRY OUT SCAFFOLDING WORK AT KULIM HITECH", "NA", "COMPLETED"],
  [43, "2025", "HEXATECH ENGINEERING SDN BHD", "BATU KAWAN, PENANG", "TO CARRY OUT SCAFFOLDING AND INSTALLATION OF LIFELINE WORKS AT DEXCOM BATU KAWAN", "NA", "COMPLETED"],
  [44, "2026", "SATU BUMI TECHK SDN BHD", "HI-TECH, KULIM", "TO CARRY OUT SCAFFOLDING WORKS AT MOLNLYCKE", "NA", "COMPLETED"],
  [45, "2026", "SYNERTECH ENERGY SDN BHD", "SERDANG, KEDAH", "TO SUPPLY OUT SCAFFOLDING MATERIALS AT SUNGAI DINGIN PALM OIL MILL", "NA", "COMPLETED"],
  [46, "2026", "SEVEN BROTHERS GLOBAL", "TNB MERGONG, KEDAH", "TO SUPPLY OUT SCAFFOLDING MATERIALS AT TNB MERGONG", "NA", "COMPLETED"],
];

function Project() {
  const [currentPage, setCurrentPage] = useState(1);
  const tableCardRef = useRef(null);
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    tableCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="font-['Roboto'] bg-[#f5f7fb] overflow-x-hidden" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <section className="relative min-h-[320px] md:min-h-[500px] overflow-hidden flex items-center justify-center">
        <img
          src={ProjectBanner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-105 contrast-110 saturate-125"
        />

        <div className="absolute inset-0 bg-[#081b3a]/55"></div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-6">
           

            <h1 className="relative text-white text-[46px] md:text-[64px] font-black leading-tight">
              Project
            </h1>
          </div>
        </div>
        
      </section>

      <section className="py-24 bg-[#f5f7fb]">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[#ff7a00] uppercase tracking-[5px] font-bold mb-4">
              Lions Global Services
            </p>

            <h2 className="text-[#081b3a] text-[38px] md:text-[38px] font-black">
              Project Track Record
            </h2>

            <p className="text-[#6b7280] mt-5 text-[18px]">
              Complete project record from the uploaded Excel sheet.
            </p>
          </div>

          <div ref={tableCardRef} className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px] border-collapse">
                <thead>
                  <tr className="bg-[#081b3a] text-white text-[14px] uppercase whitespace-nowrap">
                    <th className="px-4 py-5 border border-white/10 w-[60px]">NO</th>
                    <th className="px-4 py-5 border border-white/10 w-[100px]">YEAR</th>
                    <th className="px-4 py-5 border border-white/10">CLIENT</th>
                    <th className="px-4 py-5 border border-white/10">LOCATION</th>
                    <th className="px-4 py-5 border border-white/10 w-[40%] whitespace-normal">DESCRIPTION OF WORK</th>
                    <th className="px-4 py-5 border border-white/10 w-[120px]">MAN HOURS</th>
                    <th className="px-4 py-5 border border-white/10 w-[120px]">STATUS</th>
                  </tr>
                </thead>

                <tbody className="text-[14px] text-[#374151]">
                  {paginatedProjects.map((row) => (
                    <tr
                      key={row[0]}
                      className="hover:bg-[#fff7ed] transition duration-200"
                    >
                      <td className="px-4 py-4 border whitespace-nowrap text-center">{row[0]}</td>
                      <td className="px-4 py-4 border whitespace-nowrap text-center">{row[1]}</td>
                      <td className="px-4 py-4 border font-semibold min-w-[200px]">{row[2]}</td>
                      <td className="px-4 py-4 border min-w-[150px]">{row[3]}</td>
                      <td className="px-4 py-4 border">{row[4]}</td>
                      <td className="px-4 py-4 border text-center whitespace-nowrap">{row[5]}</td>
                      <td className="px-4 py-4 border text-center font-bold text-green-700 whitespace-nowrap">
                        {row[6]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-gray-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <p className="text-center text-[14px] font-semibold text-[#6b7280] sm:text-left">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, projects.length)} of {projects.length} projects
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 px-4 text-[14px] font-bold text-[#081b3a] transition duration-200 hover:border-[#ff7a00] hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white"
                  aria-label="Go to previous page"
                >
                  &lt; Prev
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-[14px] font-black transition duration-200 ${
                      currentPage === page
                        ? "border-[#ff7a00] bg-[#ff7a00] text-white shadow-lg shadow-orange-200"
                        : "border-gray-200 bg-white text-[#081b3a] hover:border-[#ff7a00] hover:bg-[#fff7ed]"
                    }`}
                    aria-current={currentPage === page ? "page" : undefined}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 px-4 text-[14px] font-bold text-[#081b3a] transition duration-200 hover:border-[#ff7a00] hover:bg-[#fff7ed] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white"
                  aria-label="Go to next page"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Project;
