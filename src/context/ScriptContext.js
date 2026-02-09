import { createContext, useState, useCallback, useEffect } from 'react';

export const ScriptContext = createContext();

const SPRITE_TEMPLATES = [
  {
    type: 'tom',
    name: 'Tom',
    image: 'https://en.scratch-wiki.info/w/images/ScratchCat3.0.svg',
  },
  {
    type: 'gobo',
    name: 'Gobo',
    image: 'https://cdn.assets.scratch.mit.edu/internalapi/asset/f505a4e9eab5e40e2669a4462dba4c90.svg/get/',
  },
  {
    type: 'dinosaur',
    name: 'Dinosaur',
    image: 'https://cdn.assets.scratch.mit.edu/internalapi/asset/45b02fbd582c15a50e1953830b59b377.svg/get/',
  },
  {
    type: 'apple',
    name: 'Apple',
    image: 'https://cdn.assets.scratch.mit.edu/internalapi/asset/3826a4091a33e4d26f87a2fac7cf796b.svg/get/',
  }
];


const INITIAL_ACTIVE_SPRITES = [
  {
    id: 'tom-default',
    type: 'tom',
    name: 'Tom',
    image: 'https://en.scratch-wiki.info/w/images/ScratchCat3.0.svg',
    position: { x: 0, y: 0 },
    rotation: 0,
    message: { text: '', type: '' },
    scripts: []
  }
];

function ScriptProvider({ children }) {
  const [activeSprites, setActiveSprites] = useState(INITIAL_ACTIVE_SPRITES);
  const [selectedSpriteId, setSelectedSpriteId] = useState('tom-default');
  const [isRunning, setIsRunning] = useState(false);
  const [swappedPairs, setSwappedPairs] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Get the currently selected sprite
  const selectedSprite = activeSprites.find(s => s.id === selectedSpriteId) || activeSprites[0];

  const addScript = useCallback((block) => {
    const newBlock = { ...block, id: Date.now() };
    delete newBlock.insertAt;

    setActiveSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === selectedSpriteId
          ? {
              ...sprite,
              scripts: block.insertAt !== undefined
                ? [...sprite.scripts.slice(0, block.insertAt), newBlock, ...sprite.scripts.slice(block.insertAt)]
                : [...sprite.scripts, newBlock]
            }
          : sprite
      )
    );
  }, [selectedSpriteId]);

  const removeScript = useCallback((scriptId) => {
    setActiveSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === selectedSpriteId
          ? { ...sprite, scripts: sprite.scripts.filter((script) => script.id !== scriptId) }
          : sprite
      )
    );
  }, [selectedSpriteId]);

  const updateScript = useCallback((scriptId, updates) => {
    setActiveSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === selectedSpriteId
          ? {
              ...sprite,
              scripts: sprite.scripts.map((script) =>
                script.id === scriptId ? { ...script, ...updates } : script
              )
            }
          : sprite
      )
    );
  }, [selectedSpriteId]);

  const reorderScripts = useCallback((fromIndex, toIndex) => {
    setActiveSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id === selectedSpriteId) {
          const newScripts = [...sprite.scripts];
          const [removed] = newScripts.splice(fromIndex, 1);
          newScripts.splice(toIndex, 0, removed);
          return { ...sprite, scripts: newScripts };
        }
        return sprite;
      })
    );
  }, [selectedSpriteId]);

  const updateSpriteState = useCallback((spriteId, updates) => {
    setActiveSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, ...updates } : sprite
      )
    );
  }, []);

  const resetSprite = useCallback(() => {
    setActiveSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === selectedSpriteId
          ? {
              ...sprite,
              position: { x: 0, y: 0 },
              rotation: 0,
              message: { text: '', type: '' }
            }
          : sprite
      )
    );
  }, [selectedSpriteId]);

  const resetAllSprites = useCallback(() => {
    setActiveSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        position: { x: 0, y: 0 },
        rotation: 0,
        message: { text: '', type: '' }
      }))
    );
  }, []);

  const addSprite = useCallback((spriteType) => {
    const template = SPRITE_TEMPLATES.find(t => t.type === spriteType);
    if (!template) return;

    setActiveSprites((prev) => {
      const newSprite = {
        id: `${spriteType}-${Date.now()}`,
        type: spriteType,
        name: template.name,
        image: template.image,
        position: { x: prev.length * 100, y: 0 },
        rotation: 0,
        message: { text: '', type: '' },
        scripts: []
      };
      setSelectedSpriteId(newSprite.id);
      return [...prev, newSprite];
    });
  }, []);

  const removeSprite = useCallback((spriteId) => {
    setActiveSprites((prev) => {
      const newSprites = prev.filter((sprite) => sprite.id !== spriteId);
      if (selectedSpriteId === spriteId && newSprites.length > 0) {
        setSelectedSpriteId(newSprites[0].id);
      }
      return newSprites;
    });
  }, [selectedSpriteId]);

  // Hero Feature: Collision-Based Animation Swap
  const swapIfCollision = useCallback((currentSprites) => {
    const snapshot = [...currentSprites];
    let newSwaps = null;

    for (let i = 0; i < snapshot.length; i++) {
      for (let j = i + 1; j < snapshot.length; j++) {
        const a = snapshot[i];
        const b = snapshot[j];

        if (!a.position || !b.position) {
          continue;
        }

        const pairKey = [a.id, b.id].sort().join('-');

        // Calculate distance between sprites
        const distance = Math.hypot(
          a.position.x - b.position.x,
          a.position.y - b.position.y
        );

        // Collision detected: swap animations when distance <= 80px
        if (distance <= 80 && !swappedPairs[pairKey]) {
          setActiveSprites((prev) => {
            return prev.map((sprite) => {
              if (sprite.id === a.id) {
                return { ...sprite, scripts: b.scripts };
              } else if (sprite.id === b.id) {
                return { ...sprite, scripts: a.scripts };
              }
              return sprite;
            });
          });

          if (!newSwaps) newSwaps = { ...swappedPairs };
          newSwaps[pairKey] = true;
        }
        else if (distance > 80 && swappedPairs[pairKey]) {
          if (!newSwaps) newSwaps = { ...swappedPairs };
          delete newSwaps[pairKey];
        }
      }
    }

    if (newSwaps) {
      setSwappedPairs(newSwaps);
    }
  }, [swappedPairs]);

  useEffect(() => {
    if (activeSprites.length >= 2 && isAnimating) {
      swapIfCollision(activeSprites);
    }
  }, [activeSprites, swapIfCollision, isAnimating]);

  const value = {
    spriteTemplates: SPRITE_TEMPLATES,
    activeSprites,
    sprites: activeSprites,
    selectedSpriteId,
    selectedSprite,
    isRunning,
    isAnimating,
    setActiveSprites,
    setSelectedSpriteId,
    setIsRunning,
    setIsAnimating,
    addScript,
    removeScript,
    updateScript,
    reorderScripts,
    updateSpriteState,
    resetSprite,
    resetAllSprites,
    addSprite,
    removeSprite,
  };

  return (
    <ScriptContext.Provider value={value}>
      {children}
    </ScriptContext.Provider>
  );
}

export default ScriptProvider;
