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
    stageSize,
    addScript,
    removeScript,
    updateScript,
    reorderScripts,
    resetAllSprites,
    updateSpriteState,
    setIsRunning,
    setIsAnimating,
    setActiveSprites,
  } = useContext(ScriptContext);

  const SPRITE_SIZE = 100;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // Calculate final position for a sprite based on its scripts (without animation)
  const calculateFinalPosition = (sprite) => {
    let state = {
      x: sprite.position.x,
      y: sprite.position.y,
      rotation: sprite.rotation
    };

    const scripts = sprite.scripts;
    const scriptsToExecute = [];
    let repeatCount = 1;

    // Separate repeat blocks from other scripts
    for (const script of scripts) {
      if (script.type === 'repeat') {
        repeatCount = parseInt(script.params.times) || 1;
      } else {
        scriptsToExecute.push(script);
      }
    }

    // Calculate final position after all scripts execute
    for (let i = 0; i < repeatCount; i++) {
      for (const script of scriptsToExecute) {
        state = calculateScriptEndState(script, state);
      }
    }

    return state;
  };

  // Calculate the end state of a single script
  const calculateScriptEndState = (script, currentState) => {
    const { type, params } = script;
    const maxX = Math.max(stageSize.width - SPRITE_SIZE, 0);
    const maxY = Math.max(stageSize.height - SPRITE_SIZE, 0);

    switch (type) {
      case 'move':
        const steps = parseInt(params.steps) || 0;
        const radians = (currentState.rotation * Math.PI) / 180;
        const newX = clamp(currentState.x + steps * Math.cos(radians), 0, maxX);
        const newY = clamp(currentState.y + steps * Math.sin(radians), 0, maxY);
        return { ...currentState, x: newX, y: newY };

      case 'turn':
        const degrees = parseInt(params.degrees) || 0;
        return { ...currentState, rotation: currentState.rotation + degrees };

      case 'goto':
        const targetX = clamp(parseInt(params.x) || 0, 0, maxX);
        const targetY = clamp(parseInt(params.y) || 0, 0, maxY);
        return { ...currentState, x: targetX, y: targetY };

      case 'repeat':
        const times = parseInt(params.times) || 1;
        let state = currentState;
        for (let i = 0; i < times; i++) {
          for (const childScript of script.children || []) {
            state = calculateScriptEndState(childScript, state);
          }
        }
        return state;

      default:
        return currentState;
    }
  };

  // Detect if two line segments intersect using cross product method
  const doPathsCross = (start1, end1, start2, end2) => {
    // If either path has no movement, they don't cross
    if ((start1.x === end1.x && start1.y === end1.y) ||
        (start2.x === end2.x && start2.y === end2.y)) {
      return false;
    }

    const x1 = start1.x, y1 = start1.y;
    const x2 = end1.x, y2 = end1.y;
    const x3 = start2.x, y3 = start2.y;
    const x4 = end2.x, y4 = end2.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // Check for collinear segments (parallel or on same line)
    if (Math.abs(denom) < 0.0001) {
      // Check if segments are collinear by testing if all points are on the same line
      const crossProduct1 = (x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1);
      const crossProduct2 = (x4 - x1) * (y2 - y1) - (y4 - y1) * (x2 - x1);

      // If not collinear, they're just parallel
      if (Math.abs(crossProduct1) > 0.0001 || Math.abs(crossProduct2) > 0.0001) {
        return false;
      }

      // Collinear - check if they overlap
      // Project points onto the line and check overlap
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length < 0.0001) return false;

      // Project all points onto the line (using dot product)
      const t1 = 0;
      const t2 = 1;
      const t3 = ((x3 - x1) * dx + (y3 - y1) * dy) / (length * length);
      const t4 = ((x4 - x1) * dx + (y4 - y1) * dy) / (length * length);

      // Check if the projected segments overlap
      const min1 = Math.min(t1, t2);
      const max1 = Math.max(t1, t2);
      const min2 = Math.min(t3, t4);
      const max2 = Math.max(t3, t4);

      // Segments overlap if their ranges intersect
      return max1 > min2 && max2 > min1;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    // Check if intersection point is within both line segments
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  // Run animations for all sprites in parallel
  const runAllAnimations = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsAnimating(true);

    // Calculate final positions and detect path crossings
    const spritesWithMovement = sprites.filter(sprite => sprite.scripts.length > 0);
    const finalPositions = new Map();
    const positionSwaps = new Map();

    // Calculate final positions for all sprites
    spritesWithMovement.forEach(sprite => {
      const finalPos = calculateFinalPosition(sprite);
      finalPositions.set(sprite.id, finalPos);
    });

    // Detect path crossings and swap scripts
    const scriptsToSwap = [];

    for (let i = 0; i < spritesWithMovement.length; i++) {
      for (let j = i + 1; j < spritesWithMovement.length; j++) {
        const sprite1 = spritesWithMovement[i];
        const sprite2 = spritesWithMovement[j];

        const start1 = { x: sprite1.position.x, y: sprite1.position.y };
        const end1 = finalPositions.get(sprite1.id);
        const start2 = { x: sprite2.position.x, y: sprite2.position.y };
        const end2 = finalPositions.get(sprite2.id);

        // If paths cross, mark scripts for swapping
        const pathsCross = doPathsCross(start1, end1, start2, end2);
        console.log('Paths cross?', pathsCross);

        if (pathsCross) {
          console.log('COLLISION DETECTED - Swapping scripts!');
          scriptsToSwap.push({ id1: sprite1.id, id2: sprite2.id });
          // Also swap their destination positions
          positionSwaps.set(sprite1.id, end2);
          positionSwaps.set(sprite2.id, end1);
        }
      }
    }

    // Create a map of swapped scripts for immediate use
    const swappedScripts = new Map();
    for (const swap of scriptsToSwap) {
      const sprite1 = spritesWithMovement.find(s => s.id === swap.id1);
      const sprite2 = spritesWithMovement.find(s => s.id === swap.id2);
      if (sprite1 && sprite2) {
        swappedScripts.set(swap.id1, sprite2.scripts);
        swappedScripts.set(swap.id2, sprite1.scripts);
      }
    }

    // Swap scripts in the sprite state atomically for all crossing pairs
    if (scriptsToSwap.length > 0) {
      setActiveSprites((prevSprites) => {
        return prevSprites.map((sprite) => {
          // Check if this sprite is involved in any swap
          for (const swap of scriptsToSwap) {
            if (sprite.id === swap.id1) {
              const otherSprite = prevSprites.find(s => s.id === swap.id2);
              return { ...sprite, scripts: otherSprite?.scripts || sprite.scripts };
            }
            if (sprite.id === swap.id2) {
              const otherSprite = prevSprites.find(s => s.id === swap.id1);
              return { ...sprite, scripts: otherSprite?.scripts || sprite.scripts };
            }
          }
          return sprite;
        });
      });
    }

    // Run animations - if scripts were swapped, continue with swapped scripts
    const animationPromises = spritesWithMovement.map(sprite => {
      const hasSwap = swappedScripts.has(sprite.id);

      if (hasSwap) {
        // First animate to the swapped position, then execute swapped scripts
        return runSpriteWithCollision(sprite, positionSwaps.get(sprite.id), swappedScripts.get(sprite.id));
      } else {
        // Normal animation without collision
        const targetPosition = finalPositions.get(sprite.id);
        return runSpriteAnimations(sprite, targetPosition);
      }
    });

    await Promise.all(animationPromises);

    setIsAnimating(false);
    setIsRunning(false);
  };

  // Run sprite animation when collision occurs - swap to other position then execute swapped scripts
  const runSpriteWithCollision = async (sprite, swapPosition, newScripts) => {
    // Initialize the current state from the sprite's starting position
    let currentState = {
      x: sprite.position.x,
      y: sprite.position.y,
      rotation: sprite.rotation
    };

    const updateState = (newState) => {
      currentState = newState;
      updateSpriteState(sprite.id, {
        position: { x: newState.x, y: newState.y },
        rotation: newState.rotation
      });
    };

    // First, animate to the swap position (where paths crossed)
    await animateMovement(currentState, swapPosition, updateState);

    // Now execute the swapped scripts from the swap position
    const scriptsToExecute = [];
    let repeatCount = 1;

    for (const script of newScripts) {
      if (script.type === 'repeat') {
        repeatCount = parseInt(script.params.times) || 1;
      } else {
        scriptsToExecute.push(script);
      }
    }

    // Execute the swapped scripts
    for (let i = 0; i < repeatCount; i++) {
      for (const script of scriptsToExecute) {
        // eslint-disable-next-line no-loop-func
        const scriptUpdateState = (newState) => {
          currentState = newState;
          updateSpriteState(sprite.id, {
            position: { x: newState.x, y: newState.y },
            rotation: newState.rotation
          });
        };

        currentState = await executeScript(script, currentState, scriptUpdateState, sprite.id);
      }
    }
  };

  // Run animations for a single sprite
  const runSpriteAnimations = async (sprite, targetPosition = null) => {
    // Initialize the current state from the sprite's starting position and rotation
    let currentState = {
      x: sprite.position.x,
      y: sprite.position.y,
      rotation: sprite.rotation
    };

    const scripts = sprite.scripts;
    const scriptsToExecute = [];
    let repeatCount = 1;

    // First pass: separate repeat blocks from other scripts
    // This allows top-level repeat blocks to wrap all subsequent scripts
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];

      if (script.type === 'repeat') {
        // Extract the repeat count from the first repeat block found
        repeatCount = parseInt(script.params.times) || 1;
      } else {
        // Collect all non-repeat scripts to execute
        scriptsToExecute.push(script);
      }
    }

    // If a target position override is provided (due to path crossing),
    // animate directly to that position instead of executing scripts
    if (targetPosition) {
      const updateState = (newState) => {
        currentState = newState;
        updateSpriteState(sprite.id, {
          position: { x: newState.x, y: newState.y },
          rotation: newState.rotation
        });
      };

      await animateMovement(currentState, targetPosition, updateState);
      return;
    }

    // Second pass: execute collected scripts the specified number of times
    for (let i = 0; i < repeatCount; i++) {
      for (const script of scriptsToExecute) {
        // Create a closure to update both local and global sprite state
        // Function created in loop but safely captures current state
        // eslint-disable-next-line no-loop-func
        const updateState = (newState) => {
          currentState = newState;
          updateSpriteState(sprite.id, {
            position: { x: newState.x, y: newState.y },
            rotation: newState.rotation
          });
        };

        currentState = await executeScript(script, currentState, updateState, sprite.id);
      }
    }
  };

  const executeScript = async (script, currentState, updateState, spriteId) => {
    const { type, params } = script;

    switch (type) {
      case 'move':
        const steps = parseInt(params.steps) || 0;
        // Convert rotation from degrees to radians for trigonometric calculations
        const radians = (currentState.rotation * Math.PI) / 180;
        // Calculate new position based on current rotation angle
        // cos(angle) gives horizontal component, sin(angle) gives vertical component
        const maxX = Math.max(stageSize.width - SPRITE_SIZE, 0);
        const maxY = Math.max(stageSize.height - SPRITE_SIZE, 0);
        const newX = clamp(currentState.x + steps * Math.cos(radians), 0, maxX);
        const newY = clamp(currentState.y + steps * Math.sin(radians), 0, maxY);
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
        const maxGotoX = Math.max(stageSize.width - SPRITE_SIZE, 0);
        const maxGotoY = Math.max(stageSize.height - SPRITE_SIZE, 0);
        const clampedX = clamp(targetX, 0, maxGotoX);
        const clampedY = clamp(targetY, 0, maxGotoY);
        await animateMovement(currentState, { ...currentState, x: clampedX, y: clampedY }, updateState);
        return { ...currentState, x: clampedX, y: clampedY };

      case 'repeat':
        const times = parseInt(params.times) || 1;
        let state = currentState;
        // Execute all child scripts sequentially for each iteration
        // State is passed through each execution to maintain position/rotation continuity
        for (let i = 0; i < times; i++) {
          for (const childScript of script.children || []) {
            // Recursively execute each child script, updating state with each execution
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
      const maxX = Math.max(stageSize.width - SPRITE_SIZE, 0);
      const maxY = Math.max(stageSize.height - SPRITE_SIZE, 0);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentX = clamp(from.x + (to.x - from.x) * progress, 0, maxX);
        const currentY = clamp(from.y + (to.y - from.y) * progress, 0, maxY);

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
