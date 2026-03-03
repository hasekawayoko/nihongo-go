
import React, { useEffect, useState } from 'react';
import { MODULES } from '../constants';
import { generateStudyEncouragement } from '../services/geminiService';
import confetti from 'canvas-confetti';

interface StudentHomeProps {
  onSelectModule: (moduleId: string) => void;
  studentData: { 
    name: string; 
    className: string; 
    studentId: string; 
    totalPoints: number;
    kanaCount?: number;
    puzzleCount?: number;
  };
  allStudents: any[];
}

const StudentHome: React.FC<StudentHomeProps> = ({ onSelectModule, studentData, allStudents }) => {
  const [zen, setZen] = useState<string>('正在获取每日寄语...');
  const [showRanking, setShowRanking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // 连续学习天数模拟数据
  const streakDays = 5; 

  // Check if both tasks are completed today (1 session of each = 30 Kana + 20 Puzzle)
  const isAllDone = (studentData.kanaCount || 0) >= 1 && (studentData.puzzleCount || 0) >= 1;

  useEffect(() => {
    generateStudyEncouragement(studentData).then(res => {
      if (res) setZen(res);
    }).catch(() => setZen('加油！每天进步一点点。'));
  }, [studentData.name]);

  useEffect(() => {
    if (isAllDone) {
      const hasCelebrated = sessionStorage.getItem(`celebrated_${studentData.studentId}_${new Date().toLocaleDateString()}`);
      if (!hasCelebrated) {
        setShowCelebration(true);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FFD93D', '#6BCB77']
        });
        sessionStorage.setItem(`celebrated_${studentData.studentId}_${new Date().toLocaleDateString()}`, 'true');
        setTimeout(() => setShowCelebration(false), 5000);
      }
    }
  }, [isAllDone, studentData.studentId]);

  // 使用最新传入的 allStudents 数据生成实时排行榜
  const leaderboard = [...allStudents]
    .filter(s => s.totalPoints > 0)
    .map(s => ({ 
      name: s.name, 
      totalPoints: s.totalPoints, 
      isMe: s.studentId === studentData.studentId 
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  const myRank = leaderboard.findIndex(s => s.isMe) + 1;

  if (showRanking) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-1">
          <button onClick={() => setShowRanking(false)} className="p-2 text-gray-400 hover:text-[#FF6B6B] transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="font-black text-gray-800 text-xl text-center flex-1 pr-10">班级排行榜</h3>
        </div>

        <div className="bg-white rounded-[3rem] border-2 border-gray-100 overflow-hidden shadow-xl">
          <div className="p-6 bg-gradient-to-r from-[#FFE66D] to-[#FFD93D] flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-[#8B6E00] uppercase tracking-widest">我的班级</p>
              <h4 className="font-black text-gray-800">{studentData.className}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-[#8B6E00] uppercase tracking-widest">当前排名</p>
              <h4 className="text-2xl font-black text-gray-800">第 {myRank} 名</h4>
            </div>
          </div>
          
          <div className="divide-y divide-gray-50">
            {leaderboard.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center p-5 transition-colors ${item.isMe ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mr-4 ${
                  index === 0 ? 'bg-[#FFE66D] text-white shadow-sm ring-2 ring-white' :
                  index === 1 ? 'bg-gray-200 text-white shadow-sm ring-2 ring-white' :
                  index === 2 ? 'bg-[#CD7F32] text-white shadow-sm ring-2 ring-white' :
                  'text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <span className={`font-black ${item.isMe ? 'text-[#FF6B6B]' : 'text-gray-700'}`}>
                    {item.name} {item.isMe && <span className="text-[8px] bg-[#FF6B6B] text-white px-1.5 py-0.5 rounded-full ml-1 uppercase">我</span>}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-800">{item.totalPoints}</span>
                  <span className="text-[10px] text-gray-400 font-bold ml-1">分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 欢迎语与每日一语 */}
      <section className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] p-7 rounded-3xl text-white shadow-[0_10px_20px_rgba(255,107,107,0.3)] relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <h2 className="text-2xl font-black mb-1 drop-shadow-sm">おはよう、{studentData.name}桑!</h2>
        <p className="text-white/90 text-sm italic font-medium mt-2 leading-relaxed">"{zen}"</p>
        
        <div className="mt-6 flex flex-wrap gap-2">
          <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md text-[10px] font-black border border-white/10">
            🔥 连续学习 {streakDays} 天
          </div>
        </div>
      </section>

      {/* 核心指标卡片：积分与排名 */}
      <section className="grid grid-cols-2 gap-4">
        {/* 累计积分卡片 */}
        <div className="bg-white p-5 rounded-3xl border-b-4 border-r-4 border-orange-100 shadow-sm">
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-2">累计积分</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-orange-500">{studentData.totalPoints}</span>
            <span className="text-sm font-bold text-orange-300">分</span>
          </div>
          <div className="w-full bg-orange-50 h-2.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-orange-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(251,146,60,0.5)]" 
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        {/* 班级排名卡片 - 点击进入排行榜 */}
        <button 
          onClick={() => setShowRanking(true)}
          className="bg-white p-5 rounded-3xl border-b-4 border-r-4 border-indigo-100 shadow-sm text-left active:scale-95 transition-all group"
        >
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-2">班级排名</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-indigo-500 group-hover:scale-110 transition-transform inline-block">第 {myRank}</span>
            <span className="text-sm font-bold text-indigo-300">名</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-black text-indigo-400 bg-indigo-50 px-3 py-1.5 rounded-xl">
            <span>排行榜</span>
            <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>
      </section>

      {/* 模块列表 */}
      <section className="space-y-4 pb-4 relative">
        {showCelebration && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-12 py-8 rounded-[3rem] shadow-2xl border-4 border-[#FFE66D] animate-in zoom-in duration-500 flex flex-col items-center gap-4">
              <span className="text-6xl">🎉</span>
              <h2 className="text-3xl font-black text-gray-800">辛苦了！</h2>
              <p className="text-gray-500 font-bold text-center">今日挑战全部达成<br/>你是最棒的！</p>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-gray-800 text-lg">学习路径</h3>
          <span className="text-xs text-[#FF6B6B] font-black uppercase tracking-wider">全部挑战</span>
        </div>
        {MODULES.map((m) => {
          const isLocked = m.id === 'm3';
          const kanaLimitReached = m.id === 'm1' && (studentData.kanaCount || 0) >= 1;
          const puzzleLimitReached = m.id === 'm2' && (studentData.puzzleCount || 0) >= 1;
          const isLimitReached = kanaLimitReached || puzzleLimitReached;

          return (
            <button
              key={m.id}
              disabled={isLocked || isLimitReached}
              onClick={() => onSelectModule(m.id)}
              className={`w-full bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm flex items-center gap-5 transition-all group text-left relative active:scale-95 ${
                isLocked || isLimitReached ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#FF6B6B] hover:-translate-y-1'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner text-2xl font-black ${
                m.id === 'm1' ? 'bg-[#FFEDED] text-[#FF6B6B]' : 
                m.id === 'm2' ? 'bg-[#EFFFFD] text-[#4ECDC4]' : 'bg-[#FFF9E5] text-[#F9BD3D]'
              }`}>
                {m.id === 'm1' && 'あ'}
                {m.id === 'm2' && '🧩'}
                {m.id === 'm3' && '🎤'}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-gray-800 text-lg group-hover:text-[#FF6B6B] transition-colors leading-tight">
                  {m.title}
                  {isLimitReached && <span className="text-[10px] ml-2 text-red-500">(今日已达上限)</span>}
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-1">{m.description}</p>
              </div>
              <div className="text-gray-200 group-hover:text-[#FF6B6B] transition-colors">
                {isLocked ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                )}
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
};

export default StudentHome;
