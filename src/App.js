import { useContext } from 'react';
import BlocksPalette from './components/BlocksPalette';
import ScriptArea from './components/ScriptArea';
import PreviewArea from './components/PreviewArea';
import { ScriptContext } from './context/ScriptContext';

function App() {
  const {
    scripts,
    spritePosition,
    spriteRotation,
    isRunning,
    spriteMessage,
    addScript,
    removeScript,
    updateScript,
    reorderScripts,
    resetSprite,
    setSpritePosition,
    setSpriteRotation,
    setIsRunning,
    setSpriteMessage
  } = useContext(ScriptContext);

  const runAnimations = async () => {
    if (isRunning) return;
    setIsRunning(true);

    let currentState = {
      x: spritePosition.x,
      y: spritePosition.y,
      rotation: spriteRotation
    };

    for (const script of scripts) {
      // eslint-disable-next-line no-loop-func
      const updateState = (newState) => {
        currentState = newState;
        setSpritePosition({ x: newState.x, y: newState.y });
        setSpriteRotation(newState.rotation);
      };

      await executeScript(script, currentState, updateState);
    }

    setIsRunning(false);
  };

  const executeScript = async (script, currentState, updateState) => {
    const { type, params } = script;

    switch (type) {
      case 'move':
        const steps = parseInt(params.steps) || 0;
        const radians = (currentState.rotation * Math.PI) / 180;
        const newX = currentState.x + steps * Math.cos(radians);
        const newY = currentState.y + steps * Math.sin(radians);
        await animateMovement(currentState, { ...currentState, x: newX, y: newY }, updateState);
        return { ...currentState, x: newX, y: newY };

      case 'turn':
        const degrees = parseInt(params.degrees) || 0;
        const newRotation = currentState.rotation + degrees;
        await animateRotation(currentState.rotation, newRotation, updateState, currentState);
        return { ...currentState, rotation: newRotation };

      case 'goto':
        const targetX = parseInt(params.x) || 0;
        const targetY = parseInt(params.y) || 0;
        await animateMovement(currentState, { ...currentState, x: targetX, y: targetY }, updateState);
        return { ...currentState, x: targetX, y: targetY };

      case 'repeat':
        const times = parseInt(params.times) || 1;
        let state = currentState;
        for (let i = 0; i < times; i++) {
          for (const childScript of script.children || []) {
            state = await executeScript(childScript, state, updateState);
          }
        }
        return state;

      case 'say':
        const sayMessage = params.message || 'Hello!';
        const sayDuration = parseFloat(params.seconds) || 2;
        setSpriteMessage({ text: sayMessage, type: 'say' });
        await new Promise(resolve => setTimeout(resolve, sayDuration * 1000));
        setSpriteMessage({ text: '', type: '' });
        return currentState;

      case 'think':
        const thinkMessage = params.message || 'Hmm...';
        const thinkDuration = parseFloat(params.seconds) || 2;
        setSpriteMessage({ text: thinkMessage, type: 'think' });
        await new Promise(resolve => setTimeout(resolve, thinkDuration * 1000));
        setSpriteMessage({ text: '', type: '' });
        return currentState;

      default:
        return currentState;
    }
  };

  const animateMovement = (from, to, updateState) => {
    return new Promise((resolve) => {
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentX = from.x + (to.x - from.x) * progress;
        const currentY = from.y + (to.y - from.y) * progress;

        updateState({ ...to, x: currentX, y: currentY });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  const animateRotation = (from, to, updateState, state) => {
    return new Promise((resolve) => {
      const duration = 300;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentRotation = from + (to - from) * progress;

        updateState({ ...state, rotation: currentRotation });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#667eea] to-[#764ba2] font-['Helvetica_Neue',Helvetica,Arial,sans-serif]">
      <header className="bg-gradient-to-r from-[#4C97FF] to-[#3373CC] text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex gap-2.5">
          <button
            onClick={runAnimations}
            disabled={isRunning || scripts.length === 0}
            className="bg-[#00C853] text-white border-none px-5 py-2.5 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-[#00A344] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:bg-[#cccccc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            ▶ Run
          </button>
          <button
            onClick={resetSprite}
            disabled={isRunning}
            className="bg-[#FF6680] text-white border-none px-5 py-2.5 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-[#FF4468] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:bg-[#cccccc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            ⟲ Reset
          </button>
        </div>
      </header>
      <div className="flex-1 grid grid-cols-[280px_1fr_1000px] gap-6 overflow-hidden p-6 md:grid-cols-[250px_1fr_700px] max-md:grid-cols-1 max-md:grid-rows-[auto_auto_1fr]">
        <BlocksPalette onBlockClick={addScript} />
        <ScriptArea
          scripts={scripts}
          onRemove={removeScript}
          onUpdate={updateScript}
          onAdd={addScript}
          onReorder={reorderScripts}
        />
        <PreviewArea
          position={spritePosition}
          rotation={spriteRotation}
          message={spriteMessage}
        />
      </div>
    </div>
  );
}

export default App;
