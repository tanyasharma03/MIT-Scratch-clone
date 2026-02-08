import MoveBlock from '../blocks/MoveBlock';
import TurnBlock from '../blocks/TurnBlock';
import GotoBlock from '../blocks/GotoBlock';
import RepeatBlock from '../blocks/RepeatBlock';
import SayBlock from '../blocks/SayBlock';
import ThinkBlock from '../blocks/ThinkBlock';

const BlocksPalette = ({ onBlockClick }) => {
  const createBlockData = (type) => {
    const blockConfigs = {
      move: { type: 'move', label: 'Move', params: { steps: 0 }, color: '#4C97FF' },
      turn: { type: 'turn', label: 'Turn', params: { degrees: 0 }, color: '#4C97FF' },
      goto: { type: 'goto', label: 'Go to', params: { x: 0, y: 0 }, color: '#4C97FF' },
      repeat: { type: 'repeat', label: 'Repeat', params: { times: 0 }, color: '#FFAB19', children: [] },
      say: { type: 'say', label: 'Say', params: { message: 'Hello!', seconds: 2 }, color: '#9966FF' },
      think: { type: 'think', label: 'Think', params: { message: 'Hmm...', seconds: 2 }, color: '#9966FF' }
    };
    return blockConfigs[type];
  };

  const handleDragStart = (e, blockType) => {
    const blockData = createBlockData(blockType);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(blockData));
  };

  const handleClick = (blockType) => {
    const blockData = createBlockData(blockType);
    onBlockClick(blockData);
  };

  return (
    <div className="bg-black border border-[#2e2e4d] rounded-xl p-5 overflow-y-auto">
      <h2 className="text-lg text-gray-100 mb-5 font-semibold">Blocks</h2>

      <div className="mb-6">
        <h3 className="text-sm text-[#4C97FF] mb-3 font-semibold uppercase tracking-wide">Motion</h3>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'move')}
          onClick={() => handleClick('move')}
        >
          <MoveBlock steps={0} isInPalette={true} />
        </div>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'turn')}
          onClick={() => handleClick('turn')}
        >
          <TurnBlock degrees={0} isInPalette={true} />
        </div>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'goto')}
          onClick={() => handleClick('goto')}
        >
          <GotoBlock x={0} y={0} isInPalette={true} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-[#4C97FF] mb-3 font-semibold uppercase tracking-wide">Control</h3>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'repeat')}
          onClick={() => handleClick('repeat')}
        >
          <RepeatBlock times={0} isInPalette={true} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-[#9966FF] mb-3 font-semibold uppercase tracking-wide">Looks</h3>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'say')}
          onClick={() => handleClick('say')}
        >
          <SayBlock message="Hello!" seconds={2} isInPalette={true} />
        </div>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, 'think')}
          onClick={() => handleClick('think')}
        >
          <ThinkBlock message="Hmm..." seconds={2} isInPalette={true} />
        </div>
      </div>
    </div>
  );
};

export default BlocksPalette;
