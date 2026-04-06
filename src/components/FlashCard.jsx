import { useState } from 'react';

const FlashCard = ({ element, level }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    // 1秒后恢复原状
    setTimeout(() => setIsFlipped(false), 1000);
  };

  return (
    <div 
      className={`relative w-40 h-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
        ${isFlipped ? 'scale-105 ring-2 ring-primary' : ''}`}
      onClick={handleClick}
    >
      {/* 左上角原子序数 (level >= 2) */}
      {level >= 2 && (
        <div className="absolute top-2 left-2 text-sm text-gray-500 dark:text-gray-400">
          {element.atomicNumber}
        </div>
      )}

      {/* 右上角化合价 (level >= 3) */}
      {level >= 3 && (
        <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400">
          {element.valence}
        </div>
      )}

      {/* 元素符号 (居中大字) */}
      <div className="text-5xl font-bold text-primary dark:text-blue-400">
        {element.symbol}
      </div>

      {/* 元素名称 (底部小字) */}
      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        {element.name}
      </div>

      {/* 相对原子质量 (level >= 4) */}
      {level >= 4 && (
        <div className="absolute bottom-2 text-xs text-gray-500 dark:text-gray-400">
          {element.atomicMass}
        </div>
      )}
    </div>
  );
};

export default FlashCard;