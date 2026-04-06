import { useState, useCallback } from 'react';
import elementData from '../data/elementData';

const DECK_KEY = 'elementDrawPile';
const ALL_IDS = elementData.map(el => el.id);

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadPile() {
  try {
    const raw = localStorage.getItem(DECK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return shuffle([...ALL_IDS]);
}

function savePile(pile) {
  try {
    localStorage.setItem(DECK_KEY, JSON.stringify(pile));
  } catch (_) {}
}

function popElements(pile, count) {
  let current = [...pile];
  let drawnIds = [];

  const take = n => {
    const batch = current.splice(-n).reverse();
    drawnIds.push(...batch);
  };

  if (current.length >= count) {
    take(count);
  } else {
    take(current.length);
    current = shuffle([...ALL_IDS]);
    take(count - drawnIds.length);
  }

  return { remaining: current, drawnIds };
}

const useElementDeck = () => {
  const [pileVersion, setPileVersion] = useState(0);

  const syncPile = useCallback(() => {
    return loadPile();
  }, []);

  const draw = useCallback((count) => {
    const currentPile = loadPile();
    const { remaining, drawnIds } = popElements(currentPile, count);

    savePile(remaining);
    setPileVersion(v => v + 1);

    const elements = drawnIds
      .map(id => elementData.find(el => el.id === id))
      .filter(Boolean);

    return { elements, remaining: remaining.length };
  }, []);

  const resetDeck = useCallback(() => {
    const fresh = shuffle([...ALL_IDS]);
    savePile(fresh);
    setPileVersion(v => v + 1);
  }, []);

  return { draw, resetDeck, syncPile, pileVersion };
};

export default useElementDeck;
