import { MapIcon, BiotechIcon, PersonIcon } from './Icons';

const GlobalNavBar = ({ currentView, onNavigate, unlockedCompounds = [] }) => {
  const navItems = [
    { id: 'map', label: '地图', icon: MapIcon },
    { id: 'lab', label: '实验室', icon: BiotechIcon },
    { id: 'profile', label: '统计', icon: PersonIcon }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#060e20]/80 backdrop-blur-2xl border-t border-[#99f7ff]/10 shadow-[0_-15px_50px_rgba(153,247,255,0.1)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || 
          (item.id === 'map' && ['map', 'learning', 'playing'].includes(currentView));
        
        return (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 px-6 py-2 rounded-2xl ${
              isActive 
                ? 'bg-[#99f7ff]/20 text-[#99f7ff] shadow-[0_0_25px_rgba(153,247,255,0.25)] scale-105' 
                : 'text-[#99f7ff]/30 hover:text-[#99f7ff]/60'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.id === 'lab' && unlockedCompounds.length > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#af88ff] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unlockedCompounds.length}
                </span>
              )}
            </div>
            <span className="font-['Manrope'] font-bold text-[10px] tracking-[0.2em] uppercase mt-0.5">
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
};

export default GlobalNavBar;
