import React, { createContext, useState, useCallback } from 'react';

export const ScriptContext = createContext();

function ScriptProvider({ children }) {
  const [scripts, setScripts] = useState([]);
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
  const [spriteRotation, setSpriteRotation] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const addScript = useCallback((block) => {
    setScripts((prev) => [...prev, { ...block, id: Date.now() }]);
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

  const resetSprite = useCallback(() => {
    setSpritePosition({ x: 0, y: 0 });
    setSpriteRotation(0);
  }, []);

  const value = {
    scripts,
    spritePosition,
    spriteRotation,
    isRunning,
    setScripts,
    setSpritePosition,
    setSpriteRotation,
    setIsRunning,
    addScript,
    removeScript,
    updateScript,
    resetSprite,
  };

  return (
    <ScriptContext.Provider value={value}>
      {children}
    </ScriptContext.Provider>
  );
}

export default ScriptProvider;
