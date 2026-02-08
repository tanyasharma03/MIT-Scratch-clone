const PreviewArea = ({ position, rotation, message }) => {
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

          {/* Speech/Think Bubble */}
          {message.text && (
            <div
              className="absolute z-[3] pointer-events-none animate-[fadeIn_0.2s_ease-out]"
              style={{
                left: position.x + 110,
                top: position.y - 10,
              }}
            >
              {message.type === 'say' && (
                <div className="relative">
                  <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-lg border-2 border-gray-300 min-w-[80px] max-w-[200px] text-sm font-medium">
                    {message.text}
                  </div>
                  {/* Speech bubble tail */}
                  <div
                    className="absolute w-0 h-0 border-t-[12px] border-t-white border-r-[12px] border-r-transparent"
                    style={{
                      left: '-8px',
                      top: '15px',
                      filter: 'drop-shadow(-2px 0px 0px rgba(209, 213, 219, 1))'
                    }}
                  />
                </div>
              )}

              {message.type === 'think' && (
                <div className="relative">
                  <div className="bg-white text-gray-800 px-4 py-2 rounded-[50%] shadow-lg border-2 border-gray-300 min-w-[80px] max-w-[200px] text-sm font-medium flex items-center justify-center aspect-[4/3]">
                    {message.text}
                  </div>
                  {/* Thought bubble circles */}
                  <div className="absolute w-3 h-3 bg-white rounded-full border-2 border-gray-300" style={{ left: '-15px', top: '30px' }} />
                  <div className="absolute w-2 h-2 bg-white rounded-full border-2 border-gray-300" style={{ left: '-25px', top: '40px' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewArea;
