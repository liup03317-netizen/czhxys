import { useState, useCallback } from 'react';

const useTutorial = (key) => {
  const [hasSeen, setHasSeen] = useState(() => {
    try { return localStorage.getItem(`tutorial_${key}`) === '1'; } catch (_) { return true; }
  });

  const completeTutorial = useCallback(() => {
    setHasSeen(true);
    try { localStorage.setItem(`tutorial_${key}`, '1'); } catch (_) {}
  }, [key]);

  return [hasSeen, completeTutorial];
};

export default useTutorial;
