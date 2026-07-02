import React from "react";

const SectionTitle = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-7">
      <h2 className="text-[24px] font-black text-gray-900 mb-1.5">{title}</h2>
      {subtitle && <p className="text-[14px] text-gray-500">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
