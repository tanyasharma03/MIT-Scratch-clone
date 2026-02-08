import React, { createContext, useState, useCallback } from 'react';

export const ScriptContext = createContext();

function ScriptProvider({ children }) {
  const [scripts, setScripts] = useState([]);
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
  const [spriteRotation, setSpriteRotation] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [spriteMessage, setSpriteMessage] = useState({ text: '', type: '' }); // type: 'say' or 'think'

  const addScript = useCallback((block) => {
    const newBlock = { ...block, id: Date.now() };
    delete newBlock.insertAt; // Remove insertAt from the actual block

    if (block.insertAt !== undefined) {
      // Insert at specific position
      setScripts((prev) => {
        const newScripts = [...prev];
        newScripts.splice(block.insertAt, 0, newBlock);
        return newScripts;
      });
    } else {
      // Add to end
      setScripts((prev) => [...prev, newBlock]);
    }
  }, []);

  const removeScript = useCallback((id) => {
    setScripts((prev) => prev.filter((script) => script.id !== id));
  }, []);

  const updateScript = useCallback((id, updates) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === id ? { ...script, ...updates } : script
      )
    );
  }, []);

  const reorderScripts = useCallback((fromIndex, toIndex) => {
    setScripts((prev) => {
      const newScripts = [...prev];
      const [removed] = newScripts.splice(fromIndex, 1);
      newScripts.splice(toIndex, 0, removed);
      return newScripts;
    });
  }, []);

  const resetSprite = useCallback(() => {
    setSpritePosition({ x: 0, y: 0 });
    setSpriteRotation(0);
  }, []);

  const value = {
    scripts,
    spritePosition,
    spriteRotation,
    isRunning,
    spriteMessage,
    setScripts,
    setSpritePosition,
    setSpriteRotation,
    setIsRunning,
    setSpriteMessage,
    addScript,
    removeScript,
    updateScript,
    reorderScripts,
    resetSprite,
  };

  return (
    <ScriptContext.Provider value={value}>
      {children}
    </ScriptContext.Provider>
  );
}

export default ScriptProvider;
