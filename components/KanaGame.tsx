
import React, { useState, useEffect, useRef } from 'react';
import { KANA_DATA } from '../constants';

interface KanaGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const KanaGame: React.FC<KanaGameProps> = ({ onComplete, onBack }) => {
  const [gamePool, setGamePool] = useState<{char: string, romaji: string}[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  
  const timerRef = useRef<number | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('nihongo_kana_state');
    const today = new Date().toLocaleDateString();
    
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.date === today) {
        setGamePool(parsed.pool);
        setCurrentIdx(parsed.currentIdx);
        setScore(parsed.score);
        return;
      }
    }
    
    const shuffled = shuffleArray([...KANA_DATA]);
    const newPool = shuffled.slice(0, 30);
    setGamePool(newPool);
    saveState(0, 0, newPool);
  }, []);

  const saveState = (idx: number, currentScore: number, pool: any[]) => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem('nihongo_kana_state', JSON.stringify({
      currentIdx: idx,
      score: currentScore,
      pool: pool,
      date: today
    }));
  };

  const clearState = () => {
    localStorage.removeItem('nihongo_kana_state');
  };

  const calculateScore = (time: number) => {
    const base = 10;
    if (time <= 0) return base;
    if (time >= 26) return base + 6; // 16
    if (time >= 21) return base + 5; // 15
    if (time >= 16) return base + 4; // 14
    if (time >= 11) return base + 3; // 13
    if (time >= 6) return base + 2;  // 12
    return base + 1;                 // 11
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const shuffled = shuffleArray([...KANA_DATA]);
    setGamePool(shuffled.slice(0, 30));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const generateOptions = (correct: string) => {
    const others = KANA_DATA.filter(k => k.romaji !== correct)
      .map(k => k.romaji);
    const shuffledOthers = shuffleArray(others).slice(0, 3);
    return shuffleArray([...shuffledOthers, correct]);
  };

  useEffect(() => {
    if (gamePool.length > 0 && currentIdx < gamePool.length) {
      setOptions(generateOptions(gamePool[currentIdx].romaji));
      setClickTimestamps([]);
      startTimer();
    } else if (gamePool.length > 0 && currentIdx === gamePool.length) {
      clearState();
      onComplete(score);
    }
  }, [currentIdx, gamePool]);

  const handleSelect = (selected: string) => {
    if (message && message.type === 'success') return;

    const now = Date.now();
    const newTimestamps = [...clickTimestamps, now];
    setClickTimestamps(newTimestamps);

    // 防作弊检查：如果点击了4次且总耗时小于1.5秒
    if (newTimestamps.length >= 4) {
      const duration = newTimestamps[newTimestamps.length - 1] - newTimestamps[0];
      if (duration < 1500) {
        if (timerRef.current) clearInterval(timerRef.current);
        setMessage({ text: '检测到频繁点击，本题无分', type: 'warning' });
        setTimeout(() => {
          setMessage(null);
          setCurrentIdx(prev => prev + 1);
        }, 1500);
        return;
      }
    }

    if (selected === gamePool[currentIdx].romaji) {
      if (timerRef.current) clearInterval(timerRef.current);
      const roundPoints = calculateScore(timeLeft);
      const newScore = score + roundPoints;
      setScore(newScore);
      setMessage({ text: `太棒了！+${roundPoints}`, type: 'success' });
      
      const nextIdx = currentIdx + 1;
      saveState(nextIdx, newScore, gamePool);

      setTimeout(() => {
        setMessage(null);
        setCurrentIdx(nextIdx);
      }, 800);
    } else {
      setMessage({ text: '再试试', type: 'error' });
      // 错误提示时间缩短，以便能捕获快速连续点击
      setTimeout(() => setMessage(null), 400);
    }
  };

  if (gamePool.length === 0 || currentIdx >= gamePool.length) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#FF6B6B]"></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-2 space-y-6 animate-in fade-in zoom-in-95 duration-500 relative">
      {/* 退出按钮 - 移至右上方 */}
      <button 
        onClick={onBack} 
        className="absolute -top-1 -right-2 p-2 text-gray-400 hover:text-[#FF6B6B] transition-colors z-30"
        aria-label="退出"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 头部状态 */}
      <div className="w-full px-4 flex justify-between items-center mt-4">
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-300 uppercase">进度</span>
              <span className="text-xl font-black text-gray-700">{currentIdx + 1}/{gamePool.length}</span>
          </div>
          <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-300 uppercase">倒计时</span>
              <span className={`text-xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>{timeLeft}s</span>
          </div>
          <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-300 uppercase">当前积分</span>
              <span className="text-xl font-black text-[#4ECDC4]">{score}</span>
          </div>
      </div>

      <div className="w-full px-4">
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
          <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] h-full rounded-full transition-all duration-500 shadow-sm" style={{ width: `${((currentIdx + 1) / gamePool.length) * 100}%` }} />
        </div>
      </div>

      <div className="bg-white w-48 h-48 rounded-[3rem] shadow-[0_20px_40px_rgba(255,107,107,0.2)] border-8 border-[#FFEDED] flex items-center justify-center relative transform -rotate-2">
        <span className="text-[100px] font-black text-gray-800 select-none">{gamePool[currentIdx].char}</span>
        {message && (
          <div className={`absolute -bottom-6 px-6 py-2 rounded-2xl text-white text-lg font-black shadow-xl animate-bounce z-10 whitespace-nowrap ${
            message.type === 'success' ? 'bg-[#4ECDC4]' : 
            message.type === 'warning' ? 'bg-orange-500' : 'bg-[#FF6B6B]'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="text-center px-4 pt-4">
        <h2 className="text-lg font-black text-gray-700">请选择正确的罗马音：</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full px-2">
        {options.map((opt, i) => (
          <button
            key={`${currentIdx}-${i}`}
            onClick={() => handleSelect(opt)}
            className="bg-white border-2 border-gray-100 py-6 rounded-[2rem] text-3xl font-black text-gray-700 hover:border-[#FF6B6B] hover:text-[#FF6B6B] hover:bg-[#FFEDED] active:scale-90 transition-all shadow-md group"
          >
            <span className="group-hover:scale-110 inline-block transition-transform">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default KanaGame;
