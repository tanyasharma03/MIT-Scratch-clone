import { useContext } from 'react';
import { ScriptContext } from '../context/ScriptContext';
import ActiveSpriteInfo from './ActiveSpriteInfo';

const SpritesPanel = () => {
  const { sprites, selectedSpriteId, setSelectedSpriteId } = useContext(ScriptContext);

  return (
    <div className="bg-black border border-[#2e2e4d] rounded-xl p-4 overflow-y-auto h-full flex flex-col">
      {/* Active Sprite Info */}
      <ActiveSpriteInfo />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base text-gray-100 font-semibold">Sprites</h2>
        <span className="text-[10px] text-gray-400">
          Click to select
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {sprites.map((sprite) => (
          <div
            key={sprite.id}
            onClick={() => setSelectedSpriteId(sprite.id)}
            className={`relative cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:scale-105 flex-shrink-0 ${
              selectedSpriteId === sprite.id
                ? 'bg-[#4C97FF] border-2 border-white shadow-lg'
                : 'bg-[#1a1a2e] border-2 border-[#2e2e4d] hover:border-[#4C97FF]'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5 w-20">
              <div className="w-14 h-14 flex items-center justify-center bg-white rounded-lg p-1.5">
                <img
                  src={sprite.image}
                  alt={sprite.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://en.scratch-wiki.info/w/images/ScratchCat3.0.svg';
                  }}
                />
              </div>
              <span className="text-[11px] text-white font-semibold text-center truncate w-full">
                {sprite.name}
              </span>
              {sprite.scripts.length > 0 && (
                <span className="text-[9px] text-gray-300 bg-[#2e2e4d] px-1.5 py-0.5 rounded-full">
                  {sprite.scripts.length} block{sprite.scripts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {selectedSpriteId === sprite.id && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-[#4C97FF] text-[10px] font-bold">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpritesPanel;
