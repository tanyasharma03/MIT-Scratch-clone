const ScriptArea = ({ scripts, onRemove, onUpdate }) => {
  const handleParamChange = (id, paramKey, value) => {
    onUpdate(id, {
      params: {
        ...scripts.find(s => s.id === id)?.params,
        [paramKey]: value
      }
    });
  };

  return (
    <div className="bg-[#1a1a2e] border border-[#2e2e4d] rounded-xl p-5 overflow-y-auto">
      <h2 className="text-lg text-gray-100 mb-5 font-semibold">Script Area</h2>
      <div className="flex flex-col gap-2">
        {scripts.length === 0 ? (
          <div className="text-center text-gray-400 py-10 px-5 text-sm leading-relaxed">
            Click on blocks from the left panel to add them here
          </div>
        ) : (
          scripts.map((script) => (
            <div
              key={script.id}
              className="relative py-3 px-4 pr-10 rounded-lg text-white font-medium text-[13px] shadow-md transition-all duration-200 animate-[slideIn_0.3s_ease-out] hover:translate-x-1 hover:shadow-lg"
              style={{ backgroundColor: script.color }}
            >
              <button
                className="absolute top-2 right-2 bg-black/20 text-white border-none rounded-full w-6 h-6 cursor-pointer text-lg leading-none flex items-center justify-center transition-all duration-200 hover:bg-black/40 hover:scale-110 active:scale-95"
                onClick={() => onRemove(script.id)}
                title="Remove block"
              >
                ×
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold">{script.label}</span>

                {script.type === 'move' && (
                  <>
                    <input
                      type="number"
                      value={script.params.steps}
                      onChange={(e) => handleParamChange(script.id, 'steps', e.target.value)}
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span> steps</span>
                  </>
                )}

                {script.type === 'turn' && (
                  <>
                    <input
                      type="number"
                      value={script.params.degrees}
                      onChange={(e) => handleParamChange(script.id, 'degrees', e.target.value)}
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span> degrees</span>
                  </>
                )}

                {script.type === 'goto' && (
                  <>
                    <span>x:</span>
                    <input
                      type="number"
                      value={script.params.x}
                      onChange={(e) => handleParamChange(script.id, 'x', e.target.value)}
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-[45px] text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span>y:</span>
                    <input
                      type="number"
                      value={script.params.y}
                      onChange={(e) => handleParamChange(script.id, 'y', e.target.value)}
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-[45px] text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                  </>
                )}

                {script.type === 'repeat' && (
                  <>
                    <input
                      type="number"
                      value={script.params.times}
                      onChange={(e) => handleParamChange(script.id, 'times', e.target.value)}
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span> times</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScriptArea;
