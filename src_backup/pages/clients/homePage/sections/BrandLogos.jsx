import React from "react";
import asusLogo from "../../../../assets/images/asus.png";
import lenovoLogo from "../../../../assets/images/lenovo.png";
import dellLogo from "../../../../assets/images/dell-logo-inkythuatso-4-01-30-10-18-11.png";
import acerLogo from "../../../../assets/images/acer-1.jpg";
import hpLogo from "../../../../assets/images/hp.png";
import lgLogo from "../../../../assets/images/lg.png";

const brands = [
  { src: asusLogo, alt: "ASUS" },
  { src: lenovoLogo, alt: "Lenovo" },
  { src: dellLogo, alt: "DELL" },
  { src: acerLogo, alt: "acer" },
  { src: hpLogo, alt: "hp" },
  { src: lgLogo, alt: "LG" },
];

const BrandLogos = () => {
  return (
    <section className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-around flex-wrap gap-6">
        {brands.map((b) => (
          <img
            key={b.alt}
            src={b.src}
            alt={b.alt}
            className="h-10 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200 cursor-pointer"
          />
        ))}
      </div>
    </section>
  );
};

export default BrandLogos;
