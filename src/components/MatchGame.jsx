import { useState, useEffect } from 'react';
import elementData from '../data/elementData';
import useElementDeck from '../hooks/useElementDeck';
import useTutorial from '../hooks/useTutorial';

const MISTAKE_KEY = 'globalMistakeDetails';

const ATTR_LABELS = {
  symbol: '符号',
  name: '名称',
  atomicNumber: '原子序数',
  valence: '化合价',
  atomicMass: '相对原子质量',
  commonUse: '应用场景'
};

const StarIcon = ({ filled, className, size = 'w-8 h-8' }) => (
  <svg className={`${className} ${size}`} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const TimerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);

const TrophyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3h14v2h2v4c0 2.21-1.79 4-4 4h-1.17c-.41 1.17-1.19 2.17-2.21 2.83L14 19h3v2H7v-2h3l.38-3.17c-1.02-.66-1.8-1.66-2.21-2.83H7c-2.21 0-4-1.79-4-4V5h2V3z" />
  </svg>
);

const ShuffleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

const HelpIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
  </svg>
);

const BookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const AppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

const TargetIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const MatchGame = ({ currentLevel: propsCurrentLevel, onComplete, preloadedForgotIds }) => {
  const { draw } = useElementDeck();
  const [currentLevel, setCurrentLevel] = useState(propsCurrentLevel || 1);

  const levelConfigs = [
    { id: 1, title: '识其名', matchKey1: 'symbol', matchKey2: 'name', description: '匹配元素符号与中文名称' },
    { id: 2, title: '知其序', matchKey1: 'symbol', matchKey2: 'atomicNumber', description: '匹配元素符号与原子序数' },
    { id: 3, title: '晓其价', matchKey1: 'symbol', matchKey2: 'valence', description: '匹配元素符号与常见化合价' },
    { id: 4, title: '明其重', matchKey1: 'symbol', matchKey2: 'atomicMass', description: '匹配元素符号与相对原子质量' },
    { id: 5, title: '综合挑战1', matchKey1: 'random', matchKey2: 'random', description: '随机匹配元素属性' },
    { id: 6, title: '综合挑战2', matchKey1: 'random', matchKey2: 'random', description: '随机匹配元素属性' },
    { id: 7, title: '综合挑战3', matchKey1: 'random', matchKey2: 'random', description: '终极挑战' }
  ];

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [waveStartTime, setWaveStartTime] = useState(Date.now());
  const [stars, setStars] = useState(1);
  const [finalStats, setFinalStats] = useState(null);

  const [mistakePool, setMistakePool] = useState(new Set());
  const [mistakeDetails, setMistakeDetails] = useState([]);
  const [isOvertime, setIsOvertime] = useState(false);
  const [enteredOvertime, setEnteredOvertime] = useState(false);
  const [hasSeenMatchTutorial, completeMatchTutorial] = useTutorial('match_game');

  const currentLevelConfig = levelConfigs.find(config => config.id === currentLevel);

  useEffect(() => {
    if (Array.isArray(preloadedForgotIds) && preloadedForgotIds.length > 0) {
      setMistakePool(new Set(preloadedForgotIds));
      setIsOvertime(true);
      initializeGame(true);
    } else {
      setMistakePool(new Set());
      setIsOvertime(false);
      initializeGame();
    }
  }, [currentLevel]);

  useEffect(() => {
    if (propsCurrentLevel) {
      setCurrentLevel(propsCurrentLevel);
    }
  }, [propsCurrentLevel]);

  useEffect(() => {
    if (time > 0 && !gameOver && matchedCards.length < cards.length) {
      const timer = setTimeout(() => setTime(time - 1), 1000);
      return () => clearTimeout(timer);
    } else if (time === 0 && !gameOver) {
      setGameOver(true);
    }
  }, [time, gameOver, matchedCards.length, cards.length]);

  const getElementInfo = (elementId) => elementData.find(el => el.id === elementId);

  const getAttrLabel = (attrType) => ATTR_LABELS[attrType] || attrType;

  const recordMistake = (card1, card2) => {
    const el1 = getElementInfo(card1.elementId);
    const el2 = getElementInfo(card2.elementId);

    let targetAttrType = null;
    let targetElementId = null;
    let wrongMatchElementId = null;

    if (currentLevel >= 7) {
      const anchorCard = card1.type === 'anchor' ? card1 : (card2.type === 'anchor' ? card2 : null);
      const contextCard = card1.type === 'context' ? card1 : (card2.type === 'context' ? card2 : null);
      const numericCard = card1.type === 'numeric' ? card1 : (card2.type === 'numeric' ? card2 : null);

      if (anchorCard && contextCard) {
        targetElementId = anchorCard.elementId;
        targetAttrType = 'commonUse';
        wrongMatchElementId = contextCard.elementId !== anchorCard.elementId ? contextCard.elementId : null;
      } else if (anchorCard && numericCard) {
        targetElementId = anchorCard.elementId;
        targetAttrType = numericCard.attrType;
        wrongMatchElementId = numericCard.elementId !== anchorCard.elementId ? numericCard.elementId : null;
      }
    } else if (currentLevel >= 5) {
      const anchorCard = card1.type === 'anchor' ? card1 : card2.type === 'anchor' ? card2 : null;
      const numericCard = card1.type === 'numeric' ? card1 : card2.type === 'numeric' ? card2 : null;

      if (anchorCard && numericCard) {
        targetElementId = anchorCard.elementId;
        targetAttrType = numericCard.attrType;
        wrongMatchElementId = numericCard.elementId !== anchorCard.elementId ? numericCard.elementId : null;
      }
    } else {
      const key2Card = card1.type === 'key2' ? card1 : card2.type === 'key2' ? card2 : null;
      if (key2Card) {
        targetElementId = key2Card.elementId;
        targetAttrType = currentLevelConfig.matchKey2;
        const otherCard = card1.type === 'key2' ? card2 : card1;
        wrongMatchElementId = otherCard.elementId !== key2Card.elementId ? otherCard.elementId : null;
      }
    }

    const targetEl = getElementInfo(targetElementId);
    const detail = {
      elementId: targetElementId,
      elementSymbol: targetEl?.symbol || '?',
      elementName: targetEl?.name || '?',
      attrType: targetAttrType,
      attrLabel: getAttrLabel(targetAttrType),
      wrongMatchId: wrongMatchElementId,
      wrongMatchSymbol: getElementInfo(wrongMatchElementId)?.symbol || null,
      wave: wave,
      timestamp: Date.now()
    };

    setMistakeDetails(prev => {
      const updated = [...prev, detail];
      try { localStorage.setItem(MISTAKE_KEY, JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    return detail;
  };

  const initializeGame = (useMistakePool = false) => {
    let selectedElements;
    let generatedCards = [];

    if (useMistakePool && mistakePool.size > 0) {
      selectedElements = Array.from(mistakePool).map(id => elementData.find(el => el.id === id)).filter(Boolean);
    } else {
      const drawCount = (currentLevel >= 5) ? 10 : 8;
      const maxAllowedId = Math.min(20, (currentLevel + 1) * 3);
      let drawnElements = [];
      let attempts = 0;
      while (drawnElements.length < drawCount && attempts < 50) {
        const { elements: batch } = draw(drawCount - drawnElements.length);
        const filtered = batch.filter(el => el.id <= maxAllowedId);
        drawnElements = [...drawnElements, ...filtered];
        attempts++;
      }
      selectedElements = drawnElements.slice(0, drawCount);
    }

    if (currentLevel >= 7) {
      selectedElements.forEach((element) => {
        const anchorTypes = ['symbol', 'name'];
        const anchorType = anchorTypes[Math.floor(Math.random() * 2)];
        const anchorValue = element[anchorType];
        const rnd = Math.random().toString(36).substring(2, 9);

        generatedCards.push({
          uniqueId: `${element.id}-anchor-${anchorType}-${rnd}`,
          elementId: element.id,
          displayValue: anchorValue,
          type: 'anchor',
          attrType: anchorType,
          selected: false,
          matched: false
        });

        generatedCards.push({
          uniqueId: `${element.id}-context-${rnd}`,
          elementId: element.id,
          displayValue: element.commonUse || '未知用途',
          type: 'context',
          attrType: 'commonUse',
          selected: false,
          matched: false
        });
      });
    } else if (currentLevel >= 5) {
      selectedElements.forEach((element) => {
        const anchorTypes = ['symbol', 'name'];
        const anchorType = anchorTypes[Math.floor(Math.random() * 2)];
        const anchorValue = element[anchorType];
        const rnd = Math.random().toString(36).substring(2, 9);

        generatedCards.push({
          uniqueId: `${element.id}-anchor-${anchorType}-${rnd}`,
          elementId: element.id,
          displayValue: anchorValue,
          type: 'anchor',
          attrType: anchorType,
          selected: false,
          matched: false
        });

        let numericTypes;
        if (currentLevel === 5) {
          numericTypes = ['atomicNumber', 'valence'];
        } else {
          numericTypes = ['atomicNumber', 'valence', 'atomicMass'];
        }

        const numericType = numericTypes[Math.floor(Math.random() * numericTypes.length)];
        let numericValue = element[numericType];
        if (numericType === 'atomicMass') {
          numericValue = element.symbol === 'Cl' ? '35.5' : Math.round(element.atomicMass);
        }

        generatedCards.push({
          uniqueId: `${element.id}-numeric-${numericType}-${rnd}`,
          elementId: element.id,
          displayValue: numericValue,
          type: 'numeric',
          attrType: numericType,
          selected: false,
          matched: false
        });
      });
    } else {
      selectedElements.forEach((element) => {
        const rnd = Math.random().toString(36).substring(2, 9);
        generatedCards.push({
          uniqueId: `${element.id}-key1-${rnd}`,
          elementId: element.id,
          displayValue: element[currentLevelConfig.matchKey1],
          type: 'key1',
          selected: false,
          matched: false
        });
        let displayValue = element[currentLevelConfig.matchKey2];
        if (currentLevelConfig.matchKey2 === 'atomicMass') {
          displayValue = element.symbol === 'Cl' ? '35.5' : Math.round(element.atomicMass);
        }
        generatedCards.push({
          uniqueId: `${element.id}-key2-${rnd}`,
          elementId: element.id,
          displayValue: displayValue,
          type: 'key2',
          selected: false,
          matched: false
        });
      });
    }

    const shuffledCards = generatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setSelectedCards([]);
    setMatchedCards([]);
    setShowSuccessModal(false);
    setShowLevelCompleteModal(false);
    setTime(60);
    setGameOver(false);
    setWaveStartTime(Date.now());
  };

  const reshuffleCards = () => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const handleCardClick = (card) => {
    if (card.matched || card.selected || isChecking || selectedCards.length >= 2 || gameOver) return;
    completeMatchTutorial();

    const updatedCards = cards.map(c =>
      c.uniqueId === card.uniqueId ? { ...c, selected: true } : c
    );
    setCards(updatedCards);

    const newSelectedCards = [...selectedCards, card];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      checkMatch(newSelectedCards);
    }
  };

  const checkMatch = (selected) => {
    setIsChecking(true);

    const [card1, card2] = selected;
    let isMatch = false;

    if (currentLevel >= 5) {
      const anchorCard = card1.type === 'anchor' ? card1 : (card2.type === 'anchor' ? card2 : null);
      const numericCard = card1.type === 'numeric' ? card1 : (card2.type === 'numeric' ? card2 : null);
      const contextCard = card1.type === 'context' ? card1 : (card2.type === 'context' ? card2 : null);

      if (anchorCard && contextCard) {
        isMatch = anchorCard.elementId === contextCard.elementId;
      } else if (anchorCard && numericCard) {

      if (!anchorCard || !numericCard) {
        isMatch = false;
      } else {
        const anchorValue = anchorCard.displayValue;
        const numericValue = numericCard.displayValue;

        let matchedElement = null;
        if (anchorCard.attrType === 'symbol') {
          matchedElement = elementData.find(el => el.symbol === anchorValue);
        } else if (anchorCard.attrType === 'name') {
          matchedElement = elementData.find(el => el.name === anchorValue);
        }

        if (matchedElement) {
          const atomicNumberStr = String(matchedElement.atomicNumber);
          const valenceStr = String(matchedElement.valence);
          const atomicMassStr = matchedElement.symbol === 'Cl' ? '35.5' : String(Math.round(matchedElement.atomicMass));

          isMatch = (
            atomicNumberStr === String(numericValue) ||
            valenceStr === String(numericValue) ||
            atomicMassStr === String(numericValue)
          );
        }
      }
      }
    } else {
      if (card1.type === card2.type) {
        setTimeout(() => {
          const updatedCards = cards.map(c =>
            c.uniqueId === card1.uniqueId || c.uniqueId === card2.uniqueId
              ? { ...c, selected: false }
              : c
          );
          setCards(updatedCards);
          setSelectedCards([]);
          setIsChecking(false);
        }, 1000);
        return;
      }

      const element1 = elementData.find(el => el.id === card1.elementId);
      const element2 = elementData.find(el => el.id === card2.elementId);

      let value1 = element1 ? element1[currentLevelConfig.matchKey2] : null;
      let value2 = element2 ? element2[currentLevelConfig.matchKey2] : null;

      if (currentLevelConfig.matchKey2 === 'atomicMass') {
        value1 = element1 && element1.symbol === 'Cl' ? '35.5' : (element1 ? Math.round(element1.atomicMass) : null);
        value2 = element2 && element2.symbol === 'Cl' ? '35.5' : (element2 ? Math.round(element2.atomicMass) : null);
      }

      isMatch = element1 && element2 && card1.elementId === card2.elementId && value1 === value2;
    }

    setTimeout(() => {
      if (isMatch) {
        const updatedCards = cards.map(c =>
          c.uniqueId === card1.uniqueId || c.uniqueId === card2.uniqueId
            ? { ...c, matched: true, selected: false }
            : c
        );
        setCards(updatedCards);
        setMatchedCards(prev => {
          const newMatched = [...prev, card1.uniqueId, card2.uniqueId];
          if (newMatched.length === cards.length) {
            const waveUsedTime = Math.round((Date.now() - waveStartTime) / 1000);
            setTotalTimeUsed(p => p + waveUsedTime);
            setTimeout(() => {
              calculateStars(waveUsedTime);
              setShowSuccessModal(true);
              setGameOver(true);
            }, 300);
          }
          return newMatched;
        });
        setScore(s => s + 10);
      } else {
        const updatedCards = cards.map(c =>
          c.uniqueId === card1.uniqueId || c.uniqueId === card2.uniqueId
            ? { ...c, selected: false }
            : c
        );
        setCards(updatedCards);

        recordMistake(card1, card2);

        setMistakePool(prev => {
          const newPool = new Set(prev);
          if (card1.elementId) newPool.add(card1.elementId);
          if (card2.elementId) newPool.add(card2.elementId);
          return newPool;
        });
      }

      setSelectedCards([]);
      setIsChecking(false);
    }, 400);
  };

  const calculateStars = (waveUsedTime) => {
    const hasErrors = mistakeDetails.filter(m => m.wave === wave).length > 0;
    const isFastEnough = waveUsedTime <= 15;
    const isFirstPass = !enteredOvertime;

    let earnedStars = 1;

    if (!hasErrors) {
      earnedStars = 2;
      if (isFastEnough && isFirstPass) {
        earnedStars = 3;
      }
    }

    setStars(earnedStars);

    const totalPairs = currentLevel >= 5 ? 10 : 8;
    const accuracyPct = Math.max(0, Math.round(((totalPairs * wave - mistakeDetails.filter(m => m.wave <= wave).length) / (totalPairs * wave)) * 100));

    setFinalStats({
      stars: earnedStars,
      totalTime: totalTimeUsed + Math.round((Date.now() - waveStartTime) / 1000),
      accuracy: accuracyPct,
      totalMistakes: mistakeDetails.length,
      zeroErrorWaves: [1, 2, 3].filter(w => mistakeDetails.filter(m => m.wave === w).length === 0).length,
      enteredOvertime: enteredOvertime,
      isLastWave: wave >= 3
    });
  };

  const nextWave = () => {
    if (wave >= 3) {
      if (mistakePool.size > 0 && !isOvertime) {
        setEnteredOvertime(true);
        setIsOvertime(true);
        initializeGame(true);
      } else {
        buildFinalStatsAndShowComplete();
      }
    } else {
      const waveUsedTime = Math.round((Date.now() - waveStartTime) / 1000);
      setTotalTimeUsed(prev => prev + waveUsedTime);
      setWave(wave + 1);
      setScore(score + 50);
      initializeGame();
    }
  };

  const buildFinalStatsAndShowComplete = () => {
    const accuracyPct = mistakeDetails.length === 0 ? 100 :
      Math.max(0, Math.round((((currentLevel >= 5 ? 30 : 24) - mistakeDetails.length) / (currentLevel >= 5 ? 30 : 24)) * 100));

    setFinalStats({
      stars,
      totalTime: totalTimeUsed,
      accuracy: accuracyPct,
      totalMistakes: mistakeDetails.length,
      zeroErrorWaves: [1, 2, 3].filter(w => mistakeDetails.filter(m => m.wave === w).length === 0).length,
      enteredOvertime,
      isLastWave: true
    });
    setShowLevelCompleteModal(true);
  };

  const handleOvertimeComplete = () => {
    buildFinalStatsAndShowComplete();
  };

  const getUniqueMistakes = () => {
    const seen = new Set();
    return mistakeDetails.filter(m => {
      const key = `${m.elementId}-${m.attrType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const getMistakeElementIds = () => {
    return [...new Set(mistakeDetails.map(m => m.elementId))];
  };

  const nextLevel = () => {
    if (currentLevel < levelConfigs.length) {
      const nextLevelNum = currentLevel + 1;
      resetGameState();
      if (onComplete) {
        onComplete(stars, finalStats);
      } else {
        setCurrentLevel(nextLevelNum);
        setWave(1);
        setScore(0);
      }
    }
  };

  const handleReviewWeak = () => {
    if (onComplete) {
      onComplete(stars, finalStats, getMistakeElementIds());
    }
  };

  const handleDailyReview = () => {
    resetGameState();
    const allMistakeIds = [...new Set(mistakeDetails.map(m => m.elementId))];
    if (allMistakeIds.length > 0) {
      setMistakePool(new Set(allMistakeIds));
      setIsOvertime(true);
      setEnteredOvertime(true);
      initializeGame(true);
    } else {
      initializeGame();
    }
  };

  const resetGameState = () => {
    setMistakePool(new Set());
    setMistakeDetails([]);
    setIsOvertime(false);
    setEnteredOvertime(false);
    setTotalTimeUsed(0);
    setStars(1);
    setFinalStats(null);
    try { localStorage.removeItem(MISTAKE_KEY); } catch (_) {}
  };

  const replayLevel = () => {
    resetGameState();
    setWave(1);
    setScore(0);
    initializeGame();
  };

  const restartGame = () => {
    resetGameState();
    setCurrentLevel(1);
    setWave(1);
    setScore(0);
    initializeGame();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStarRow = (earnedStars, size = 'w-9 h-9') => (
    <div className="flex justify-center gap-2">
      {[1, 2, 3].map(s => (
        <StarIcon
          key={s}
          filled={s <= earnedStars}
          className={`transition-all duration-500 ${s <= earnedStars ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-100' : 'text-slate-600 scale-90'}`}
          size={size}
        />
      ))}
    </div>
  );

  const renderDiagnosisReport = () => {
    const uniqueMistakes = getUniqueMistakes();
    if (uniqueMistakes.length === 0) return null;

    const attrGrouped = {};
    uniqueMistakes.forEach(m => {
      if (!attrGrouped[m.attrType]) attrGrouped[m.attrType] = [];
      attrGrouped[m.attrType].push(m);
    });

    return (
      <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-red-500/[0.06] to-orange-500/[0.03] border border-red-500/20">
        <div className="flex items-center gap-2 mb-3">
          <TargetIcon className="text-red-400 w-4 h-4" />
          <span className="text-xs font-['Space_Grotesk'] font-bold text-red-400 uppercase tracking-wider">薄弱点扫描</span>
        </div>

        <div className="space-y-2">
          {Object.entries(attrGrouped).map(([attrType, mistakes]) => (
            <div key={attrType} className="flex items-start gap-2 bg-black/20 rounded-lg p-2.5">
              <span className="text-sm mt-0.5">🔴</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#dee5ff]">
                  {mistakes.map(m => `${m.elementSymbol} (${m.elementName})`).join('、')}
                </span>
                <span className="text-xs text-red-300 ml-1.5">
                  的{getAttrLabel(attrType)}需巩固
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStatBar = (label, value, color) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-[#4d556b] uppercase tracking-wider font-['Space_Grotesk']">{label}</span>
        <span className="text-xs font-['Space_Grotesk'] font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060e20] font-['Manrope',sans-serif] text-[#dee5ff] pb-32 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% -20%, #00555a 0%, transparent 50%),
          radial-gradient(circle at 0% 100%, #2b0065 0%, transparent 40%)
        `,
        backgroundAttachment: 'fixed'
      }}
    >
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/60 backdrop-blur-xl border-b border-[#99f7ff]/15 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <StarIcon className="text-[#99f7ff] w-6 h-6 transition-transform duration-300 hover:scale-105" filled size="w-6 h-6" />
          <h1 className="font-['Space_Grotesk'] tracking-widest uppercase text-sm text-[#99f7ff]">
            DAY {currentLevel}/7: {currentLevelConfig?.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            data-testid="match-exit-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#99f7ff]/60 hover:text-[#99f7ff] hover:bg-white/10 hover:border-[#99f7ff]/30 active:scale-95 transition-all font-['Space_Grotesk'] text-xs"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            退出
          </button>
          <div className="bg-[#141f38] px-4 py-1.5 rounded-full border border-[#99f7ff]/20 flex items-center gap-2 shadow-[0_0_20px_rgba(153,247,255,0.15),inset_0_0_10px_rgba(153,247,255,0.05)]">
            <TimerIcon className="text-xs text-[#99f7ff] w-4 h-4" />
            <span className="font-['Space_Grotesk'] font-bold text-sm tracking-tight">{formatTime(time)}</span>
          </div>
          <div className="bg-[#99f7ff]/10 px-4 py-1.5 rounded-full border border-[#99f7ff]/30 flex items-center gap-2 shadow-[0_0_20px_rgba(153,247,255,0.15),inset_0_0_10px_rgba(153,247,255,0.05)]">
            <TrophyIcon className="text-xs text-[#99f7ff] w-4 h-4" />
            <span className="font-['Space_Grotesk'] font-bold text-sm tracking-tight text-[#99f7ff]">{score}</span>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {isOvertime && (
          <div className="mb-6 py-3 px-6 rounded-xl bg-gradient-to-r from-[#ff716c]/20 to-[#f271b5]/20 border border-[#ff716c]/40 shadow-[0_0_30px_rgba(255,113,108,0.2)] animate-pulse">
            <p className="text-center font-['Space_Grotesk'] font-bold text-sm tracking-wide text-[#ff716c]">
              🚨 数据受损：错题修复模式启动！剩余 {mistakePool.size} 个薄弱点
            </p>
          </div>
        )}
        <div className="text-center mb-6">
          <p className="font-['Manrope'] text-[#99f7ff]/60 text-sm tracking-widest uppercase">
            {currentLevel >= 7 ? '匹配符号/名称与应用场景' : currentLevel >= 5 ? '匹配符号/名称与数值' : currentLevelConfig?.description}
          </p>
          <div className="flex justify-center gap-3 mt-3">
            {[1, 2, 3].map(w => (
              <div key={w} className={`h-1 w-12 rounded-full ${w <= wave ? 'bg-[#99f7ff] shadow-[0_0_8px_#99f7ff]' : 'bg-[#99f7ff]/20'}`}></div>
            ))}
          </div>
        </div>

        <div className={`grid gap-4 md:gap-6 ${currentLevel >= 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {!hasSeenMatchTutorial && (
            <div className="col-span-full mb-2 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#00f1fe]/25" style={{ background: 'linear-gradient(90deg, rgba(0,241,254,0.08) 0%, rgba(6,14,32,0.9) 50%, rgba(175,136,255,0.08) 100%)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <p className="text-xs font-['Space_Grotesk'] text-[#00f1fe] font-bold">找出匹配的元素属性（如：符号 ↔ 名称/化合价）进行消除，选错会进入加时赛哦！</p>
                </div>
                <button onClick={completeMatchTutorial} className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90">
                  <span className="text-xs leading-none">×</span>
                </button>
              </div>
            </div>
          )}
          {cards.map((card) => (
            <div
              key={card.uniqueId}
              data-testid={`match-card-${card.uniqueId}`}
              onClick={() => handleCardClick(card)}
              className={`aspect-[3/4] rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer
                ${card.matched
                  ? 'opacity-0 scale-0'
                  : card.selected
                    ? 'bg-[#99f7ff]/10 backdrop-blur-xl border-2 border-[#99f7ff] shadow-[0_0_20px_rgba(153,247,255,0.4)] scale-105'
                    : `border ${currentLevel >= 7 && card.type === 'context'
                      ? 'border-[#8b5cf6]/40 bg-gradient-to-br from-[#8b5cf6]/15 to-[#6001d1]/8'
                      : currentLevel >= 5
                        ? card.type === 'anchor'
                          ? 'border-[#f271b5]/30 bg-[#f271b5]/10'
                          : 'border-[#99f7ff]/30 bg-[#99f7ff]/10'
                        : card.type === 'key1'
                          ? 'border-[#99f7ff]/30 bg-[#99f7ff]/10'
                          : 'border-[#af88ff]/30 bg-[#af88ff]/10'
                    } bg-[rgba(15,25,48,0.4)] backdrop-blur-[12px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(153,247,255,0.15),inset_0_0_10px_rgba(153,247,255,0.05)] hover:scale-105`
                }
              `}
            >
              {!card.matched && (
                <>
                  <span className={`font-['Space_Grotesk'] text-2xl md:text-3xl font-bold ${
                    card.selected
                      ? 'text-[#99f7ff]'
                      : currentLevel >= 7 && card.type === 'context'
                        ? 'text-[#c4b5fd]'
                        : currentLevel >= 5
                          ? card.type === 'anchor' ? 'text-[#f271b5]' : 'text-[#99f7ff]'
                          : card.type === 'key1' ? 'text-[#99f7ff]' : 'text-[#dee5ff]'
                  }`}>
                    {card.displayValue}
                  </span>
                  {card.type === 'anchor' && card.attrType === 'symbol' && !card.selected && (
                    <span className="font-['Manrope'] text-[8px] md:text-[10px] text-[#a3aac4] tracking-tighter mt-1 uppercase">
                      {elementData.find(el => el.symbol === card.displayValue)?.name || ''}
                    </span>
                  )}
                  {(currentLevel >= 7 && card.type === 'context') && !card.selected && (
                    <div className="mt-1.5 px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center gap-1">
                      <AppIcon className="w-3 h-3 text-[#a78bfa]" />
                      <span className="text-[8px] font-['Space_Grotesk'] text-[#c4b5fd] font-bold uppercase">应用</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button onClick={reshuffleCards} className="flex items-center gap-2 bg-[#141f38] px-4 py-2 rounded-full border border-[#99f7ff]/20 text-[#99f7ff] hover:bg-[#1f2b49] transition-all shadow-[0_0_20px_rgba(153,247,255,0.15)]">
            <ShuffleIcon className="w-4 h-4" /><span className="text-sm font-medium">洗牌</span>
          </button>
          <button onClick={() => setShowInstructions(true)} className="flex items-center gap-2 bg-[#141f38] px-4 py-2 rounded-full border border-[#99f7ff]/20 text-[#99f7ff] hover:bg-[#1f2b49] transition-all shadow-[0_0_20px_rgba(153,247,255,0.15)]">
            <HelpIcon className="w-4 h-4" /><span className="text-sm font-medium">帮助</span>
          </button>
          <button onClick={restartGame} className="flex items-center gap-2 bg-[#141f38] px-4 py-2 rounded-full border border-[#99f7ff]/20 text-[#99f7ff] hover:bg-[#1f2b49] transition-all shadow-[0_0_20px_rgba(153,247,255,0.15)]">
            <RefreshIcon className="w-4 h-4" /><span className="text-sm font-medium">重置</span>
          </button>
        </div>
      </main>

      <div className="fixed top-1/4 -left-12 w-64 h-64 bg-[#99f7ff]/5 blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-12 w-64 h-64 bg-[#af88ff]/5 blur-[100px] pointer-events-none"></div>

      {/* ===== Wave Success Modal ===== */}
      {showSuccessModal && finalStats && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="success-modal">
          <div className="bg-gradient-to-br from-[#0f1930]/95 to-[#0a1226]/98 backdrop-blur-xl rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-[#99f7ff]/15">
            <div className="text-center mb-5">
              <div className="text-5xl mb-2">{isOvertime ? '🔧' : '⚡'}</div>
              <h2 className="text-xl font-['Space_Grotesk'] font-bold text-[#99f7ff] mb-1">
                {isOvertime ? '修复完成！' : `第 ${wave} 波完成`}
              </h2>
              <p className="text-xs text-[#a3aac4]">
                {isOvertime ? '薄弱元素已重新配对验证' : '所有元素已成功匹配'}
              </p>
            </div>

            {renderStarRow(finalStats.stars)}

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 text-center">
                <div className="text-lg font-['Space_Grotesk'] font-bold text-[#00f1fe]">{finalStats.totalTime}s</div>
                <div className="text-[8px] text-[#4d556b]">用时</div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 text-center">
                <div className="text-lg font-['Space_Grotesk'] font-bold text-emerald-400">{finalStats.accuracy}%</div>
                <div className="text-[8px] text-[#4d556b]">正确率</div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-2.5 text-center">
                <div className="text-lg font-['Space_Grotesk'] font-bold text-yellow-400">{finalStats.totalMistakes}</div>
                <div className="text-[8px] text-[#4d556b]">失误</div>
              </div>
            </div>

            {renderDiagnosisReport()}

            <button
              onClick={isOvertime ? handleOvertimeComplete : nextWave}
              className="mt-5 w-full py-3.5 rounded-2xl font-['Space_Grotesk'] font-bold text-base active:scale-[0.97] transition-all"
              style={{
                background: 'linear-gradient(180deg, #00f1fe 0%, #006a70 100%)',
                boxShadow: '0 8px 24px rgba(0, 241, 254, 0.25), inset 0 2px 4px rgba(255,255,255,0.3)',
                color: '#005f64'
              }}
            >
              {isOvertime ? '查看最终报告' : (wave >= 3 ? '查看最终报告' : '下一波次 →')}
            </button>
          </div>
        </div>
      )}

      {/* ===== Level Complete Modal (Diagnosis Report) ===== */}
      {showLevelCompleteModal && finalStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto" data-testid="level-complete-modal">
          <div className="bg-gradient-to-br from-[#0f1930]/98 to-[#080d1e]/98 backdrop-blur-xl rounded-3xl p-7 max-w-md w-full shadow-2xl border border-[#99f7ff]/15 my-auto">
            <div className="text-center mb-5">
              <div className="text-5xl mb-2">
                {finalStats.stars === 3 ? '🏆' : finalStats.stars === 2 ? '⭐' : '✅'}
              </div>
              <h2 className="text-2xl font-['Space_Grotesk'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#99f7ff] to-[#af88ff] mb-1">
                {finalStats.enteredOvertime ? '修复通关！' : '关卡完成'}
              </h2>
              <p className="text-xs text-[#a3aac4]">DAY {currentLevel}/7 · {currentLevelConfig?.title}</p>
            </div>

            {renderStarRow(finalStats.stars, 'w-11 h-11')}

            <div className="mt-5 space-y-1">
              {renderStatBar('总用时', `${finalStats.totalTime} 秒`, '#00f1fe')}
              {renderStatBar('正确率', `${finalStats.accuracy}%`, '#4ade80')}
              {renderStatBar('失误次数', `${finalStats.totalMistakes} 次`, finalStats.totalMistakes === 0 ? '#4ade80' : '#f87171')}
              {renderStatBar('完美波次', `${finalStats.zeroErrorWaves}/3`, '#facc15')}
            </div>

            <div className="mt-4 w-full h-2 bg-[#0f1930] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${finalStats.accuracy}%`,
                  background: `linear-gradient(90deg, ${finalStats.accuracy >= 80 ? '#4ade80' : finalStats.accuracy >= 50 ? '#facc15' : '#f87171'} 0%, ${finalStats.accuracy >= 80 ? '#22c55e' : finalStats.accuracy >= 50 ? '#eab308' : '#ef4444'} 100%)`
                }}
              />
            </div>

            {renderDiagnosisReport()}

            <div className="mt-5 space-y-2.5">
              <button
                onClick={nextLevel}
                className="w-full py-3.5 rounded-2xl font-['Space_Grotesk'] font-bold text-sm active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(180deg, #6001d1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 28px rgba(139, 92, 246, 0.35), inset 0 2px 4px rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              >
                {currentLevel < levelConfigs.length ? '下一关 →' : '返回地图 🗺️'}
              </button>

              {getUniqueMistakes().length > 0 && (
                <button
                  onClick={handleReviewWeak}
                  className="w-full py-3 rounded-2xl font-['Space_Grotesk'] font-semibold text-sm active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171'
                  }}
                >
                  <BookIcon className="w-4 h-4" />
                  回看薄弱元素 ({getUniqueMistakes().length})
                </button>
              )}

              <button
                onClick={handleDailyReview}
                className="w-full py-2.5 rounded-2xl font-['Space_Grotesk'] font-medium text-xs active:scale-[0.97] transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(153,247,255,0.2)',
                  color: '#a3aac4'
                }}
              >
                进入今日复习 (基于全局错题)
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f1930]/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl border border-[#99f7ff]/20">
            <h2 className="text-2xl font-bold text-[#99f7ff] mb-4 font-['Space_Grotesk']">玩法说明</h2>
            <ul className="text-[#a3aac4] mb-6 space-y-2 text-sm">
              <li>• 点击两张卡片进行配对</li>
              <li>• 每关需要完成3个波次</li>
              <li>• 在规定时间内完成所有配对即可通关</li>
              <li>• Level 5+ 需要匹配符号/名称与数值</li>
              <li>• ⭐ 一星保底 · 零错误二星 · 零错+快速三星</li>
            </ul>
            <button onClick={() => setShowInstructions(false)} className="w-full py-3 bg-[#99f7ff] text-[#060e20] rounded-full font-bold hover:bg-[#00f1fe] transition-colors">
              我知道了
            </button>
          </div>
        </div>
      )}

      {gameOver && time === 0 && !showSuccessModal && !showLevelCompleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f1930]/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-xl border border-[#99f7ff]/20">
            <h2 className="text-2xl font-bold text-[#ff716c] mb-4 font-['Space_Grotesk']">时间到！</h2>
            <p className="text-[#a3aac4] mb-6">最终得分: {score}</p>
            <button onClick={replayLevel} className="w-full py-3 bg-[#99f7ff] text-[#060e20] rounded-full font-bold hover:bg-[#00f1fe] transition-colors">
              重新开始
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchGame;
