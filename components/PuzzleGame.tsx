
import React, { useState, useEffect, useRef } from 'react';
import { KANA_DATA } from '../constants';

interface Piece {
  id: string;
  char: string;
  quadrant: number; // 0:左上, 1:右上, 2:左下, 3:右下
}

interface PuzzleGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onComplete, onBack }) => {
  const [round, setRound] = useState(1);
  const totalRounds = 20;
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [targetKana, setTargetKana] = useState<typeof KANA_DATA[0] | null>(null);
  const [candidates, setCandidates] = useState<Piece[]>([]);
  const [slots, setSlots] = useState<(Piece | null)[]>([null, null, null, null]);
  const [roundComplete, setRoundComplete] = useState(false);
  const [lastRoundPoints, setLastRoundPoints] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('nihongo_puzzle_state');
    const today = new Date().toLocaleDateString();
    
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.date === today) {
        setRound(parsed.round);
        setScore(parsed.score);
        // We start a fresh round with the saved score and round number
      }
    }
  }, []);

  const saveState = (currentRound: number, currentScore: number) => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem('nihongo_puzzle_state', JSON.stringify({
      round: currentRound,
      score: currentScore,
      date: today
    }));
  };

  const clearState = () => {
    localStorage.removeItem('nihongo_puzzle_state');
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

  const startNewRound = (isSkip = false) => {
    if (round >= totalRounds && (roundComplete || isSkip)) {
        onComplete(score);
        return;
    }
    
    if (isSkip) {
        setRound(prev => prev + 1);
    }

    const targetIdx = Math.floor(Math.random() * KANA_DATA.length);
    const target = KANA_DATA[targetIdx];
    let distractorIdx = Math.floor(Math.random() * KANA_DATA.length);
    while (distractorIdx === targetIdx) {
      distractorIdx = Math.floor(Math.random() * KANA_DATA.length);
    }
    const distractor = KANA_DATA[distractorIdx];
    
    setTargetKana(target);
    setSlots([null, null, null, null]);
    setRoundComplete(false);
    setLastRoundPoints(null);
    setTimeLeft(30);

    const correctPieces: Piece[] = [0, 1, 2, 3].map(q => ({
      id: `correct-${q}-${Math.random()}`,
      char: target.char,
      quadrant: q
    }));

    const distractorPiece: Piece = {
      id: `wrong-${Math.random()}`,
      char: distractor.char,
      quadrant: Math.floor(Math.random() * 4)
    };

    setCandidates(shuffleArray([...correctPieces, distractorPiece]));

    if (timerRef.current) clearInterval(timerRef.current);
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
    startNewRound();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const onDragStart = (e: React.DragEvent, piece: Piece) => {
    if (roundComplete) return;
    e.dataTransfer.setData("pieceId", piece.id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    if (roundComplete) return;
    e.preventDefault();
    const pieceId = e.dataTransfer.getData("pieceId");
    const piece = candidates.find(p => p.id === pieceId);
    
    if (piece) {
      const newSlots = [...slots];
      const existingIdx = newSlots.findIndex(s => s?.id === piece.id);
      if (existingIdx !== -1) newSlots[existingIdx] = null;
      
      newSlots[index] = piece;
      setSlots(newSlots);

      if (newSlots.every(s => s !== null)) {
        const isAllCorrect = newSlots.every((s, i) => 
          s?.char === targetKana?.char && s?.quadrant === i
        );
        
        if (isAllCorrect) {
          if (timerRef.current) clearInterval(timerRef.current);
          
          const roundPoints = calculateScore(timeLeft);
          const newScore = score + roundPoints;
          
          setScore(newScore);
          setLastRoundPoints(roundPoints);
          setRoundComplete(true);
          
          if (round < totalRounds) {
            saveState(round + 1, newScore);
          } else {
            clearState();
          }
          
          setTimeout(() => {
            if (round < totalRounds) {
                setRound(prev => prev + 1);
                startNewRound();
            } else {
                onComplete(newScore);
            }
          }, 1500);
        }
      }
    }
  };

  const handleSlotClick = (index: number) => {
    if (roundComplete) return;
    if (slots[index]) {
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
    }
  };

  const renderFragmentContent = (char: string, quadrant: number, isLarge: boolean = false) => {
    const positions = [
      { top: '0', left: '0' },
      { top: '0', left: '-100%' },
      { top: '-100%', left: '0' },
      { top: '-100%', left: '-100%' }
    ];

    return (
      <div className="relative w-full h-full pointer-events-none overflow-hidden bg-white select-none">
        <div 
          className="absolute w-[200%] h-[200%] flex items-center justify-center font-black text-gray-800"
          style={{
            top: positions[quadrant].top,
            left: positions[quadrant].left,
            fontSize: isLarge ? '180px' : '120px',
            lineHeight: '1',
          }}
        >
          {char}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center py-2 space-y-4 animate-in fade-in duration-500 min-h-[600px] w-full max-w-sm mx-auto">
      {/* 头部导航与状态 */}
      <div className="w-full flex items-center justify-between mb-2">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#FF6B6B] transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex gap-4 items-center">
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase leading-none">进度</p>
                <p className="text-lg font-black text-gray-700">{round}/{totalRounds}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase leading-none">总分</p>
                <p className="text-lg font-black text-[#4ECDC4]">{score}</p>
            </div>
        </div>
      </div>

      {/* 状态面板 */}
      <div className="w-full bg-white py-4 px-6 rounded-[2.5rem] border-2 border-[#FFE66D]/30 shadow-sm flex items-center justify-between relative overflow-hidden">
        {roundComplete && (
            <div className="absolute inset-0 bg-[#4ECDC4] flex items-center justify-center animate-in slide-in-from-top duration-300 z-10">
                <span className="text-white font-black text-lg">正解！+{lastRoundPoints} 分</span>
            </div>
        )}
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase">当前目标</span>
            <span className="text-4xl font-black text-[#FF6B6B]">{targetKana?.char}</span>
        </div>
        
        <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase">倒计时</span>
            <span className={`text-3xl font-black transition-colors ${timeLeft === 0 ? 'text-gray-200' : timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                {timeLeft}s
            </span>
        </div>
      </div>

      <div className="h-6 flex items-center">
        {timeLeft === 0 && (
            <p className="text-[10px] text-red-500 font-black bg-red-50 px-3 py-0.5 rounded-full animate-pulse border border-red-100">时间到</p>
        )}
      </div>

      {/* 田字格 - 放大居中 */}
      <div className="w-full aspect-square max-w-[300px] grid grid-cols-2 gap-1.5 bg-gray-100 p-2.5 rounded-[3rem] shadow-inner border-4 border-white relative">
        {slots.map((slot, i) => (
          <div
            key={`slot-${i}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, i)}
            onClick={() => handleSlotClick(i)}
            className={`w-full h-full rounded-[1.8rem] overflow-hidden flex items-center justify-center transition-all border-2 border-dashed relative group ${
              !slot 
                ? 'bg-white/50 border-gray-200' 
                : 'bg-white border-[#4ECDC4] shadow-md border-solid'
            } ${roundComplete && slot?.char === targetKana?.char && slot?.quadrant === i ? 'ring-4 ring-[#4ECDC4] ring-inset' : ''}`}
          >
            {slot ? renderFragmentContent(slot.char, slot.quadrant, true) : (
              <div className="text-[10px] text-gray-300 font-black opacity-40 select-none">
                {['左上','右上','左下','右下'][i]}
              </div>
            )}
          </div>
        ))}
        {/* 中心十字线 */}
        <div className="absolute top-1/2 left-6 right-6 h-[2px] bg-white/60 pointer-events-none rounded-full -translate-y-1/2"></div>
        <div className="absolute left-1/2 top-6 bottom-6 w-[2px] bg-white/60 pointer-events-none rounded-full -translate-x-1/2"></div>
      </div>

      {/* 选项碎片 - 移至下方 */}
      <div className="w-full pt-4">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center mb-3">拼图碎片</p>
        <div className="flex flex-wrap justify-center gap-3">
          {candidates.map((piece) => (
            <div
              key={piece.id}
              draggable={!slots.some(s => s?.id === piece.id) && !roundComplete}
              onDragStart={(e) => onDragStart(e, piece)}
              className={`w-16 h-16 rounded-[1.25rem] overflow-hidden border-2 transition-all shadow-sm ${
                roundComplete ? 'cursor-default' : 'cursor-grab active:cursor-grabbing active:scale-110 active:shadow-lg'
              } ${
                slots.some(s => s?.id === piece.id) 
                  ? 'opacity-20 grayscale border-gray-100 scale-90' 
                  : 'border-white hover:border-[#4ECDC4]'
              }`}
            >
              {renderFragmentContent(piece.char, piece.quadrant, false)}
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex flex-col items-center gap-4 pt-6 w-full">
        <button 
          onClick={() => startNewRound(true)}
          className="bg-white px-10 py-3 rounded-full text-sm font-black text-gray-400 hover:text-[#FF6B6B] border-2 border-gray-100 shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <span>这题太难了，换一题</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};

export default PuzzleGame;
