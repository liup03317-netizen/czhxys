import { useState, useEffect, useCallback } from 'react';
import FlashcardRoom from './FlashcardRoom';
import MatchGame from './MatchGame';
import LevelMap from './LevelMap';
import SynthesisLab from './SynthesisLab';
import GlobalNavBar from './GlobalNavBar';

const MISTAKE_KEY = 'globalMistakeDetails';
const COMPOUND_KEY = 'synthesizedMolecules';

const levelConfigs = [
  { day: 1, level: 1, title: '识其名', matchKey2: 'name' },
  { day: 2, level: 2, title: '知其序', matchKey2: 'atomicNumber' },
  { day: 3, level: 3, title: '晓其价', matchKey2: 'valence' },
  { day: 4, level: 4, title: '明其重', matchKey2: 'atomicMass' },
  { day: 5, level: 5, title: '综合挑战1', matchKey2: 'random' },
  { day: 6, level: 6, title: '综合挑战2', matchKey2: 'random' },
  { day: 7, level: 7, title: '分子实验室', matchKey2: 'lab' }
];

const AppContainer = () => {
  const loadProgress = () => {
    try {
      const savedProgress = localStorage.getItem('chemGameProgress');
      if (savedProgress) {
        return JSON.parse(savedProgress);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return { unlockedLevel: 1, levelStars: {} };
  };

  const initialProgress = loadProgress();
  const [currentView, setCurrentView] = useState('map');
  const [unlockedLevel, setUnlockedLevel] = useState(initialProgress.unlockedLevel);
  const [levelStars, setLevelStars] = useState(initialProgress.levelStars);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pendingForgotIds, setPendingForgotIds] = useState(null);

  const handleSelectLevel = useCallback((dayIndex) => {
    if (dayIndex < unlockedLevel) {
      const selectedLevel = dayIndex + 1;
      setCurrentLevel(selectedLevel);

      if (selectedLevel === 7) {
        setCurrentView('lab');
      } else if (selectedLevel >= 5) {
        setCurrentView('playing');
      } else {
        setCurrentView('learning');
      }
    }
  }, [unlockedLevel]);

  const handleLearningComplete = useCallback((learningResults) => {
    if (Array.isArray(learningResults) && learningResults.length > 0) {
      const forgotIds = learningResults
        .filter(r => r.status === 'forgot')
        .map(r => r.id);
      setPendingForgotIds(forgotIds.length > 0 ? forgotIds : null);
    } else {
      setPendingForgotIds(null);
    }
    setCurrentView('playing');
  }, []);

  const handleGameComplete = useCallback((stars, finalStats, reviewIds) => {
    if (stars) {
      setLevelStars(prev => ({
        ...prev,
        [currentLevel]: stars
      }));
    }

    if (Array.isArray(reviewIds) && reviewIds.length > 0) {
      setPendingForgotIds(reviewIds);
      setCurrentView('learning');
      return;
    }

    setUnlockedLevel(prev => Math.min(prev + 1, levelConfigs.length + 1));
    setCurrentView('map');
  }, [currentLevel]);

  const handleBackToMap = useCallback(() => {
    setCurrentView('map');
  }, []);

  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const handleStartReview = useCallback(() => {
    try {
      const raw = localStorage.getItem(MISTAKE_KEY);
      if (raw) {
        const mistakes = JSON.parse(raw);
        const uniqueIds = [...new Set(mistakes.map(m => m.elementId))];
        if (uniqueIds.length > 0) {
          setPendingForgotIds(uniqueIds);
          setCurrentView('playing');
          return;
        }
      }
    } catch (_) {}
    setCurrentView('playing');
  }, []);

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem('chemGameProgress');
      localStorage.removeItem(COMPOUND_KEY);
      localStorage.removeItem(MISTAKE_KEY);
      setUnlockedLevel(1);
      setLevelStars({});
      setPendingForgotIds(null);
      setCurrentView('map');
    } catch (error) {
      console.error('Failed to reset progress:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const progress = {
        unlockedLevel,
        levelStars
      };
      localStorage.setItem('chemGameProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [unlockedLevel, levelStars]);

  const showGlobalNav = !['learning', 'playing'].includes(currentView);

  return (
    <div className="min-h-screen bg-[#060e20]">
      {currentView === 'map' && (
        <LevelMap
          levelConfigs={levelConfigs}
          unlockedLevel={unlockedLevel}
          levelStars={levelStars}
          onSelectLevel={handleSelectLevel}
          onResetProgress={resetProgress}
          onNavigate={handleNavigate}
          onStartReview={handleStartReview}
        />
      )}

      {currentView === 'learning' && (
        <FlashcardRoom
          level={currentLevel}
          onComplete={handleLearningComplete}
          onBack={handleBackToMap}
          focusElementIds={pendingForgotIds}
        />
      )}

      {currentView === 'playing' && (
        <MatchGame
          currentLevel={currentLevel}
          onComplete={handleGameComplete}
          preloadedForgotIds={pendingForgotIds}
        />
      )}

      {currentView === 'lab' && (
        <SynthesisLab
          onComplete={handleGameComplete}
          onBack={handleBackToMap}
          onReviewElements={(elementIds) => {
            setPendingForgotIds(elementIds);
            setCurrentView('learning');
          }}
        />
      )}

      {currentView === 'profile' && (
        <ProfileView
          levelConfigs={levelConfigs}
          levelStars={levelStars}
          unlockedLevel={unlockedLevel}
          onNavigate={handleNavigate}
          onStartReview={handleStartReview}
        />
      )}

      {showGlobalNav && (
        <GlobalNavBar
          currentView={currentView}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

const StarIcon = ({ filled, className, size = 'w-5 h-5' }) => (
  <svg className={`${className} ${size}`} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const TargetIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);

const AtomIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="2" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);

const ZapIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const WarningIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const PersonIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);

const ScienceIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 3h6v5.5l4 8.5H5l4-8.5V3z" /><path d="M9 3h6" />
  </svg>
);

function loadMistakes() {
  try {
    const raw = localStorage.getItem(MISTAKE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function loadCompounds() {
  try {
    const raw = localStorage.getItem(COMPOUND_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

const ATTR_LABELS = {
  symbol: '符号',
  name: '名称',
  atomicNumber: '原子序数',
  valence: '化合价',
  atomicMass: '相对原子质量'
};

const ELEMENT_NAMES = {};
try {
  const elData = require('../data/elementData').default || [];
  elData.forEach(el => { ELEMENT_NAMES[el.id] = el; });
} catch (_) {}

const ProfileView = ({ levelConfigs, levelStars, unlockedLevel, onNavigate, onStartReview }) => {
  const [mistakes, setMistakes] = useState([]);
  const [compounds, setCompounds] = useState([]);

  useEffect(() => {
    setMistakes(loadMistakes());
    setCompounds(loadCompounds());
  }, []);

  useEffect(() => {
    const handler = () => {
      setMistakes(loadMistakes());
      setCompounds(loadCompounds());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + (s || 0), 0);
  const maxStars = Math.min(unlockedLevel - 1, 7) * 3;
  const growthPct = maxStars > 0 ? Math.round((totalStars / maxStars) * 100) : 0;

  const mistakeCount = mistakes.length;
  const uniqueMistakeIds = new Set(mistakes.map(m => m.elementId));

  const attrCounts = {};
  mistakes.forEach(m => {
    if (m.attrType) {
      attrCounts[m.attrType] = (attrCounts[m.attrType] || 0) + 1;
    }
  });
  const sortedAttrs = Object.entries(attrCounts).sort((a, b) => b[1] - a[1]);
  const topAttr = sortedAttrs.length > 0 ? sortedAttrs[0] : null;

  const elementErrorCounts = {};
  mistakes.forEach(m => {
    elementErrorCounts[m.elementId] = (elementErrorCounts[m.elementId] || 0) + 1;
  });
  const topWeakElements = Object.entries(elementErrorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const masteredCount = levelConfigs.filter((_, i) => {
    if (i >= unlockedLevel) return false;
    const stars = levelStars[levelConfigs[i].level] || 0;
    const hasMistake = mistakes.some(m => m.wave !== undefined);
    return stars >= 3;
  }).length;

  return (
    <div className="min-h-screen bg-[#060e20] font-['Manrope',sans-serif] text-[#dee5ff] overflow-hidden relative">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4">
          <button onClick={() => onNavigate && onNavigate('map')} className="flex items-center gap-2 text-[#99f7ff] active:scale-95 transition-transform cursor-pointer">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-['Space_Grotesk'] tracking-wider uppercase text-xs">返回地图</span>
          </button>
          <h1 className="font-['Space_Grotesk'] font-bold text-[#99f7ff] drop-shadow-[0_0_10px_rgba(153,247,255,0.5)] tracking-wider uppercase text-sm">
            智能记忆中心
          </h1>
          <div className="w-14"></div>
        </div>
      </header>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#af88ff]/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-[#00f1fe]/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 pt-22 pb-36 px-5 max-w-md mx-auto space-y-4">

        {/* ===== Core Metrics Dashboard ===== */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-red-500/[0.08] to-red-600/[0.03] border border-red-500/25 rounded-2xl p-4 text-center relative overflow-hidden">
            {mistakeCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            )}
            <div className="text-3xl font-['Space_Grotesk'] font-bold text-red-400">{mistakeCount}</div>
            <div className="text-[9px] text-red-300/70 mt-1 uppercase tracking-wider font-['Space_Grotesk']">今日待复习</div>
            <TargetIcon className="mx-auto mt-2 text-red-400/30 w-5 h-5" />
          </div>

          <div className="bg-gradient-to-br from-purple-500/[0.08] to-purple-600/[0.03] border border-purple-500/25 rounded-2xl p-4 text-center relative overflow-hidden">
            <div className="text-3xl font-['Space_Grotesk'] font-bold text-[#af88ff]">{compounds.length}</div>
            <div className="text-[9px] text-purple-300/70 mt-1 uppercase tracking-wider font-['Space_Grotesk']">合成物质</div>
            <AtomIcon className="mx-auto mt-2 text-purple-400/30 w-5 h-5" />
          </div>

          <div className="bg-gradient-to-br from-emerald-500/[0.08] to-emerald-600/[0.03] border border-emerald-500/25 rounded-2xl p-4 text-center relative overflow-hidden">
            <div className="text-3xl font-['Space_Grotesk'] font-bold text-emerald-400">+{growthPct}%</div>
            <div className="text-[9px] text-emerald-300/70 mt-1 uppercase tracking-wider font-['Space_Grotesk']">掌握提升</div>
            <TrendingUpIcon className="mx-auto mt-2 text-emerald-400/30 w-5 h-5" />
          </div>
        </div>

        {/* ===== Growth Bar ===== */}
        <div className="bg-[rgba(15,25,48,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-['Space_Grotesk'] text-[#dee5ff]">总进度</span>
            <span className="text-sm font-['Space_Grotesk'] font-bold text-[#99f7ff]">{totalStars}/{maxStars} 星 · {masteredCount}/7 熟练</span>
          </div>
          <div className="w-full h-2.5 bg-[#0f1930] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${maxStars > 0 ? (totalStars / maxStars) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #00f1fe 0%, #af88ff 60%, #6001d1 100%)'
              }}
            />
          </div>
        </div>

        {/* ===== Diagnosis Area ===== */}
        {(topAttr || topWeakElements.length > 0) && (
          <div className="bg-[rgba(15,25,48,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ZapIcon className="text-yellow-400 w-4 h-4" />
              <span className="text-sm font-['Space_Grotesk'] font-bold text-[#99f7ff]">多维诊断区</span>
            </div>

            {topAttr && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/[0.06] to-transparent border-l-2 border-orange-400/50">
                <div className="flex items-center gap-2 mb-1">
                  <WarningIcon className="text-orange-400 w-4 h-4" />
                  <span className="text-[10px] text-orange-300/80 uppercase tracking-wider font-['Space_Grotesk']">最易错属性</span>
                </div>
                <span className="text-base font-['Space_Grotesk'] font-bold text-orange-300">
                  {ATTR_LABELS[topAttr[0]] || topAttr[0]}
                </span>
                <span className="text-xs text-orange-300/60 ml-2">
                  占比 {Math.round((topAttr[1] / Math.max(mistakeCount, 1)) * 100)}%
                </span>
              </div>
            )}

            {topWeakElements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] text-[#4d556b] uppercase tracking-wider font-['Space_Grotesk']">薄弱元素 TOP {topWeakElements.length}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {topWeakElements.map(([id, count]) => {
                    const elInfo = ELEMENT_NAMES[id];
                    return (
                      <div key={id} className="flex flex-col items-center p-2 rounded-xl bg-red-500/[0.05] border border-red-500/15">
                        <span className="text-lg font-['Space_Grotesk'] font-bold text-red-300">
                          {elInfo?.symbol || '?'}
                        </span>
                        <span className="text-[8px] text-red-400/60 mt-0.5">×{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== Level Stars Grid ===== */}
        <div className="bg-[rgba(15,25,48,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StarIcon filled size="w-4 h-4" className="text-yellow-400" />
              <span className="text-sm font-['Space_Grotesk'] font-bold text-[#99f7ff]">关卡星级</span>
            </div>
            <span className="text-[10px] text-[#4d556b]">{totalStars} ⭐ 累计</span>
          </div>
          <div className="space-y-2.5">
            {levelConfigs.map((config) => {
              const stars = levelStars[config.level] || 0;
              const isLocked = config.level >= unlockedLevel;
              return (
                <div key={config.level} className={`flex items-center justify-between py-1.5 px-3 rounded-xl ${isLocked ? 'opacity-35' : ''}`}>
                  <span className={`text-xs ${isLocked ? 'text-slate-600' : 'text-[#a3aac4]'}`}>{config.title}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                      <StarIcon
                        key={s}
                        filled={s <= stars && !isLocked}
                        size="w-4 h-4"
                        className={isLocked ? 'text-slate-700' : s <= stars ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]' : 'text-slate-700'}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Synthesized Compounds ===== */}
        {compounds.length > 0 && (
          <div className="bg-[rgba(15,25,48,0.6)] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AtomIcon className="text-[#af88ff] w-4 h-4" />
              <span className="text-sm font-['Space_Grotesk'] font-bold text-[#99f7ff]">已合成物质</span>
              <span className="ml-auto text-[10px] text-[#4d556b]">{compounds.length} 种</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {compounds.map((c, i) => (
                <span key={i} className="px-2.5 py-1 bg-[#af88ff]/8 border border-[#af88ff]/20 rounded-lg text-xs font-['Space_Grotesk'] text-[#dee5ff]">
                  {typeof c === 'string' ? c : c.formula || c.name || c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== CTA: One-Click Review Button ===== */}
        <button
          onClick={() => onStartReview && onStartReview()}
          className={`w-full py-4 rounded-2xl font-['Space_Grotesk'] font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group ${
            mistakeCount > 0 ? 'animate-glow-review' : ''
          }`}
          style={
            mistakeCount > 0
              ? {
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(245,158,11,0.12) 100%)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: '#fca5a5',
                  boxShadow: '0 0 30px rgba(239,68,68,0.15), inset 0 0 20px rgba(239,68,68,0.03)'
                }
              : {
                  background: 'linear-gradient(180deg, #6001d1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 28px rgba(139, 92, 246, 0.35), inset 0 2px 4px rgba(255,255,255,0.2)',
                  color: 'white'
                }
          }
        >
          {mistakeCount > 0 ? (
            <>
              <ZapIcon className="w-5 h-5 animate-pulse" />
              <span>启动一键精准复习 ({uniqueMistakeIds.size} 个薄弱点)</span>
              <BookIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </>
          ) : (
            <>
              <ScienceIcon className="w-5 h-5" />
              <span>暂无错题，继续挑战新关卡</span>
            </>
          )}
        </button>

        <button
          onClick={() => onNavigate && onNavigate('map')}
          className="w-full py-2.5 rounded-xl font-['Space_Grotesk'] text-xs active:scale-[0.98] transition-all"
          style={{ background: 'transparent', border: '1px solid rgba(153,247,255,0.15)', color: '#a3aac4' }}
        >
          返回学习调度中枢
        </button>

      </main>

      <style>{`
        @keyframes glow-review {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.12), inset 0 0 15px rgba(239,68,68,0.02); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.25), inset 0 0 25px rgba(239,68,68,0.04); }
        }
        .animate-glow-review { animation: glow-review 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AppContainer;
