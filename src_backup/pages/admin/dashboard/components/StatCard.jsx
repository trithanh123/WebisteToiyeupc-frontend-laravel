import React from 'react';

const StatCard = ({ title, value, subtitle, icon, colorClass }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-800">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>
        )}
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
