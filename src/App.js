import { useContext } from 'react';
import BlocksPalette from './components/BlocksPalette';
import ScriptArea from './components/ScriptArea';
import PreviewArea from './components/PreviewArea';
import { ScriptContext } from './context/ScriptContext';

function App() {
  const {
    sprites,
    selectedSprite,
    isRunning,
    addScript,
    removeScript,
    updateScript,
    reorderScripts,
    resetAllSprites,
    updateSpriteState,
    setIsRunning,
  } = useContext(ScriptContext);

  // Run animations for all sprites in parallel
  const runAllAnimations = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // Create animation promises for all sprites that have scripts
    const animationPromises = sprites
      .filter(sprite => sprite.scripts.length > 0)
      .map(sprite => runSpriteAnimations(sprite));

    // Run all sprite animations in parallel
    await Promise.all(animationPromises);

    setIsRunning(false);
  };

  // Run animations for a single sprite
  const runSpriteAnimations = async (sprite) => {
    let currentState = {
      x: sprite.position.x,
      y: sprite.position.y,
      rotation: sprite.rotation
    };

    for (const script of sprite.scripts) {
      // eslint-disable-next-line no-loop-func
      const updateState = (newState) => {
        currentState = newState;
        updateSpriteState(sprite.id, {
          position: { x: newState.x, y: newState.y },
          rotation: newState.rotation
        });
      };

      await executeScript(script, currentState, updateState, sprite.id);
    }
  };

  const executeScript = async (script, currentState, updateState, spriteId) => {
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
            state = await executeScript(childScript, state, updateState, spriteId);
          }
        }
        return state;

      case 'say':
        const sayMessage = params.message || 'Hello!';
        const sayDuration = parseFloat(params.seconds) || 2;
        updateSpriteState(spriteId, { message: { text: sayMessage, type: 'say' } });
        await new Promise(resolve => setTimeout(resolve, sayDuration * 1000));
        updateSpriteState(spriteId, { message: { text: '', type: '' } });
        return currentState;

      case 'think':
        const thinkMessage = params.message || 'Hmm...';
        const thinkDuration = parseFloat(params.seconds) || 2;
        updateSpriteState(spriteId, { message: { text: thinkMessage, type: 'think' } });
        await new Promise(resolve => setTimeout(resolve, thinkDuration * 1000));
        updateSpriteState(spriteId, { message: { text: '', type: '' } });
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
        <h1 className="text-2xl font-bold">Scratch Clone</h1>
      </header>
      <div className="flex-1 grid grid-cols-[280px_1fr_700px] gap-6 overflow-hidden p-6 max-xl:grid-cols-[250px_1fr_600px] max-lg:grid-cols-[200px_1fr_500px] max-md:grid-cols-1 max-md:grid-rows-[auto_auto_1fr]">
        <BlocksPalette onBlockClick={addScript} />
        <ScriptArea
          scripts={selectedSprite?.scripts || []}
          onRemove={removeScript}
          onUpdate={updateScript}
          onAdd={addScript}
          onReorder={reorderScripts}
        />
        <PreviewArea
          onPlayAll={runAllAnimations}
          onResetAll={resetAllSprites}
        />
      </div>
    </div>
  );
}

export default App;
