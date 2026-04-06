import { useState, useEffect } from 'react';
import elementData from '../data/elementData';
import useElementDeck from '../hooks/useElementDeck';
import useTutorial from '../hooks/useTutorial';

const EMOJI_MAP = {
  H: '💧', He: '🎈', Li: '🔋', Be: '🪜', B: '🧹',
  C: '💎', N: '🌿', O: '🫁', F: '🦷', Ne: '💡',
  Na: '🧂', Mg: '🎆', Al: '✈️', Si: '🏜️', P: '🔥',
  S: '🟡', Cl: '🏊', Ar: '🌟', K: '🍌', Ca: '🐚'
};

const VISUAL_EMOJI = EMOJI_MAP;

const LEVEL_CLUES = {
  1: { label: '识其名', hintKey: 'symbol', prompt: '这个符号代表什么元素？' },
  2: { label: '知其序', hintKey: 'atomicNumber', prompt: '这是几号元素？' },
  3: { label: '晓其价', hintKey: 'valence', prompt: '哪个元素有此化合价？' },
  4: { label: '明其重', hintKey: 'atomicMass', prompt: '相对原子质量对应哪个元素？' }
};

const GlobeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 004-10z" />
  </svg>
);

const WrenchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const FlashcardRoom = ({ level, onComplete, onBack, focusElementIds }) => {
  const { draw } = useElementDeck();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [elements, setElements] = useState([]);
  const [learningResults, setLearningResults] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [hasSeenCardTutorial, completeCardTutorial] = useTutorial('flashcard_room');

  const handleSpeak = (e, el) => {
    e?.stopPropagation();
    if (!el || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeakingId(el.id);
    const massText = el.symbol === 'Cl' ? '35.5' : Math.round(el.atomicMass);
    let textToSpeak;
    if (level === 3) {
      textToSpeak = `${el.atomicNumber}号元素，${el.name}，符号${el.symbol}；化合价${el.valence}。`;
    } else if (level === 4) {
      textToSpeak = `${el.atomicNumber}号元素，${el.name}，符号${el.symbol}；相对原子质量${massText}。`;
    } else {
      textToSpeak = `${el.atomicNumber}号元素，${el.name}，符号${el.symbol}。`;
    }
    textToSpeak = textToSpeak.replace(/\+/g, '正').replace(/-/g, '负');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setTimeout(() => setSpeakingId(null), 4000);
  };

  useEffect(() => {
    let selectedElements;
    if (Array.isArray(focusElementIds) && focusElementIds.length > 0) {
      selectedElements = focusElementIds
        .map(id => elementData.find(el => el.id === id))
        .filter(Boolean);
    } else {
      const { elements: drawnElements } = draw(8);
      selectedElements = drawnElements;
    }
    setElements(selectedElements);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearningResults([]);
    setShowSummary(false);
  }, [level, draw, focusElementIds]);

  const currentElement = elements[currentIndex];
  const levelConfig = LEVEL_CLUES[level] || LEVEL_CLUES[1];

  const handleFlip = () => {
    if (!isFlipped) { setIsFlipped(true); completeCardTutorial(); }
  };

  const handleSelfEvaluate = (status) => {
    if (!currentElement) return;
    setLearningResults(prev => [...prev, { id: currentElement.id, symbol: currentElement.symbol, name: currentElement.name, status }]);
    if (currentIndex < elements.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
    } else {
      setShowSummary(true);
    }
  };

  const getDisplayValue = (el) => {
    const key = levelConfig.hintKey;
    if (key === 'atomicMass') return el.symbol === 'Cl' ? '35.5' : Math.round(el.atomicMass);
    return el[key];
  };

  const summaryStats = () => {
    const easy = learningResults.filter(r => r.status === 'easy').length;
    const hard = learningResults.filter(r => r.status === 'hard').length;
    const forgot = learningResults.filter(r => r.status === 'forgot').length;
    const total = learningResults.length || 1;
    return { easy, hard, forgot, accuracy: Math.round((easy / total) * 100) };
  };

  const handleContinueToMatch = () => onComplete(learningResults);

  if (showSummary) {
    const stats = summaryStats();
    const forgotItems = learningResults.filter(r => r.status === 'forgot');
    return (
      <div className="min-h-screen bg-[#060e20] font-['Manrope',sans-serif] text-[#dee5ff] overflow-hidden relative flex flex-col">
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#060e20]/60 backdrop-blur-xl">
          <div onClick={onBack} className="flex items-center gap-2 text-[#99f7ff] active:scale-95 transition-transform duration-200 cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-['Space_Grotesk'] tracking-wider uppercase text-xs">DAY {level}/7: 学习报告</span>
          </div>
          <div className="text-[#99f7ff] text-sm font-['Space_Grotesk']">SESSION COMPLETE</div>
        </header>

        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#af88ff]/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#00f1fe]/5 rounded-full blur-[120px]"></div>
        </div>

        <main className="relative z-10 flex-1 pt-24 pb-12 px-6 flex flex-col items-center max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-['Space_Grotesk'] font-bold text-[#99f7ff] mb-2">学习总结报告</h1>
            <p className="text-sm text-[#a3aac4]">本轮共学习 {learningResults.length} 个元素</p>
          </div>

          <div className="w-full grid grid-cols-3 gap-3 mb-8">
            <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-4 text-center">
              <div className="text-3xl font-['Space_Grotesk'] font-bold text-emerald-400">{stats.easy}</div>
              <div className="text-[10px] text-emerald-300/70 mt-1 uppercase tracking-wider">已掌握 Easy</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border border-yellow-500/30 rounded-2xl p-4 text-center">
              <div className="text-3xl font-['Space_Grotesk'] font-bold text-yellow-400">{stats.hard}</div>
              <div className="text-[10px] text-yellow-300/70 mt-1 uppercase tracking-wider">模糊 Hard</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/15 to-red-600/5 border border-red-500/30 rounded-2xl p-4 text-center">
              <div className="text-3xl font-['Space_Grotesk'] font-bold text-red-400">{stats.forgot}</div>
              <div className="text-[10px] text-red-300/70 mt-1 uppercase tracking-wider">遗忘 Forgot</div>
            </div>
          </div>

          <div className="w-full bg-[rgba(15,25,48,0.6)] backdrop-blur-xl border border-[#99f7ff]/15 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-['Space_Grotesk'] text-[#99f7ff]">掌握度</span>
              <span className="text-lg font-['Space_Grotesk'] font-bold text-[#00f1fe]">{stats.accuracy}%</span>
            </div>
            <div className="w-full h-3 bg-[#0f1930] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.accuracy}%`, background: 'linear-gradient(90deg, #00f1fe 0%, #af88ff 100%)' }} />
            </div>
          </div>

          {forgotItems.length > 0 && (
            <div className="w-full bg-[rgba(50,20,20,0.5)] backdrop-blur-xl border border-red-500/20 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <span className="text-sm font-['Space_Grotesk'] font-bold text-red-400">需要加强的元素</span>
              </div>
              <p className="text-xs text-[#a3aac4] mb-3">以下元素将加入错题库，在连连看环节重点练习：</p>
              <div className="flex flex-wrap gap-2">
                {forgotItems.map(item => (
                  <span key={item.id} className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-sm font-['Space_Grotesk'] text-red-300">{item.symbol} · {item.name}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleContinueToMatch}
            className="w-full py-5 rounded-full font-['Space_Grotesk'] font-bold text-white text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            style={{ background: 'linear-gradient(180deg, #6001d1 0%, #8b5cf6 100%)', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)' }}
          >
            继续挑战 Match Game
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '18px' }}>arrow_forward</span>
          </button>
        </main>
        <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined'}`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e20] font-['Manrope',sans-serif] text-[#dee5ff] overflow-hidden relative">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#060e20]/60 backdrop-blur-xl">
        <div onClick={onBack} className="flex items-center gap-2 text-[#99f7ff] active:scale-95 transition-transform duration-200 cursor-pointer">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-['Space_Grotesk'] tracking-wider uppercase text-[10px] sm:text-xs">DAY {level}/7: {levelConfig.label}</span>
        </div>
        <div className="hidden sm:block font-['Space_Grotesk'] font-bold text-[#99f7ff] drop-shadow-[0_0_10px_rgba(153,247,255,0.5)] text-xs sm:text-sm">
          TRIPLE CODING MODE
        </div>
        <div className="flex items-center gap-1.5 text-[#99f7ff] text-sm">
          <span className="w-6 h-6 rounded-full bg-[#99f7ff]/10 border border-[#99f7ff]/30 flex items-center justify-center text-[10px] font-['Space_Grotesk'] font-bold">{currentIndex + 1}</span>
          <span className="text-[#4d556b] text-xs">/</span><span className="text-xs">{elements.length}</span>
        </div>
      </header>

      <main className="relative h-screen w-full flex flex-col items-center justify-between px-6 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#99f7ff]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#af88ff]/10 rounded-full blur-[120px]"></div>
        </div>

        <section className="relative z-20 flex flex-col items-center max-w-sm w-full h-full justify-center gap-6">
          {/* Card Container */}
          <div className={`relative w-full max-w-sm aspect-[3/4] mx-auto [perspective:1000px] ${!isFlipped ? 'cursor-pointer' : ''}`} onClick={handleFlip} data-testid="flip-button">
            <div className={`relative w-full h-full transition-transform duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

              {/* ===== FRONT FACE - Active Recall Mode ===== */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] z-10 flex flex-col rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden"
                style={{ background: 'linear-gradient(145deg, rgba(25, 37, 64, 0.7) 0%, rgba(9, 19, 40, 0.85) 100%)', border: '1px solid rgba(153, 247, 255, 0.12)' }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-8 pointer-events-none">
                  <div className="w-72 h-72 border border-[#99f7ff]/15 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                  <div className="absolute w-52 h-52 border border-[#af88ff]/10 rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
                </div>

                <div className="relative z-30 flex-1 flex flex-col items-center justify-center px-8">
                  {level === 3 ? (
                    <>
                      <div className="mb-4 px-4 py-1.5 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-[10px] font-['Space_Grotesk'] text-[#f59e0b] uppercase tracking-widest">晓其价 · 化合价挑战</div>

                      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(245,158,11,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245,158,11,0.15)', boxShadow: '0 0 40px rgba(245,158,11,0.08), inset 0 0 20px rgba(245,158,11,0.03)' }}
                      >
                        <span className="text-4xl">{EMOJI_MAP[currentElement?.symbol] || '⚛️'}</span>
                      </div>

                      <div className="text-center">
                        <div className="text-[10px] text-[#4d556b] uppercase tracking-[0.25em] mb-2 font-['Space_Grotesk']">线索提示</div>
                        <div className="text-7xl sm:text-8xl font-['Space_Grotesk'] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#fbbf24] to-[#f59e0b] tracking-tighter drop-shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                          {currentElement?.symbol || '--'}
                        </div>
                        <div className="mt-4 text-base text-[#fbbf24] font-bold font-['Space_Grotesk']">常见化合价有哪些？</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-6 px-4 py-1.5 rounded-full bg-[#00f1fe]/10 border border-[#00f1fe]/20 text-[10px] font-['Space_Grotesk'] text-[#00f1fe] uppercase tracking-widest">{levelConfig.label} · 主动回忆</div>

                      <div className="w-28 h-28 rounded-3xl flex items-center justify-center mb-8"
                        style={{ background: 'rgba(153, 247, 255, 0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(153, 247, 255, 0.15)', boxShadow: '0 0 40px rgba(153, 247, 255, 0.08), inset 0 0 20px rgba(153, 247, 255, 0.03)' }}
                      >
                        <span className="text-5xl">{EMOJI_MAP[currentElement?.symbol] || '⚛️'}</span>
                      </div>

                      <div className="text-center">
                        <div className="text-[10px] text-[#4d556b] uppercase tracking-[0.25em] mb-3 font-['Space_Grotesk']">线索提示</div>
                        <div className="text-7xl sm:text-8xl font-['Space_Grotesk'] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-[#dee5ff] to-[#99f7ff] tracking-tighter drop-shadow-[0_0_30px_rgba(153,247,255,0.3)]">
                          {currentElement ? getDisplayValue(currentElement) : '--'}
                        </div>
                        <div className="mt-4 text-sm text-[#a3aac4] font-medium">{levelConfig.prompt}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="relative z-30 pb-8 flex flex-col items-center gap-3">
                  {!hasSeenCardTutorial && !isFlipped && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 animate-bounce-slow">
                      <div className="relative">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00f1fe] rotate-45" style={{ boxShadow: '0 0 10px rgba(0,241,254,0.4)' }}></div>
                        <div className="px-4 py-2 rounded-xl border border-[#00f1fe]/30 shadow-[0_0_20px_rgba(0,241,254,0.2)] whitespace-nowrap" style={{ background: 'linear-gradient(135deg, rgba(0,241,254,0.12) 0%, rgba(6,14,32,0.95) 100%)', backdropFilter: 'blur(12px)' }}>
                          <p className="text-xs font-['Space_Grotesk'] text-[#00f1fe] font-bold">
                            💡 在脑海中回忆答案，然后点击卡片翻看解析！
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="animate-bounce-slow">
                    <div className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00f1fe]/20 to-[#00f1fe]/5 border border-[#00f1fe]/30 flex items-center gap-2.5" style={{ boxShadow: '0 0 30px rgba(0, 241, 254, 0.15)' }}>
                      <span className="text-lg">👆</span>
                      <span className="text-sm font-['Space_Grotesk'] font-bold text-[#00f1fe] tracking-wide">点击翻开答案</span>
                      <span className="text-lg">👆</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#4d556b] tracking-wider uppercase font-['Space_Grotesk']">Tap to Reveal Answer</div>
                </div>
              </div>

              {/* ===== BACK FACE - TRIPLE CODING MODE ===== */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                style={{ background: 'linear-gradient(160deg, rgba(12, 18, 38, 0.97) 0%, rgba(8, 12, 28, 0.98) 100%)', border: '1px solid rgba(175, 136, 255, 0.15)' }}
              >
                {/* ═══ ZONE 1: VISUAL ENCODING (图像编码区 - 紧凑版) ═══ */}
                <div className="relative shrink-0">
                  <div className="relative w-full aspect-[2/1] overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(${currentElement?.id % 2 === 0 ? '80,120,200' : '200,120,80'}, 0.08) 0%, 
                        rgba(${currentElement?.id % 2 === 0 ? '40,60,140' : '100,60,40'}, 0.03) 100%)`,
                      borderBottom: '1px solid rgba(175, 136, 255, 0.1)'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl sm:text-6xl drop-shadow-lg animate-float-slow"
                        style={{ filter: 'drop-shadow(0 0 16px rgba(175, 136, 255, 0.25))' }}
                      >
                        {VISUAL_EMOJI[currentElement?.symbol] || EMOJI_MAP[currentElement?.symbol] || '⚛️'}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-cyan-500/[0.06] border border-cyan-400/15 flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span className="text-[7px] font-['Space_Grotesk'] text-cyan-400/70 uppercase tracking-wider font-bold">Visual</span>
                    </div>
                  </div>
                </div>

                {/* ═══ MNEMONIC BAR (记忆口诀 - 配图下方图注) ═══ */}
                <div className="shrink-0 px-5 py-1.5" style={{ background: 'linear-gradient(to bottom, rgba(175,136,255,0.04) 0%, transparent 100%)' }}>
                  <p className="text-[11px] text-cyan-300/90 text-center italic leading-relaxed truncate" style={{ textShadow: '0 0 8px rgba(34,211,238,0.2)' }} title={currentElement?.mnemonic}>
                    💡 {currentElement?.mnemonic || '暂无口诀'}
                  </p>
                </div>

                {/* ═══ ZONE 2: TEXT ENCODING (渐进式披露 - 按关卡逐步显示) ═══ */}
                <div className="flex-1 overflow-hidden px-5 py-3 min-h-0">
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    {level === 1 && (
                      <>
                        <span className="text-5xl sm:text-6xl font-['Space_Grotesk'] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#dee5ff] to-[#99f7ff] tracking-tighter drop-shadow-[0_0_20px_rgba(153,247,255,0.35)]">
                          {currentElement?.symbol}
                        </span>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-gray-500/70 font-['Space_Grotesk'] tracking-wider">{currentElement?.pinyin || ''}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl font-bold text-[#dee5ff]">{currentElement?.name}</span>
                            <button onClick={(e) => handleSpeak(e, currentElement)} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${speakingId === currentElement?.id ? 'bg-[#00f1fe]/25 text-[#00f1fe] scale-110 animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-[#99f7ff] active:scale-90'}`} title="朗读元素信息">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {level === 2 && (
                      <>
                        <div className="text-center">
                          <span className="text-4xl font-['Space_Grotesk'] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#99f7ff] to-[#af88ff] tracking-tight drop-shadow-[0_0_12px_rgba(153,247,255,0.25)]">
                            {currentElement?.symbol}
                          </span>
                          <span className="ml-2 text-base font-bold text-[#dee5ff]">{currentElement?.name}</span>
                          {currentElement?.pinyin && <span className="ml-1 text-[9px] text-gray-500/60 font-['Space_Grotesk']">({currentElement.pinyin})</span>}
                          <button onClick={(e) => handleSpeak(e, currentElement)} className={`ml-1.5 w-6 h-6 rounded-full inline-flex items-center justify-center transition-all duration-200 ${speakingId === currentElement?.id ? 'bg-[#00f1fe]/25 text-[#00f1fe] scale-110 animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-[#99f7ff] active:scale-90'}`} title="朗读元素信息">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span>
                          </button>
                        </div>
                        <div className="px-4 py-1.5 rounded-lg bg-[#00f1fe]/8 border border-[#00f1fe]/20">
                          <span className="text-xs text-[#4d556b]">第</span>
                          <span className="text-lg font-['Space_Grotesk'] font-bold text-[#00f1fe] mx-1">{currentElement?.atomicNumber}</span>
                          <span className="text-xs text-[#4d556b]">号元素</span>
                        </div>
                      </>
                    )}

                    {level === 3 && (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-['Space_Grotesk'] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#99f7ff] to-[#af88ff] tracking-tight drop-shadow-[0_0_12px_rgba(153,247,255,0.25)]">
                            {currentElement?.symbol}
                          </span>
                          <div className="flex flex-col items-start gap-0">
                            <span className="text-[9px] text-gray-500/60 leading-none">{currentElement?.pinyin || ''}</span>
                            <span className="text-base font-bold text-[#dee5ff] leading-tight">{currentElement?.name}</span>
                          </div>
                          <span className="px-3 py-1.5 rounded-xl font-['Space_Grotesk'] font-bold whitespace-nowrap"
                            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.06) 100%)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24', boxShadow: '0 0 20px rgba(245,158,11,0.12)', fontSize: (currentElement?.valence?.length || 0) > 6 ? '1rem' : '1.5rem' }}
                          >
                            {currentElement?.valence}
                          </span>
                          <button onClick={(e) => handleSpeak(e, currentElement)} className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${speakingId === currentElement?.id ? 'bg-[#f59e0b]/25 text-[#fbbf24] scale-110 animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-[#fbbf24] active:scale-90'}`} title="朗读元素信息">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span>
                          </button>
                        </div>
                      </>
                    )}

                    {level === 4 && (
                      <>
                        <div className="text-center">
                          <span className="text-4xl font-['Space_Grotesk'] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#99f7ff] to-[#af88ff] tracking-tight drop-shadow-[0_0_12px_rgba(153,247,255,0.25)]">
                            {currentElement?.symbol}
                          </span>
                          <span className="ml-2 text-base font-bold text-[#dee5ff]">{currentElement?.name}</span>
                          {currentElement?.pinyin && <span className="ml-1 text-[9px] text-gray-500/60 font-['Space_Grotesk']">({currentElement.pinyin})</span>}
                          <button onClick={(e) => handleSpeak(e, currentElement)} className={`ml-1.5 w-6 h-6 rounded-full inline-flex items-center justify-center transition-all duration-200 ${speakingId === currentElement?.id ? 'bg-[#f271b5]/25 text-[#f271b5] scale-110 animate-pulse' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-[#f271b5] active:scale-90'}`} title="朗读元素信息">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>volume_up</span>
                          </button>
                        </div>
                        <div className="px-5 py-2 rounded-xl bg-[#f271b5]/8 border border-[#f271b5]/25 text-center">
                          <span className="text-[10px] text-[#4d556b] uppercase tracking-wider">相对原子质量</span>
                          <div className="text-3xl font-['Space_Grotesk'] font-black text-[#f271b5] mt-0.5" style={{ textShadow: '0 0 16px rgba(242,113,181,0.3)' }}>
                            {currentElement?.symbol === 'Cl' ? '35.5' : currentElement ? Math.round(currentElement.atomicMass) : '-'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ═══ ZONE 3: CONTEXT ENCODING (情境编码区 - 紧凑锚点) ═══ */}
                <div className="shrink-0 px-5 pb-3 pt-1">
                  <div className="rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.07) 0%, rgba(139, 92, 246, 0.02) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.15)'
                    }}
                  >
                    <div className="px-3 pt-2.5 pb-2">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <GlobeIcon className="text-purple-400 w-3.5 h-3.5" />
                        <span className="text-[9px] font-['Space_Grotesk'] text-purple-400/90 uppercase tracking-widest font-bold">真实世界档案</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(currentElement?.commonUse || '').split('、').map((use, i) =>
                          use.trim() && (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium"
                              style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04))',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                color: '#c4b5fd'
                              }}
                            >
                              <WrenchIcon className="w-2.5 h-2.5 text-purple-400/50" />
                              {use.trim()}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #6001d1 50%, #8b5cf6 100%)' }}></div>
                  </div>
                </div>

                {/* Self-Evaluation Buttons - Compact Capsule */}
                <div className="px-5 pb-3 pt-2 shrink-0" style={{ background: 'linear-gradient(to top, rgba(6,14,32,0.98) 0%, transparent 100%)' }}>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); handleSelfEvaluate('forgot'); }} className="py-1.5 px-2 rounded-full font-['Space_Grotesk'] font-bold text-[11px] active:scale-95 transition-all flex items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }} data-testid="rate-forgot">
                      <span className="text-xs">🔴</span><span>没记住</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleSelfEvaluate('hard'); }} className="py-1.5 px-2 rounded-full font-['Space_Grotesk'] font-bold text-[11px] active:scale-95 transition-all flex items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.15) 0%, rgba(250,204,21,0.05) 100%)', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15' }} data-testid="rate-hard">
                      <span className="text-xs">🟡</span><span>模糊</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleSelfEvaluate('easy'); }} className="py-1.5 px-2 rounded-full font-['Space_Grotesk'] font-bold text-[11px] active:scale-95 transition-all flex items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }} data-testid="rate-easy">
                      <span className="text-xs">🟢</span><span>记住了</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-2 z-30">
            {Array.from({ length: elements.length }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < currentIndex ? 'bg-[#00f1fe] w-5' : i === currentIndex ? 'bg-[#99f7ff] w-7 animate-pulse' : 'bg-[#1a2744] w-3'}`} />
            ))}
          </div>
        </section>
      </main>

      <style>{`
        .material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined'}
        @keyframes bounce-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.animate-bounce-slow{animation:bounce-slow 2s ease-in-out infinite}
        @keyframes float-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}.animate-float-slow{animation:float-slow 3s ease-in-out infinite}
      `}</style>
    </div>
  );
};

export default FlashcardRoom;
