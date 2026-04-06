import { useState, useRef, useCallback } from 'react';
import elementData, { getDisplayAtomicMass } from '../data/elementData';
import recipes from '../data/recipes';
import {
  ScienceIcon,
  BiotechIcon,
  TerminalIcon,
  BoltIcon,
  CheckCircleIcon,
  AddIcon,
  MapIcon,
  CloseIcon,
  DeleteIcon,
  BookIcon
} from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';
import useTutorial from '../hooks/useTutorial';

const MISTAKE_KEY = 'globalMistakeDetails';

const BLUEPRINT_HINTS = {
  water: { hint: '这个维持生命运转的极性溶剂，可能需要哪些元素？', clue: '提示：它是 1 号和 8 号元素的结合' },
  co2: { hint: '植物呼吸离不开它，干冰是它的固态形态。', clue: '提示：一个 6 号元素需要两个 8 号元素伙伴' },
  nacl: { hint: '海洋的结晶，厨房里最熟悉的白色颗粒。', clue: '提示：11 号碱金属 + 17 号卤素 = 1:1' },
  hcl: { hint: '胃酸的主要成分，工业上用来除锈的强酸。', clue: '提示：最轻的元素 + 最常见的卤素' },
  mgo: { hint: '耀眼白光爆燃后留下的纯白粉末，极其耐高温。', clue: '提示：12 号元素 + 氧气 = 1:1' },
  al2o3: { hint: '红宝石与蓝宝石的真身，硬度极高的致密装甲。', clue: '提示：13 号元素需要 3 个氧原子来稳定' },
  sio2: { hint: '沙子和天然水晶的灵魂，半导体帝国的基石。', clue: '提示：14 号元素 + 双倍氧气' },
  p2o5: { hint: '红磷燃烧产生的浓郁白烟，极度嗜水。', clue: '提示：两个 15 号元素 + 五个氧原子' },
  so2: { hint: '火山喷发时的刺鼻气体，葡萄酒防腐的秘密武器。', clue: '提示：16 号元素 + 双倍氧气' },
  kcl: { hint: '植物生长的能量补给，健康低钠盐的替代品。', clue: '提示：19 号元素 + 17 号卤素 = 1:1' },
  cao: { hint: '洁白狂躁的石块，自热火锅发热包的核心秘密。', clue: '提示：20 号元素 + 氧气 = 1:1' },
  caco3: { hint: '坚硬珊瑚与大理石的骨架，补钙含片的主要成分。', clue: '提示：20 号 + 6 号 + 三个 8 号元素的地质奇迹' }
};

