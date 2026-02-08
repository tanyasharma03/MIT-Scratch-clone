import { useContext, useState, useRef, useEffect, memo } from 'react';
import { ScriptContext } from '../context/ScriptContext';

const ToggleButton = memo(function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors duration-150 flex items-center gap-1 ${
        active
          ? 'bg-blue-700 border-blue-500 text-white'
          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
});

const SpriteImage = memo(function SpriteImage({ sprite, onMouseDown, isActive }) {
  return (
    <img
      src={sprite.image}
      alt={sprite.name}
      className={`cursor-${
        isActive ? 'grabbing' : 'grab'
      } select-none transition-transform duration-200 bg-transparent hover:scale-105 ${
        isActive ? 'ring-2 ring-blue-400' : ''
      }`}
      style={{
        position: 'absolute',
        width: '100px',
        height: '100px',
        left: sprite.position.x,
        top: sprite.position.y,
        transform: `rotate(${sprite.rotation}deg)`,
      }}
      onMouseDown={(e) => onMouseDown(e, sprite)}
      draggable={false}
    />
  );
});

const PreviewArea = ({ onPlayAll }) => {
  const {
    spriteTemplates,
    activeSprites,
    selectedSpriteId,
    setSelectedSpriteId,
    updateSpriteState,
    removeSprite,
    addSprite,
  } = useContext(ScriptContext);

  const selectedSprite = activeSprites.find((s) => s.id === selectedSpriteId);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSpriteId, setDraggedSpriteId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(spriteTemplates[0].type);
  const [clickedButton, setClickedButton] = useState(null);
  const stageRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleSpriteMouseDown = (e, sprite) => {
    e.preventDefault();
    setSelectedSpriteId(sprite.id);
    setIsDragging(true);
    setDraggedSpriteId(sprite.id);

    const stageRect = stageRef.current.getBoundingClientRect();
    const offsetX = e.clientX - stageRect.left - sprite.position.x;
    const offsetY = e.clientY - stageRect.top - sprite.position.y;
    dragOffsetRef.current = { x: offsetX, y: offsetY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedSpriteId || !stageRef.current) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    const newX = e.clientX - stageRect.left - dragOffsetRef.current.x;
    const newY = e.clientY - stageRect.top - dragOffsetRef.current.y;

    const boundedX = Math.max(0, Math.min(newX, stageRect.width - 100));
    const boundedY = Math.max(0, Math.min(newY, stageRect.height - 100));

    updateSpriteState(draggedSpriteId, {
      position: { x: boundedX, y: boundedY },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedSpriteId(null);
  };

  const handleAddSprite = () => {
    addSprite(selectedImage);
    setClickedButton('addSprite');
    setTimeout(() => setClickedButton(null), 300);
  };

  const handleRemoveSprite = () => {
    if (selectedSprite) {
      removeSprite(selectedSprite.id);
      setClickedButton('removeSprite');
      setTimeout(() => setClickedButton(null), 300);
    }
  };

  const handlePlayAll = () => {
    onPlayAll();
    setClickedButton('playAll');
    setTimeout(() => setClickedButton(null), 300);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'move';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return (
    <div
      ref={stageRef}
      className="w-full min-h-full overflow-auto bg-black border border-gray-800 rounded-xl shadow-lg py-8 px-8 relative text-gray-100 flex flex-col transition-all duration-300"
    >
      {/* Large Preview Area */}
      <div className="relative flex-1 w-full min-h-[300px] flex items-center justify-center rounded-xl shadow-inner border border-gray-800 bg-white mb-2">
        {activeSprites.map((sprite) => (
          <div key={sprite.id}>
            {/* Speech/Think Bubble */}
            {sprite.message.text && (
              <div
                className={sprite.message.type === 'think' ? 'animate-bounce' : ''}
                style={{
                  position: 'absolute',
                  left: sprite.position.x + 50,
                  top: sprite.position.y - 40,
                  zIndex: 10,
                  minWidth: 60,
                  maxWidth: 160,
                  padding: '6px 14px',
                  borderRadius: sprite.message.type === 'think' ? 20 : 16,
                  background: sprite.message.type === 'think' ? 'white' : '#181a20',
                  color: '#b3caff',
                  border: '1px solid #334155',
                  boxShadow: '0 2px 8px rgba(30,64,175,0.08)',
                  fontStyle: sprite.message.type === 'think' ? 'italic' : 'normal',
                  fontSize: 15,
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {sprite.message.text}
              </div>
            )}

            {/* Sprite Image */}
            <SpriteImage
              sprite={sprite}
              onMouseDown={handleSpriteMouseDown}
              isActive={isDragging && draggedSpriteId === sprite.id}
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 justify-between items-center w-full">
        <button
          onClick={handlePlayAll}
          className={`flex-1 min-w-[100px] bg-blue-900 hover:bg-blue-800 text-blue-300 font-semibold rounded-lg p-3 shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2 text-base ${
            clickedButton === 'playAll' ? 'scale-95' : ''
          }`}
        >
          ▶ Play All
        </button>
        <button
          onClick={handleAddSprite}
          className={`flex-1 min-w-[100px] p-3 bg-green-700 hover:bg-green-600 text-gray-100 rounded-lg font-semibold shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2 text-base ${
            clickedButton === 'addSprite' ? 'scale-95' : ''
          }`}
        >
          + Sprite
        </button>
        <button
          onClick={handleRemoveSprite}
          disabled={!selectedSprite}
          className={`cursor-pointer flex-1 min-w-[100px] p-3 bg-red-800 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2 text-base ${
            clickedButton === 'removeSprite' ? 'scale-95' : ''
          }`}
        >
          🗑 Sprite
        </button>
      </div>

      {/* Active Sprite Section */}
      <div className="flex flex-col gap-4 mb-4 w-full">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-300 mr-2">Active Sprite:</span>
          {activeSprites.length === 0 && (
            <span className="text-sm text-gray-500">No sprites yet</span>
          )}
          {activeSprites.map((sprite) => (
            <ToggleButton
              key={sprite.id}
              active={selectedSpriteId === sprite.id}
              onClick={() => setSelectedSpriteId(sprite.id)}
            >
              {sprite.name}
            </ToggleButton>
          ))}
        </div>

        {/* Sprite Asset Section */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-300 mr-2">Sprite Asset:</span>
          {spriteTemplates.map((template) => (
            <ToggleButton
              key={template.type}
              active={selectedImage === template.type}
              onClick={() => setSelectedImage(template.type)}
            >
              <img src={template.image} alt={template.name} className="w-5 h-5" />
              {template.name}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Position Info */}
      {selectedSprite && (
        <div className="flex justify-between items-start mb-4 w-full">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-300">
              x: {Math.round(selectedSprite.position.x)}
            </span>
            <span className="text-sm font-medium text-blue-300">
              y: {Math.round(selectedSprite.position.y)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewArea;
