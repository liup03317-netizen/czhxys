import { useState, useEffect } from 'react';
import useTutorial from '../hooks/useTutorial';

const MISTAKE_KEY = 'globalMistakeDetails';
const COMPOUND_KEY = 'synthesizedMolecules';

const StarIcon = ({ filled, className, size = 'w-5 h-5' }) => (
  <svg className={`${className} ${size}`} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ScienceIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 3h6v5.5l4 8.5H5l4-8.5V3z" /><path d="M9 3h6" />
  </svg>
);

const AutoAwesomeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z" />
  </svg>
);

const MicroscopeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18h8" /><path d="M3 22h18" /><path d="M14 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" /><path d="M14 8V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2" />
  </svg>
);

const BiotechIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 21h10" /><path d="M12 21V11" /><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M9 11a4 4 0 0 0 4 4" /><path d="M15 11a4 4 0 0 1-4 4" />
  </svg>
);

const HubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" /><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
  </svg>
);

const AtomIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="2" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);

const PersonIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);

const RestartIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

const WarningIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

function loadGlobalMistakes() {
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

const NODE_ICONS = [
  <AutoAwesomeIcon key="0" className="w-8 h-8" />,
  <MicroscopeIcon key="1" className="w-8 h-8" />,
  <ScienceIcon key="2" className="w-8 h-8" />,
  <BiotechIcon key="3" className="w-8 h-8" />,
  <HubIcon key="4" className="w-8 h-8" />,
  <AtomIcon key="5" className="w-8 h-8" />,
  <ScienceIcon key="6" className="w-8 h-8" />
];

const LEVEL_ELEMENTS = {
  1: [1, 2, 3, 4, 5, 6, 7, 8],
  2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  7: []
};

const LevelMap = ({ levelConfigs, unlockedLevel, levelStars, onSelectLevel, onResetProgress, onNavigate, onStartReview }) => {
  const [shakeIndex, setShakeIndex] = useState(-1);
  const [mistakes, setMistakes] = useState([]);
  const [compounds, setCompounds] = useState([]);
  const [hasSeenMapTutorial, completeMapTutorial] = useTutorial('level_map');

  useEffect(() => {
    setMistakes(loadGlobalMistakes());
    setCompounds(loadCompounds());
  }, []);

  useEffect(() => {
    const handler = () => {
      setMistakes(loadGlobalMistakes());
      setCompounds(loadCompounds());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const getNodeStatus = (index) => {
    if (index >= unlockedLevel) return 'locked';
    if (index >= unlockedLevel - 1 && index < unlockedLevel) return 'current';

    const stars = levelStars?.[levelConfigs[index]?.level] || 0;
    const levelElementIds = LEVEL_ELEMENTS[index + 1] || [];
    const levelMistakes = mistakes.filter(m => levelElementIds.includes(m.elementId));

    if (stars >= 3 && levelMistakes.length === 0) return 'mastered';
    if (levelMistakes.length > 0) return 'needsReview';
    return 'starChasing';
  };

  const handleNodeClick = (dayIndex) => {
    if (dayIndex < unlockedLevel) {
      onSelectLevel(dayIndex);
      completeMapTutorial();
    } else {
      setShakeIndex(dayIndex);
      setTimeout(() => setShakeIndex(-1), 500);
    }
  };

  const getPosition = (index) => {
    const positions = ['translate-x-10', '-translate-x-14', 'translate-x-8', '-translate-x-12', 'translate-x-14', '-translate-x-16', '-translate-x-12'];
    return positions[index] || '';
  };

  const totalMistakes = mistakes.length;
  const masteredCount = levelConfigs.filter((_, i) => getNodeStatus(i) === 'mastered').length;

  return (
    <div className="min-h-screen bg-[#060e20] font-['Manrope',sans-serif] text-[#dee5ff] overflow-x-hidden relative">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#060e20]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <ScienceIcon className="text-[#99f7ff] text-2xl w-6 h-6" />
            <div className="flex flex-col">
              <h1 className="font-['Space_Grotesk'] font-bold text-[#99f7ff] drop-shadow-[0_0_10px_rgba(153,247,255,0.5)] tracking-wider uppercase text-sm">
                探索大本营
              </h1>
              <span className="text-[10px] font-bold text-[#dee5ff]/60 uppercase tracking-tighter">
                7-DAY ELEMENT MASTERY
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalMistakes > 0 && (
              <button
                onClick={() => onStartReview && onStartReview()}
                data-testid="review-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500/15 to-orange-500/10 border border-red-500/30 animate-pulse-slow"
              >
                <WarningIcon className="text-orange-400 w-4 h-4" />
                <span className="text-xs font-bold text-orange-400">{totalMistakes} 待复习</span>
              </button>
            )}
            <div className="w-10 h-10 rounded-full border border-[#99f7ff]/20 bg-[#0f1930] flex items-center justify-center shadow-[0_0_15px_rgba(153,247,255,0.2)] cursor-pointer hover:border-[#99f7ff]/40 transition-all"
              onClick={() => onNavigate && onNavigate('profile')}
              data-testid="profile-btn"
            >
              <PersonIcon className="text-[#99f7ff] w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-[#060e20]/60 backdrop-blur-md border-b border-white/[0.04]">
        <div className="max-w-lg mx-auto px-6 py-2.5 flex items-center justify-around">
          {[
            { label: '已熟练', value: `${masteredCount}/7`, color: 'text-emerald-400', icon: <CheckCircleIcon className="w-3.5 h-3.5" /> },
            { label: '待复习', value: totalMistakes > 0 ? totalMistakes : '0', color: totalMistakes > 0 ? 'text-orange-400' : 'text-[#4d556b]', icon: <WarningIcon className="w-3.5 h-3.5" /> },
            { label: '合成物质', value: compounds.length, color: 'text-[#af88ff]', icon: <AtomIcon className="w-3.5 h-3.5" /> },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={stat.color}>{stat.icon}</span>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-[8px] text-[#4d556b]">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative pt-36 pb-40 flex flex-col items-center min-h-screen"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(153, 247, 255, 0.05) 1px, transparent 0),
            radial-gradient(circle at 50% 50%, rgba(96, 1, 209, 0.05) 0%, transparent 70%)
          `,
          backgroundSize: '40px 40px, 100% 100%'
        }}
      >
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#99f7ff]/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#af88ff]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative w-full max-w-md px-4">
          {!hasSeenMapTutorial && (
            <div className="absolute -top-16 left-8 z-50 animate-bounce-slow pointer-events-none">
              <div className="relative">
                <div className="absolute -bottom-2 left-6 w-3 h-3 bg-[#00f1fe] rotate-45" style={{ boxShadow: '0 0 10px rgba(0,241,254,0.4)' }}></div>
                <div className="px-4 py-2.5 rounded-xl border border-[#00f1fe]/30 shadow-[0_0_20px_rgba(0,241,254,0.2)]" style={{ background: 'linear-gradient(135deg, rgba(0,241,254,0.12) 0%, rgba(6,14,32,0.95) 100%)', backdropFilter: 'blur(12px)' }}>
                  <p className="text-xs font-['Space_Grotesk'] text-[#00f1fe] font-bold whitespace-nowrap">
                    👋 欢迎来到分子实验室！点击 Day 1 开启挑战
                  </p>
                </div>
              </div>
            </div>
          )}
          <svg className="absolute inset-0 w-full h-[1200px] pointer-events-none overflow-visible" fill="none" viewBox="0 0 400 1200">
            <path className="opacity-10" d="M200 1100 C 350 1000, 50 900, 200 800 C 350 700, 50 600, 200 500 C 350 400, 50 300, 200 200" stroke="white" strokeLinecap="round" strokeWidth="6"></path>
            <path className="path-flow" d="M200 1100 C 350 1000, 50 900, 200 800 C 350 700, 50 600, 200 500" stroke="#99f7ff" strokeLinecap="round" strokeOpacity="0.6" strokeWidth="6"></path>
          </svg>

          <div className="relative flex flex-col items-center gap-32 py-10">
            {levelConfigs.map((config, index) => {
              const status = getNodeStatus(index);
              const dayIndex = index;
              const isCurrent = index === unlockedLevel - 1;
              const isCompleted = index < unlockedLevel - 1;
              const stars = levelStars?.[config.level] || 0;
              const levelMistakes = mistakes.filter(m => (LEVEL_ELEMENTS[index + 1] || []).includes(m.elementId));
              const uniqueMistakeCount = new Set(levelMistakes.map(m => m.elementId)).size;

              return (
                <div
                  key={config.day}
                  className={`flex flex-col items-center z-10 ${getPosition(index)} ${shakeIndex === index ? 'animate-shake' : ''}`}
                >

                  {/* ===== CURRENT / ACTIVE ===== */}
                  {isCurrent && (
                    <div className="relative group cursor-pointer" onClick={() => handleNodeClick(dayIndex)} data-testid={`day-node-${dayIndex}`}>
                      <div className="absolute -inset-7 bg-[#99f7ff]/20 rounded-full animate-ping"></div>
                      <div className="absolute -inset-5 bg-[#99f7ff]/25 rounded-full animate-pulse"></div>
                      <button className="relative w-26 h-26 rounded-full bg-[#99f7ff] border-4 border-white/60 flex items-center justify-center shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5),inset_0_4px_10px_rgba(255,255,255,0.1),0_0_25px_rgba(153,247,255,0.6)] hover:scale-110 transition-all duration-400"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(153, 247, 255, 0.8))' }}
                      >
                        <div className="text-[#060e20]">{NODE_ICONS[index]}</div>
                      </button>
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#99f7ff] text-[#060e20] px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-[0_0_20px_rgba(153,247,255,0.6)] border border-white/30 whitespace-nowrap">
                        任务激活
                      </div>
                    </div>
                  )}

                  {/* ===== MASTERED ===== */}
                  {!isCurrent && status === 'mastered' && (
                    <div className="relative cursor-pointer group" onClick={() => handleNodeClick(dayIndex)} data-testid={`day-node-${dayIndex}`}>
                      <div className="absolute -inset-6 bg-emerald-500/[0.08] rounded-full group-hover:bg-emerald-500/15 transition-colors"></div>
                      <div className="absolute -inset-3 bg-cyan-400/[0.06] rounded-full animate-glow-cyan"></div>
                      <div className="flex gap-1 justify-center mb-1 absolute -top-8 left-1/2 -translate-x-1/2 w-full">
                        {[1, 2, 3].map(s => (
                          <StarIcon key={s} filled size="w-5 h-5" className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                        ))}
                      </div>
                      <button className="w-22 h-22 rounded-full border-2 border-emerald-400/40 flex items-center justify-center shadow-[inset_0_-4px_10px_rgba(0,0,0,0.3),inset_0_4px_10px_rgba(34,197,94,0.1),0_0_20px_rgba(34,197,94,0.2)] hover:scale-105 transition-all duration-400 overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.15), rgba(6, 78, 59, 0.3))' }}
                      >
                        <div className="text-emerald-300/80 group-hover:text-emerald-200 transition-colors">{NODE_ICONS[index]}</div>
                        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>
                      </button>
                    </div>
                  )}

                  {/* ===== NEEDS REVIEW ===== */}
                  {!isCurrent && status === 'needsReview' && (
                    <div className="relative cursor-pointer group" onClick={() => handleNodeClick(dayIndex)} data-testid={`day-node-${dayIndex}`}>
                      <div className="absolute -inset-6 bg-orange-500/[0.1] rounded-full animate-pulse-warning"></div>
                      <div className="flex gap-1 justify-center mb-1 absolute -top-8 left-1/2 -translate-x-1/2 w-full">
                        {[1, 2, 3].map(s => (
                          <StarIcon key={s} filled={s <= stars} size="w-5 h-5" className={s <= stars ? 'text-yellow-400' : 'text-slate-600'} />
                        ))}
                      </div>
                      <button className="w-22 h-22 rounded-full border-2 border-orange-400/40 flex items-center justify-center shadow-[inset_0_-4px_10px_rgba(0,0,0,0.3),inset_0_4px_10px_rgba(251,146,60,0.1),0_0_20px_rgba(251,146,60,0.2)] hover:scale-105 transition-all duration-400 overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, rgba(251, 146, 60, 0.12), rgba(120, 53, 15, 0.25))' }}
                      >
                        <div className="text-orange-300/80 group-hover:text-orange-200 transition-colors">{NODE_ICONS[index]}</div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_0_8px_rgba(251,146,60,0.6)]">
                          <span className="text-[9px] font-black text-white">{uniqueMistakeCount}</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* ===== STAR CHASING (<3★, no active mistakes) ===== */}
                  {!isCurrent && status === 'starChasing' && (
                    <div className="relative cursor-pointer group" onClick={() => handleNodeClick(dayIndex)} data-testid={`day-node-${dayIndex}`}>
                      <div className="absolute -inset-5 rounded-full border-2 border-dashed border-white/10 group-hover:border-white/20 transition-colors"></div>
                      <div className="flex gap-1 justify-center mb-1 absolute -top-8 left-1/2 -translate-x-1/2 w-full">
                        {[1, 2, 3].map(s => (
                          <StarIcon key={s} filled={false} size="w-5 h-5" className="text-slate-500" />
                        ))}
                      </div>
                      <button className="w-20 h-20 rounded-full border-2 border-dashed border-white/15 flex items-center justify-center shadow-[inset_0_-4px_10px_rgba(0,0,0,0.3),inset_0_4px_10px_rgba(255,255,255,0.05)] hover:scale-105 hover:border-white/25 transition-all duration-400 overflow-hidden group"
                        style={{ background: 'linear-gradient(145deg, rgba(153, 247, 255, 0.08), rgba(0, 85, 90, 0.2))' }}
                      >
                        <div className="text-[#99f7ff]/40 group-hover:text-[#99f7ff]/70 transition-colors">{NODE_ICONS[index]}</div>
                      </button>
                    </div>
                  )}

                  {/* ===== LOCKED ===== */}
                  {status === 'locked' && (
                    <button
                      className="w-16 h-16 rounded-full flex items-center justify-center border border-white/10 opacity-50 cursor-not-allowed"
                      style={{ background: 'linear-gradient(145deg, #1f2b49, #091328)', boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.05), inset -2px -2px 5px rgba(0,0,0,0.5)' }}
                      onClick={() => handleNodeClick(dayIndex)}
                      data-testid={`day-node-${dayIndex}`}
                    >
                      <LockIcon className="text-slate-500 w-5 h-5" />
                    </button>
                  )}

                  {/* Label */}
                  <div className="mt-4 text-center">
                    <span className={`font-['Space_Grotesk'] text-xl font-bold uppercase tracking-[0.2em] ${
                      isCurrent ? 'text-[#99f7ff] drop-shadow-[0_0_15px_rgba(153,247,255,0.8)]' :
                      status === 'mastered' ? 'text-emerald-300/90' :
                      status === 'needsReview' ? 'text-orange-300/90' :
                      status === 'starChasing' ? 'text-[#dee5ff]/60' :
                      'text-slate-600'
                    }`}>
                      {config.title}
                    </span>
                    <p className={`text-[10px] font-bold tracking-widest mt-1 ${
                      isCurrent ? 'text-[#99f7ff]/80 animate-pulse' :
                      status === 'mastered' ? 'text-emerald-400/60' :
                      status === 'needsReview' ? 'text-orange-400/70 animate-pulse' :
                      status === 'starChasing' ? 'text-[#dee5ff]/50' :
                      'text-slate-700'
                    }`}>
                      {isCurrent ? '点击开始' :
                       status === 'mastered' ? `DAY ${config.day}: 已熟练` :
                       status === 'needsReview' ? `DAY ${config.day}: 需复习` :
                       status === 'starChasing' ? `DAY ${config.day}: 可冲星` :
                       `DAY ${config.day}: 未解锁`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Reset Button */}
      {onResetProgress && (
        <button
          onClick={onResetProgress}
          className="fixed bottom-28 right-4 z-40 bg-[#99f7ff] group p-3 rounded-xl shadow-[0_10px_30px_rgba(153,247,255,0.4)] flex items-center gap-2 active:scale-95 transition-all hover:pr-4"
        >
          <div className="p-1.5 bg-[#060e20] rounded-lg group-hover:rotate-12 transition-transform">
            <RestartIcon className="text-[#99f7ff] w-4 h-4" />
          </div>
          <span className="text-xs font-black text-[#060e20] uppercase">重置</span>
        </button>
      )}

      <style>{`
        .path-flow {
          stroke-dasharray: 60, 240;
          animation: flow 4s linear infinite;
        }
        @keyframes flow {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        @keyframes pulse-warning {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-warning { animation: pulse-warning 2s ease-in-out infinite; }
        @keyframes glow-cyan {
          0%, 100% { box-shadow: 0 0 8px rgba(34,211,238,0.15); }
          50% { box-shadow: 0 0 20px rgba(34,211,238,0.35); }
        }
        .animate-glow-cyan { animation: glow-cyan 3s ease-in-out infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LevelMap;
