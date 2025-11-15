import React from 'react';

interface EmotionMeterProps {
  label: string;
  value: number;
  color: string;
}

const EmotionMeter: React.FC<EmotionMeterProps> = ({ label, value, color }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-display text-sm font-bold text-slate-300 uppercase tracking-wider">{label}</span>
        <span className="text-lg font-bold text-slate-100 font-display">{value}</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2 relative">
        <div
          className="h-2 rounded-full progress-bar"
          style={{ 
            width: `${value}%`, 
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}, 0 0 4px ${color}`
          }}
        ></div>
      </div>
    </div>
  );
};

export default EmotionMeter;