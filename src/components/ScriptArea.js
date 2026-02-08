import React from 'react';

const ScriptArea = ({ scripts, onRemove, onUpdate, onAdd, onReorder }) => {
  const [dragOverIndex, setDragOverIndex] = React.useState(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  const handleParamChange = (id, paramKey, value) => {
    onUpdate(id, {
      params: {
        ...scripts.find(s => s.id === id)?.params,
        [paramKey]: value
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDragOverIndex(null);

    const data = e.dataTransfer.getData('application/json');

    if (data) {
      try {
        const blockData = JSON.parse(data);
        // Check if it's a new block from palette or an existing block being moved
        if (blockData.id) {
          // Existing block being moved - handled by drop on specific position
          return;
        } else {
          // New block from palette
          onAdd(blockData);
        }
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
      setDragOverIndex(null);
    }
  };

  const handleBlockDragStart = (e, script) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(script));
  };

  const handleBlockDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleBlockDrop = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const droppedBlock = JSON.parse(data);

        if (droppedBlock.id) {
          // Existing block being reordered
          const currentIndex = scripts.findIndex(s => s.id === droppedBlock.id);
          if (currentIndex !== -1 && currentIndex !== targetIndex) {
            onReorder(currentIndex, targetIndex);
          }
        } else {
          // New block from palette - insert at position
          onAdd({ ...droppedBlock, insertAt: targetIndex });
        }
      } catch (error) {
        console.error('Error handling block drop:', error);
      }
    }
  };

  const handleBlockDragEnd = () => {
    setDragOverIndex(null);
  };

  return (
    <div className="bg-gradient-to-br from-black to-[#1a1a2e] rounded-2xl border border-[#2e2e4d] shadow-2xl p-6 flex flex-col gap-6 overflow-hidden h-full">
      <h2 className="text-lg text-gray-100 font-semibold">Script Area</h2>

      <div
        className={`flex-1 bg-white/5 backdrop-blur-md rounded-xl border-2 ${
          isDraggingOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
        } flex flex-col gap-3 px-6 py-8 overflow-auto transition-all duration-200 min-h-[200px]`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {scripts.length === 0 ? (
          <div className={`text-center py-10 px-5 text-sm leading-relaxed transition-colors ${
            isDraggingOver ? 'text-blue-400' : 'text-gray-400'
          }`}>
            🧊 Drop blocks here or click blocks to add them
          </div>
        ) : (
          scripts.map((script, index) => (
            <div key={script.id}>
              {dragOverIndex === index && (
                <div className="h-1 bg-[#4C97FF] rounded-full mb-2 animate-pulse" />
              )}
              <div className="relative w-full max-w-[330px] mx-auto group">
                <button
                  onClick={() => onRemove(script.id)}
                  className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity z-10 shadow-lg"
                  title="Delete block"
                >
                  ×
                </button>

                <div
                  draggable
                  onDragStart={(e) => handleBlockDragStart(e, script)}
                  onDragOver={(e) => handleBlockDragOver(e, index)}
                  onDrop={(e) => handleBlockDrop(e, index)}
                  onDragEnd={handleBlockDragEnd}
                  className="py-3 px-4 rounded-lg text-white font-medium text-[13px] shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-move active:opacity-50 active:scale-95"
                  style={{ backgroundColor: script.color }}
                >

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

                {script.type === 'say' && (
                  <>
                    <input
                      type="text"
                      value={script.params.message}
                      onChange={(e) => handleParamChange(script.id, 'message', e.target.value)}
                      placeholder="Hello!"
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-24 text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span> for</span>
                    <input
                      type="number"
                      value={script.params.seconds}
                      onChange={(e) => handleParamChange(script.id, 'seconds', e.target.value)}
                      min="0"
                      step="0.5"
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span> seconds</span>
                  </>
                )}

                {script.type === 'think' && (
                  <>
                    <input
                      type="text"
                      value={script.params.message}
                      onChange={(e) => handleParamChange(script.id, 'message', e.target.value)}
                      placeholder="Hmm..."
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-24 text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span> for</span>
                    <input
                      type="number"
                      value={script.params.seconds}
                      onChange={(e) => handleParamChange(script.id, 'seconds', e.target.value)}
                      min="0"
                      step="0.5"
                      className="bg-white text-gray-800 border-none rounded-md px-2 py-1 w-12 text-center text-xs font-semibold focus:outline focus:outline-2 focus:outline-white/80"
                    />
                    <span> seconds</span>
                  </>
                )}
              </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScriptArea;
