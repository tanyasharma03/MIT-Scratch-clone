const PreviewArea = ({ position, rotation }) => {
  const SCRATCH_CAT_URL = "https://en.scratch-wiki.info/w/images/ScratchCat3.0.svg";

  return (
    <div className="bg-black border border-[#2e2e4d] rounded-xl p-8 flex flex-col overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300">
      <h2 className="text-lg text-gray-100 mb-5 font-semibold">Preview</h2>
      <div className="flex-1 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.2)_inset] flex flex-col overflow-hidden border border-[#2e2e4d]">
        <div className="flex justify-around p-3 bg-[#1a1a2e] border-b border-[#2e2e4d] text-xs font-semibold gap-3">
          <span className="py-1 px-3 bg-[#2a2a3e] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.2)] text-[#60a5fa] font-semibold">
            x: {Math.round(position.x)}
          </span>
          <span className="py-1 px-3 bg-[#2a2a3e] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.2)] text-[#60a5fa] font-semibold">
            y: {Math.round(position.y)}
          </span>
          <span className="py-1 px-3 bg-[#2a2a3e] rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.2)] text-[#60a5fa] font-semibold">
            rotation: {Math.round(rotation)}°
          </span>
        </div>

        <div className="flex-1 relative bg-gradient-to-br from-white to-gray-50 overflow-hidden min-h-[550px]">
          <img
            src={SCRATCH_CAT_URL}
            alt="Scratch Cat Sprite"
            className="absolute w-[100px] h-[100px] transition-transform duration-[50ms] linear z-[2] drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] select-none pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
              transform: `rotate(${rotation}deg)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewArea;
