import React from 'react';

const ThinkBlock = ({ message = 'Hmm...', seconds = 2, onChange, isInPalette = true }) => {
  return (
    <div
      className="p-2.5 px-4 mb-2 rounded-lg cursor-pointer text-white font-medium text-[13px] flex items-center gap-1.5 transition-all duration-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm select-none"
      style={{ backgroundColor: '#9966FF' }}
    >
      <span>Think</span>
      <input
        type="text"
        value={message}
        onChange={(e) => onChange && onChange('message', e.target.value)}
        onClick={(e) => e.stopPropagation()}
        readOnly={isInPalette}
        placeholder="Hmm..."
        className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-20 text-center text-xs font-semibold cursor-pointer focus:outline focus:outline-2 focus:outline-white/50"
      />
      <span>for</span>
      <input
        type="number"
        value={seconds}
        onChange={(e) => onChange && onChange('seconds', e.target.value)}
        onClick={(e) => e.stopPropagation()}
        readOnly={isInPalette}
        min="0"
        step="0.5"
        className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold cursor-pointer focus:outline focus:outline-2 focus:outline-white/50"
      />
      <span>seconds</span>
    </div>
  );
};

export default ThinkBlock;
