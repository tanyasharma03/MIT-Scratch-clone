import MoveBlock from '../blocks/MoveBlock';
import TurnBlock from '../blocks/TurnBlock';
import GotoBlock from '../blocks/GotoBlock';
import RepeatBlock from '../blocks/RepeatBlock';

const BlocksPalette = ({ onBlockClick }) => {
  const handleMoveClick = () => {
    onBlockClick({
      type: 'move',
      label: 'Move',
      params: { steps: 0 },
      color: '#4C97FF'
    });
  };

  const handleTurnClick = () => {
    onBlockClick({
      type: 'turn',
      label: 'Turn',
      params: { degrees: 0 },
      color: '#4C97FF'
    });
  };

  const handleGotoClick = () => {
    onBlockClick({
      type: 'goto',
      label: 'Go to',
      params: { x: 0, y: 0 },
      color: '#4C97FF'
    });
  };

  const handleRepeatClick = () => {
    onBlockClick({
      type: 'repeat',
      label: 'Repeat',
      params: { times: 0 },
      color: '#FFAB19',
      children: []
    });
  };

  return (
    <div className="bg-black border border-[#2e2e4d] rounded-xl p-5 overflow-y-auto">
      <h2 className="text-lg text-gray-100 mb-5 font-semibold">Blocks</h2>

      <div className="mb-6">
        <h3 className="text-sm text-[#4C97FF] mb-3 font-semibold uppercase tracking-wide">Motion</h3>
        <div onClick={handleMoveClick}>
          <MoveBlock steps={0} isInPalette={true} />
        </div>
        <div onClick={handleTurnClick}>
          <TurnBlock degrees={0} isInPalette={true} />
        </div>
        <div onClick={handleGotoClick}>
          <GotoBlock x={0} y={0} isInPalette={true} />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-[#4C97FF] mb-3 font-semibold uppercase tracking-wide">Control</h3>
        <div onClick={handleRepeatClick}>
          <RepeatBlock times={0} isInPalette={true} />
        </div>
      </div>
    </div>
  );
};

export default BlocksPalette;
