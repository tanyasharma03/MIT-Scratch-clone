import React from 'react';

const MoveBlock = ({ steps = 10, onChange, isInPalette = true }) => {
  return (
    <div
      className="p-2.5 px-4 mb-2 rounded-lg cursor-pointer text-white font-medium text-[13px] flex items-center gap-1.5 transition-all duration-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm select-none"
      style={{ backgroundColor: '#4C97FF' }}
    >
      <span>Move</span>
      <input
        type="number"
        value={steps}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        readOnly={isInPalette}
        className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold cursor-pointer focus:outline focus:outline-2 focus:outline-white/50"
      />
      <span>steps</span>
    </div>
  );
};

export default MoveBlock;
