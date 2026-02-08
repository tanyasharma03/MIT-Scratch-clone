const RepeatBlock = ({ times = 2, onChange, isInPalette = true }) => {
  return (
    <div
      className="p-2.5 px-4 mb-2 rounded-lg cursor-pointer text-white font-medium text-[13px] flex items-center gap-1.5 transition-all duration-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm select-none"
      style={{ backgroundColor: '#FFAB19' }}
    >
      <span>Repeat</span>
      <input
        type="number"
        value={times}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        readOnly={isInPalette}
        className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold cursor-pointer focus:outline focus:outline-2 focus:outline-white/50"
      />
      <span>times</span>
    </div>
  );
};

export default RepeatBlock;