const StarIcon = ({ filled, className, size = 'w-4 h-4' }) => (
  <svg className={`${className} ${size}`} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const LightbulbIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0012 4a5 5 0 00-5 5c0 .92.26 1.78.72 2.52" />
    <path d="M12 2v1" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const SynthesisLab = ({ onComplete, onBack, onReviewElements }) => {
  const [reactor, setReactor] = useState([]);
  const [matchedRecipe, setMatchedRecipe] = useState(null);
  const [unlockedCompounds, setUnlockedCompounds] = useLocalStorage('synthesizedMolecules', []);
  const [showMoleculeCard, setShowMoleculeCard] = useState(false);
  const [currentMolecule, setCurrentMolecule] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [viewingArchive, setViewingArchive] = useState(null);
  const [hasSeenLabTutorial, completeLabTutorial] = useTutorial('synthesis_lab');
  const [showLog, setShowLog] = useState(false);
  const [blueprintRecipe, setBlueprintRecipe] = useState(null);
  const [synthesisLog, setSynthesisLog] = useState([
    { time: '14:22', color: 'text-[#99f7ff]', message: '实验室初始化完成' },
    { time: '14:23', color: 'text-[#99f7ff]', message: '等待元素注入...' }
  ]);
  const [flyingElement, setFlyingElement] = useState(null);
  const reactorRef = useRef(null);

  const addLog = (message, color = 'text-[#99f7ff]') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setSynthesisLog(prev => [...prev.slice(-15), { time, color, message }]);
  };

  const checkRecipe = (elements) => {
    if (elements.length === 0) {
      setMatchedRecipe(null);
      return;
    }

    const elementCounts = {};
    elements.forEach(el => {
      elementCounts[el.symbol] = (elementCounts[el.symbol] || 0) + 1;
    });

    for (const recipe of recipes) {
      const recipeCounts = {};
      Object.entries(recipe.required).forEach(([symbol, count]) => {
        recipeCounts[symbol] = count;
      });

      const allKeys = new Set([...Object.keys(elementCounts), ...Object.keys(recipeCounts)]);
      let isMatch = true;

      for (const key of allKeys) {
        if (elementCounts[key] !== recipeCounts[key]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        setMatchedRecipe(recipe);
        addLog(`检测到配方: ${recipe.formula}`, 'text-[#00f1fe]');
        return;
      }
    }

    setMatchedRecipe(null);
  };

  const handleElementClick = (element, event) => {
    completeLabTutorial();
    if (reactor.length >= 10) {
      addLog('反应炉已满', 'text-[#ff716c]');
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const reactorRect = reactorRef.current?.getBoundingClientRect();

    if (reactorRect) {
      setFlyingElement({
        symbol: element.symbol,
        name: element.name,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        endX: reactorRect.left + reactorRect.width / 2,
        endY: reactorRect.top + reactorRect.height / 2
      });

      setTimeout(() => {
        const newReactor = [...reactor, { ...element, uid: Date.now() }];
        setReactor(newReactor);
        checkRecipe(newReactor);
        addLog(`注入: ${element.symbol}`, 'text-[#99f7ff]');
        setFlyingElement(null);
      }, 400);
    }
  };

  const handleRemoveElement = (uid, symbol) => {
    const newReactor = reactor.filter(el => el.uid !== uid);
    setReactor(newReactor);
    checkRecipe(newReactor);
    addLog(`移除: ${symbol}`, 'text-[#a3aac4]');
  };

  const handleClearReactor = () => {
    setReactor([]);
    setMatchedRecipe(null);
    addLog('反应炉已清空', 'text-[#a3aac4]');
  };

  const boostMemoryForElements = (requiredMap) => {
    try {
      const raw = localStorage.getItem(MISTAKE_KEY);
      let mistakes = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(mistakes)) mistakes = [];

      const symbolsToRemove = Object.keys(requiredMap);
      const beforeCount = mistakes.length;
      mistakes = mistakes.filter(m => !symbolsToRemove.includes(m.elementSymbol));

      if (mistakes.length < beforeCount) {
        localStorage.setItem(MISTAKE_KEY, JSON.stringify(mistakes));
        window.dispatchEvent(new StorageEvent('storage', { key: MISTAKE_KEY }));
        addLog(`记忆强化: ${symbolsToRemove.join('+')} 熟练度提升`, 'text-emerald-400');
      }
    } catch (_) {}
  };

  const handleSynthesize = () => {
    if (!matchedRecipe) {
      setShowError(true);
      addLog('合成失败：配方不匹配', 'text-[#ff716c]');
      setTimeout(() => setShowError(false), 1000);
      return;
    }

    setIsSynthesizing(true);
    addLog('开始合成...', 'text-[#af88ff]');

    setTimeout(() => {
      setIsSynthesizing(false);
      setCurrentMolecule(matchedRecipe);
      setShowMoleculeCard(true);

      boostMemoryForElements(matchedRecipe.required);

      if (!unlockedCompounds.find(m => m.id === matchedRecipe.id)) {
        setUnlockedCompounds(prev => [...prev, matchedRecipe]);
        addLog(`🎉 解锁: ${matchedRecipe.formula}`, 'text-[#00f1fe]');
      } else {
        addLog(`合成成功: ${matchedRecipe.formula}`, 'text-[#00f1fe]');
      }

      setReactor([]);
      setMatchedRecipe(null);
    }, 1200);
  };

  const handleCloseMoleculeCard = () => {
    setShowMoleculeCard(false);
    setCurrentMolecule(null);
  };

  const handleReviewTheseElements = () => {
    if (!currentMolecule || !onReviewElements) return;
    const elementIds = Object.keys(currentMolecule.required)
      .map(symbol => {
        const el = elementData.find(e => e.symbol === symbol);
        return el ? el.id : null;
      })
      .filter(Boolean);

    handleCloseMoleculeCard();
    onReviewElements(elementIds);
  };

  const getElementColor = (symbol) => {
    const colors = {
      H: 'from-cyan-300 to-blue-400',
      He: 'from-purple-300 to-pink-400',
      Li: 'from-red-400 to-orange-500',
      Be: 'from-green-300 to-emerald-500',
      B: 'from-yellow-300 to-amber-500',
      C: 'from-gray-400 to-gray-600',
      N: 'from-blue-300 to-indigo-500',
      O: 'from-red-300 to-rose-500',
      F: 'from-green-300 to-lime-500',
      Ne: 'from-orange-300 to-red-500',
      Na: 'from-violet-300 to-purple-500',
      Mg: 'from-green-400 to-teal-500',
      Al: 'from-slate-300 to-gray-400',
      Si: 'from-amber-300 to-orange-500',
      P: 'from-orange-300 to-red-500',
      S: 'from-yellow-300 to-amber-400',
      Cl: 'from-green-300 to-emerald-500',
      Ar: 'from-cyan-300 to-teal-500',
      K: 'from-violet-300 to-purple-500',
      Ca: 'from-orange-200 to-amber-400'
    };
    return colors[symbol] || 'from-gray-300 to-gray-500';
  };

  const getStability = () => {
    if (reactor.length === 0) return '100%';
    if (matchedRecipe) return '100%';
    return `${Math.max(60, 100 - reactor.length * 5)}%`;
  };

  const getPressure = () => {
    return `${(reactor.length * 0.3 + 1).toFixed(1)} ATM`;
  };

  const getTemp = () => {
    return `${Math.round(273 + reactor.length * 15)} K`;
  };

  const renderMiniElementCard = (symbol, count) => {
    const el = elementData.find(e => e.symbol === symbol);
    if (!el) return null;

    return (
      <div key={symbol} className="flex flex-col items-center gap-1 min-w-0">
        <div className={`w-16 h-20 rounded-xl bg-gradient-to-br ${getElementColor(symbol)} flex flex-col items-center justify-center shadow-lg relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/[0.08]"></div>
          <span className="relative z-10 text-white font-['Space_Grotesk'] text-xl font-bold drop-shadow-sm">{symbol}</span>
          <span className="relative z-10 text-white/80 text-[9px] font-medium">{el.name}</span>
          {count > 1 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-400 border-2 border-[#0f1930] flex items-center justify-center">
              <span className="text-[9px] font-black text-[#060e20]">×{count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[8px] font-['Space_Grotesk'] text-[#4d556b]">#{el.atomicNumber}</span>
          <span className="text-[8px] font-['Space_Grotesk'] text-[#af88ff] font-bold">{el.valence > 0 ? `+${el.valence}` : el.valence}</span>
        </div>
      </div>
    );
  };

  const renderReactor = (isMobile = false) => {
    const size = isMobile ? 'w-[300px] h-[300px]' : 'w-[320px] h-[320px]';
    const insetOuter = isMobile ? '-inset-5' : '-inset-4';
    const insetInner = isMobile ? '-inset-10' : '-inset-8';

    return (
      <div ref={reactorRef} className={`relative ${size}`}>
        <div
          className={`absolute inset-0 rounded-full border-2 backdrop-blur-md overflow-hidden flex items-center justify-center transition-all duration-500 ${
            showError ? 'border-[#ff716c]/50 bg-[#ff716c]/10 animate-shake' :
            matchedRecipe ? 'border-[#00f1fe]/50 bg-[#00f1fe]/10' :
            'border-[#99f7ff]/30 bg-[#060e20]/90'
          }`}
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(153, 247, 255, 0.3) 0%, rgba(6, 14, 32, 0.95) 75%)',
            boxShadow: showError ? '0 0 60px rgba(255, 113, 108, 0.3)' :
              matchedRecipe ? '0 0 60px rgba(0, 241, 254, 0.4)' :
              '0 0 60px rgba(153, 247, 255, 0.25)'
          }}
        >
          {isSynthesizing && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-24 h-24 bg-white rounded-full animate-ping"></div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center">
            {reactor.length === 0 ? (
              <div className="flex flex-col items-center">
                <div className={`rounded-full border-2 border-dashed border-[#99f7ff]/50 bg-[#99f7ff]/10 flex items-center justify-center mb-3 ${isMobile ? 'w-16 h-16' : 'w-14 h-14'}`}>
                  <AddIcon className={`text-[#99f7ff] animate-pulse ${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} />
                </div>
                <p className="font-['Space_Grotesk'] text-[#99f7ff] font-bold tracking-widest uppercase" style={{ fontSize: isMobile ? '12px' : '10px' }}>
                  注入元素
                </p>
              </div>
            ) : (
              <div className={`flex flex-wrap gap-2 justify-center items-center p-3 ${isMobile ? 'max-w-48' : 'max-w-40'}`}>
                {reactor.map((el, index) => (
                  <div
                    key={el.uid}
                    onClick={() => handleRemoveElement(el.uid, el.symbol)}
                    className={`rounded-lg bg-gradient-to-br ${getElementColor(el.symbol)} flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform ${isMobile ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm'}`}
                    style={{ animation: `bounce-in 0.3s ease-out ${index * 0.05}s both` }}
                  >
                    {el.symbol}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={`absolute ${insetOuter} border border-[#99f7ff]/20 rounded-full rotate-45 pointer-events-none`}></div>
        <div className={`absolute ${insetInner} border border-[#af88ff]/20 rounded-full -rotate-12 pointer-events-none`}></div>
      </div>
    );
  };

  const renderStatusDisplay = (isMobile = false) => (
    <div className={`mt-4 bg-[rgba(15,25,48,0.6)] backdrop-blur-[20px] border border-[#99f7ff]/15 rounded-full flex gap-4 text-center ${isMobile ? 'px-5 py-2.5 gap-6' : 'px-4 py-2'}`}>
      <div>
        <p className="text-[#a3aac4] uppercase" style={{ fontSize: isMobile ? '9px' : '8px' }}>稳定性</p>
        <p className={`font-['Space_Grotesk'] text-[#99f7ff] ${isMobile ? 'text-base' : 'text-sm'}`}>{getStability()}</p>
      </div>
      <div className="w-px bg-[#40485d]/20"></div>
      <div>
        <p className="text-[#a3aac4] uppercase" style={{ fontSize: isMobile ? '9px' : '8px' }}>压力</p>
        <p className={`font-['Space_Grotesk'] text-[#af88ff] ${isMobile ? 'text-base' : 'text-sm'}`}>{getPressure()}</p>
      </div>
      <div className="w-px bg-[#40485d]/20"></div>
      <div>
        <p className="text-[#a3aac4] uppercase" style={{ fontSize: isMobile ? '9px' : '8px' }}>温度</p>
        <p className={`font-['Space_Grotesk'] text-[#f271b5] ${isMobile ? 'text-base' : 'text-sm'}`}>{getTemp()}</p>
      </div>
    </div>
  );

  const renderArchiveContent = () => (
    <div className="flex flex-col gap-2">
      {recipes.map(recipe => {
        const isUnlocked = unlockedCompounds.find(m => m.id === recipe.id);
        const bpHint = BLUEPRINT_HINTS[recipe.id];
        return (
          <div key={recipe.id} className="relative">
            <div
              onClick={() => isUnlocked ? setViewingArchive(recipe) : (bpHint && setBlueprintRecipe(recipe.id === blueprintRecipe ? null : recipe.id))}
              data-testid={`archive-item-${recipe.id}`}
              className={`p-3 rounded-lg flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                isUnlocked
                  ? 'bg-[#091328] border border-[#99f7ff]/20 hover:border-[#00f1fe]/40 hover:bg-[#0a162e]'
                  : blueprintRecipe === recipe.id
                    ? 'bg-[#af88ff]/8 border border-[#af88ff]/30'
                    : 'bg-[#091328]/50 border border-dashed border-[#40485d]/20 hover:border-[#af88ff]/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                isUnlocked
                  ? 'bg-[#192540] border-[#99f7ff]/40'
                  : 'bg-[#0f1930] border-[#40485d]/30'
              }`}>
                <span className={`font-['Space_Grotesk'] text-sm font-bold ${
                  isUnlocked ? 'text-[#99f7ff]' : 'text-[#4d556b]'
                }`}>
                  {isUnlocked ? recipe.formula.substring(0, 3) : '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-['Space_Grotesk'] text-xs font-bold truncate ${
                  isUnlocked ? 'text-[#99f7ff]' : 'text-[#4d556b]'
                }`}>
                  {isUnlocked ? recipe.formula : '???'}
                </p>
                <p className="text-[9px] text-[#a3aac4] uppercase">
                  {isUnlocked ? recipe.name : '未解锁'}
                </p>
              </div>
              {isUnlocked && <CheckCircleIcon className="text-[#99f7ff] w-4 h-4 flex-shrink-0" />}
              {!isUnlocked && bpHint && (
                <LightbulbIcon className={`w-4 h-4 flex-shrink-0 transition-colors ${blueprintRecipe === recipe.id ? 'text-[#af88ff]' : 'text-[#4d556b]'}`} />
              )}
            </div>

            {/* Blueprint Hint Bubble */}
            {!isUnlocked && blueprintRecipe === recipe.id && bpHint && (
              <div className="ml-4 mt-1 p-3 rounded-xl bg-gradient-to-r from-[#af88ff]/10 to-transparent border-l-2 border-[#af88ff]/50 animate-fade-in"
                style={{ animation: 'fade-in 0.2s ease-out' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">💡</span>
                  <div>
                    <p className="text-[11px] font-['Space_Grotesk'] font-bold text-[#dee5ff] leading-relaxed">
                      [蓝图碎片] {bpHint.hint}
                    </p>
                    <p className="text-[10px] text-[#af88ff]/70 mt-1 italic">
                      {bpHint.clue}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderLogContent = () => (
    <div className="space-y-2 text-[10px]">
      {synthesisLog.map((log, i) => (
        <div key={i} className="flex gap-1.5">
          <span className={`${log.color} font-bold flex-shrink-0`}>[{log.time}]</span>
          <p className="text-[#a3aac4]">{log.message}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060e20] font-['Manrope',sans-serif] text-[#dee5ff] overflow-hidden relative">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <div onClick={onBack} className="p-2 rounded-lg cursor-pointer text-[#99f7ff] hover:bg-[#99f7ff]/10 transition-all active:scale-95">
              <MapIcon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="font-['Space_Grotesk'] tracking-wider uppercase text-xs text-[#99f7ff]">
              DAY 7: 分子实验室
            </h1>
            <span className="text-[10px] text-[#99f7ff]/60">
              已解锁: {unlockedCompounds.length}/{recipes.length}
            </span>
          </div>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setShowArchive(true)}
            className="p-2.5 rounded-xl bg-[#af88ff]/10 border border-[#af88ff]/30 text-[#af88ff] hover:bg-[#af88ff]/20 transition-all"
          >
            <BookIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowLog(true)}
            className="p-2.5 rounded-xl bg-[#99f7ff]/10 border border-[#99f7ff]/30 text-[#99f7ff] hover:bg-[#99f7ff]/20 transition-all"
          >
            <TerminalIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden lg:block font-['Space_Grotesk'] font-bold text-[#99f7ff] text-lg">
          SYNTHESIS LAB
        </div>
      </header>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-[#af88ff]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#99f7ff]/5 rounded-full blur-[150px]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-20 pb-48 lg:pb-32 px-4 lg:px-8 min-h-screen overflow-y-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-8 h-full">
          <section className="col-span-3">
            <div className="bg-[rgba(15,25,48,0.6)] backdrop-blur-[20px] border border-[#99f7ff]/15 rounded-lg p-4 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="flex items-center gap-2 mb-4">
                <BiotechIcon className="text-[#af88ff] w-5 h-5" />
                <h2 className="font-['Space_Grotesk'] text-sm font-bold uppercase">物质档案</h2>
              </div>
              {renderArchiveContent()}
            </div>
          </section>

          <section className="col-span-6 flex flex-col items-center justify-start pt-8">
            <div ref={reactorRef}>
              {renderReactor(false)}
            </div>
            {renderStatusDisplay(false)}

            <div className="mt-6">
              <button
                onClick={handleSynthesize}
                disabled={!matchedRecipe}
                data-testid="synthesize-btn"
                className={`relative group transition-all ${matchedRecipe ? 'animate-energy-pulse' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className={`px-10 py-4 rounded-full font-['Space_Grotesk'] font-bold text-base uppercase tracking-widest transition-all duration-300 group-active:scale-95 flex items-center gap-2 ${
                  matchedRecipe
                    ? 'bg-gradient-to-r from-[#6001d1] to-[#8b5cf6] text-white border-t border-white/30 shadow-[inset_0_4px_8px_rgba(255,255,255,0.2),0_10px_30px_rgba(96,1,209,0.4)]'
                    : 'bg-[#141f38] text-[#4d556b]'
                }`}>
                  <BoltIcon className={`w-5 h-5 ${matchedRecipe ? 'text-[#00f1fe] drop-shadow-[0_0_8px_rgba(0,241,254,1)]' : ''}`} />
                  能量合成
                </div>
                {matchedRecipe && (
                  <div className="absolute inset-0 bg-[#99f7ff] rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                )}
              </button>
            </div>

            {reactor.length > 0 && (
              <button onClick={handleClearReactor} className="mt-3 flex items-center gap-1.5 text-[#a3aac4] hover:text-[#ff716c] text-xs transition-colors">
                <DeleteIcon className="w-4 h-4" />
                <span>清空反应炉</span>
              </button>
            )}
          </section>

          <section className="col-span-3">
            <div className="bg-[rgba(15,25,48,0.6)] backdrop-blur-[20px] border border-[#99f7ff]/15 rounded-lg p-4 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <h2 className="font-['Space_Grotesk'] text-sm font-bold uppercase flex items-center gap-2 mb-4">
                <TerminalIcon className="text-[#99f7ff] w-4 h-4" />
                合成日志
              </h2>
              {renderLogContent()}
            </div>
          </section>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col items-center justify-start pt-8">
          {renderReactor(true)}
          {renderStatusDisplay(true)}

          <div className="mt-6">
            <button
              onClick={handleSynthesize}
              disabled={!matchedRecipe}
              className={`relative group transition-all ${matchedRecipe ? 'animate-energy-pulse' : 'opacity-50 cursor-not-allowed'}`}
            >
              <div className={`px-8 py-3 rounded-full font-['Space_Grotesk'] font-bold text-sm uppercase tracking-widest transition-all duration-300 group-active:scale-95 flex items-center gap-2 ${
                matchedRecipe
                  ? 'bg-gradient-to-r from-[#6001d1] to-[#8b5cf6] text-white border-t border-white/30 shadow-[inset_0_4px_8px_rgba(255,255,255,0.2),0_10px_30px_rgba(96,1,209,0.4)]'
                  : 'bg-[#141f38] text-[#4d556b]'
              }`}>
                <BoltIcon className={`w-4 h-4 ${matchedRecipe ? 'text-[#00f1fe] drop-shadow-[0_0_8px_rgba(0,241,254,1)]' : ''}`} />
                能量合成
              </div>
              {matchedRecipe && (
                <div className="absolute inset-0 bg-[#99f7ff] rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              )}
            </button>
          </div>

          {reactor.length > 0 && (
            <button onClick={handleClearReactor} className="mt-4 flex items-center gap-1.5 text-[#a3aac4] hover:text-[#ff716c] text-sm transition-colors">
              <DeleteIcon className="w-4 h-4" />
              <span>清空反应炉</span>
            </button>
          )}
        </div>
      </main>

      {/* Element Drawer */}
      <div className="fixed bottom-20 left-0 right-0 z-[60]">
        {!hasSeenLabTutorial && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-[70] animate-bounce-slow pointer-events-none">
            <div className="relative flex flex-col items-center">
              <span className="text-lg mb-1" style={{ textShadow: '0 0 10px rgba(0,241,254,0.5)' }}>⬆️</span>
              <div className="px-4 py-2 rounded-xl border border-[#00f1fe]/30 shadow-[0_0_20px_rgba(0,241,254,0.2)] whitespace-nowrap" style={{ background: 'linear-gradient(135deg, rgba(0,241,254,0.12) 0%, rgba(6,14,32,0.95) 100%)', backdropFilter: 'blur(12px)' }}>
                <p className="text-xs font-['Space_Grotesk'] text-[#00f1fe] font-bold">
                  🔬 滑动抽取元素，点击放入反应炉合成！
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="w-full bg-white/5 backdrop-blur-md border-t border-[#99f7ff]/10">
          <div className="max-w-screen-xl mx-auto px-2 py-3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#060e20] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#060e20] to-transparent z-10 pointer-events-none"></div>

            <div className="flex items-center gap-3 overflow-x-auto px-4 py-1" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#99f7ff #1a2744',
              WebkitOverflowScrolling: 'touch'
            }}>
              {elementData.slice(0, 20).map(element => (
                <div
                  key={element.id}
                  data-testid={`element-${element.symbol}`}
                  onClick={(e) => handleElementClick(element, e)}
                  className="flex-shrink-0 w-14 h-18 rounded-xl bg-gradient-to-br from-[#192540] to-[#0f1930] border border-[#99f7ff]/20 flex flex-col items-center justify-center cursor-pointer hover:scale-110 hover:border-[#99f7ff]/50 hover:shadow-[0_0_20px_rgba(153,247,255,0.3)] transition-all group"
                >
                  <span className="text-[#99f7ff] font-['Space_Grotesk'] text-lg font-bold group-hover:drop-shadow-[0_0_8px_rgba(153,247,255,0.8)]">
                    {element.symbol}
                  </span>
                  <span className="text-[6px] text-[#a3aac4] font-bold uppercase mt-0.5">
                    {element.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Archive Drawer */}
      {showArchive && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowArchive(false); setBlueprintRecipe(null); }}></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#060e20]/95 backdrop-blur-xl border-r border-[#99f7ff]/15 p-4 overflow-y-auto animate-slide-in-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookIcon className="text-[#af88ff] w-5 h-5" />
                <h2 className="font-['Space_Grotesk'] text-sm font-bold uppercase">物质档案</h2>
              </div>
              <button onClick={() => { setShowArchive(false); setBlueprintRecipe(null); }} className="p-2 rounded-lg text-[#a3aac4] hover:text-white hover:bg-white/10 transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {renderArchiveContent()}
          </div>
        </div>
      )}

      {/* Mobile Log Drawer */}
      {showLog && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLog(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#060e20]/95 backdrop-blur-xl border-l border-[#99f7ff]/15 p-4 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Space_Grotesk'] text-sm font-bold uppercase flex items-center gap-2">
                <TerminalIcon className="text-[#99f7ff] w-4 h-4" />
                合成日志
              </h2>
              <button onClick={() => setShowLog(false)} className="p-2 rounded-lg text-[#a3aac4] hover:text-white hover:bg-white/10 transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {renderLogContent()}
          </div>
        </div>
      )}

      {/* Flying Element Animation */}
      {flyingElement && (
        <div
          className="fixed w-12 h-12 rounded-xl bg-gradient-to-br from-[#99f7ff] to-[#00f1fe] flex items-center justify-center text-[#060e20] font-bold text-lg shadow-lg z-[60] pointer-events-none"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${flyingElement.startX - 24}px, ${flyingElement.startY - 24}px)`,
            animation: `flyToReactor 0.4s ease-out forwards`
          }}
        >
          {flyingElement.symbol}
        </div>
      )}

      {/* ===== EPIC SUCCESS MODAL with Memory Recall Panel ===== */}
      {showMoleculeCard && currentMolecule && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="bg-gradient-to-br from-[#0c162e]/98 to-[#080d1e]/98 backdrop-blur-xl rounded-3xl max-w-sm w-full shadow-2xl border border-[#99f7ff]/20 my-auto"
            style={{ animation: 'epic-scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >

            {/* ===== UPPER: Molecule Showcase ===== */}
            <div className="pt-6 px-6 pb-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#00f1fe]/8 to-transparent pointer-events-none"></div>

              <div className="text-5xl mb-2 relative z-10">🧪</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-2">
                <StarIcon filled size="w-3 h-3" className="text-emerald-400" />
                <span className="text-[10px] font-['Space_Grotesk'] font-bold text-emerald-400 uppercase tracking-wider">合成成功</span>
              </div>

              <div className="text-4xl font-['Space_Grotesk'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fe] via-[#99f7ff] to-[#af88ff] my-2">
                {currentMolecule.formula}
              </div>
              <h3 className="text-lg font-bold text-[#dee5ff]">{currentMolecule.name}</h3>
              <p className="text-xs text-[#a3aac4] mt-2 leading-relaxed">{currentMolecule.desc}</p>

              <div className="mt-3 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                <h4 className="text-[10px] font-['Space_Grotesk'] text-[#4d556b] uppercase tracking-wider mb-1.5">用途</h4>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {currentMolecule.use.map((u, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#af88ff]/8 border border-[#af88ff]/15 rounded-md text-[10px] text-[#dee5ff]">
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== DIVIDER ===== */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#99f7ff]/20 to-transparent"></div>

            {/* ===== LOWER: Memory Recall Panel ===== */}
            <div className="px-6 pb-5 pt-4" style={{
              background: 'linear-gradient(to top, rgba(96,1,209,0.06) 0%, transparent 100%)'
            }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-5 h-px bg-[#6001d1]/50"></div>
                <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#af88ff] uppercase tracking-widest">核心元素解析</span>
                <div className="w-5 h-px bg-[#6001d1]/50"></div>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                {Object.entries(currentMolecule.required).map(([symbol, count]) =>
                  renderMiniElementCard(symbol, count)
                )}
              </div>

              <div className="text-center mb-4">
                <p className="text-[9px] text-[#4d556b]">
                  本次合成的元素已自动提升熟练度，错题标记已清除
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleCloseMoleculeCard}
                  className="w-full py-3 rounded-2xl font-['Space_Grotesk'] font-bold text-sm active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(180deg, #6001d1 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 28px rgba(139, 92, 246, 0.35), inset 0 2px 4px rgba(255,255,255,0.2)',
                    color: 'white'
                  }}
                >
                  继续实验 Continue Research
                </button>

                {onReviewElements && (
                  <button
                    onClick={handleReviewTheseElements}
                    className="w-full py-2.5 rounded-2xl font-['Space_Grotesk'] font-semibold text-xs active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 241, 254, 0.1) 0%, rgba(175, 136, 255, 0.08) 100%)',
                      border: '1px solid rgba(0, 241, 254, 0.25)',
                      color: '#00f1fe'
                    }}
                  >
                    <BookIcon className="w-4 h-4" />
                    专项巩固这些元素 Review Elements
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===== ARCHIVE DETAIL MODAL (复用史诗级弹窗布局) ===== */}
      {viewingArchive && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto" data-testid="archive-detail-modal">
          <div
            className="bg-gradient-to-br from-[#0c162e]/98 to-[#080d1e]/98 backdrop-blur-xl rounded-3xl max-w-sm w-full shadow-2xl border border-[#af88ff]/20 my-auto"
            style={{ animation: 'epic-scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* ===== UPPER: Molecule Showcase ===== */}
            <div className="pt-6 px-6 pb-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#af88ff]/8 to-transparent pointer-events-none"></div>

              <div className="text-5xl mb-2 relative z-10">🔬</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 mb-2">
                <BookIcon className="text-purple-400 w-3 h-3" />
                <span className="text-[10px] font-['Space_Grotesk'] font-bold text-purple-400 uppercase tracking-wider">物质档案 Archive</span>
              </div>

              <div className="text-4xl font-['Space_Grotesk'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#af88ff] via-[#99f7ff] to-[#00f1fe] my-2">
                {viewingArchive.formula}
              </div>
              <h3 className="text-lg font-bold text-[#dee5ff]">{viewingArchive.name}</h3>
              <p className="text-xs text-[#a3aac4] mt-2 leading-relaxed">{viewingArchive.desc}</p>

              <div className="mt-3 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                <h4 className="text-[10px] font-['Space_Grotesk'] text-[#4d556b] uppercase tracking-wider mb-1.5">用途</h4>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {viewingArchive.use.map((u, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#af88ff]/8 border border-[#af88ff]/15 rounded-md text-[10px] text-[#dee5ff]">
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== DIVIDER ===== */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#af88ff]/20 to-transparent"></div>

            {/* ===== LOWER: Core Element Analysis ===== */}
            <div className="px-6 pb-5 pt-4" style={{
              background: 'linear-gradient(to top, rgba(175,136,255,0.06) 0%, transparent 100%)'
            }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-5 h-px bg-[#af88ff]/50"></div>
                <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#af88ff] uppercase tracking-widest">核心元素解析</span>
                <div className="w-5 h-px bg-[#af88ff]/50"></div>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                {Object.entries(viewingArchive.required).map(([symbol, count]) =>
                  renderMiniElementCard(symbol, count)
                )}
              </div>

              <button
                onClick={() => setViewingArchive(null)}
                data-testid="archive-close-btn"
                className="w-full py-3 rounded-2xl font-['Space_Grotesk'] font-bold text-sm active:scale-[0.97] transition-all"
                style={{
                  background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.3)',
                  color: '#94a3b8',
                  border: '1px solid rgba(148,163,184,0.15)'
                }}
              >
                关闭 Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flyToReactor {
          0% {
            transform: translate(${flyingElement?.startX - 24 || 0}px, ${flyingElement?.startY - 24 || 0}px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(${flyingElement?.endX - 24 || 0}px, ${flyingElement?.endY - 24 || 0}px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes epic-scale-in {
          0% { transform: scale(0.7) translateY(20px); opacity: 0; }
          60% { transform: scale(1.02) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes energy-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); box-shadow: 0 0 20px rgba(175, 136, 255, 0.4); }
          50% { transform: scale(1.05); filter: brightness(1.3); box-shadow: 0 0 50px rgba(175, 136, 255, 0.8), 0 0 20px rgba(0, 241, 254, 0.5); }
        }
        @keyframes slide-in-left {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-energy-pulse { animation: energy-pulse 1.5s infinite ease-in-out; }
        .animate-slide-in-left { animation: slide-in-left 0.3s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SynthesisLab;
