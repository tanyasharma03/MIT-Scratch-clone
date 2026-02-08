import { useContext } from 'react';
import { ScriptContext } from '../context/ScriptContext';

const ActiveSpriteInfo = () => {
  const { selectedSprite } = useContext(ScriptContext);

  if (!selectedSprite) return null;

  return (
    <div className="bg-[#1a1a2e] border border-[#2e2e4d] rounded-lg p-3 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center flex-shrink-0">
          <img
            src={selectedSprite.image}
            alt={selectedSprite.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://en.scratch-wiki.info/w/images/ScratchCat3.0.svg';
            }}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1">
            {selectedSprite.name}
          </h3>
          <div className="text-[10px] text-gray-400">
            Active Sprite
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#2a2a3e] rounded-md p-2">
          <div className="text-[9px] text-gray-400 mb-1">X Position</div>
          <div className="text-xs text-[#60a5fa] font-semibold">
            {Math.round(selectedSprite.position.x)}
          </div>
        </div>
        <div className="bg-[#2a2a3e] rounded-md p-2">
          <div className="text-[9px] text-gray-400 mb-1">Y Position</div>
          <div className="text-xs text-[#60a5fa] font-semibold">
            {Math.round(selectedSprite.position.y)}
          </div>
        </div>
        <div className="bg-[#2a2a3e] rounded-md p-2">
          <div className="text-[9px] text-gray-400 mb-1">Rotation</div>
          <div className="text-xs text-[#60a5fa] font-semibold">
            {Math.round(selectedSprite.rotation)}°
          </div>
        </div>
        <div className="bg-[#2a2a3e] rounded-md p-2">
          <div className="text-[9px] text-gray-400 mb-1">Scripts</div>
          <div className="text-xs text-[#60a5fa] font-semibold">
            {selectedSprite.scripts.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSpriteInfo;
