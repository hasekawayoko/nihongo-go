
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import Layout from './components/Layout';
import StudentHome from './components/StudentHome';
import TeacherDashboard from './components/TeacherDashboard';
import KanaGame from './components/KanaGame';
import PuzzleGame from './components/PuzzleGame';
import PronunciationLab from './components/PronunciationLab';

interface RegisteredStudent {
  name: string;
  className: string;
  studentId: string;
  totalPoints: number;
  lastActiveDate?: string;
  kanaCount?: number;
  puzzleCount?: number;
}

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="66" cy="38" r="26" fill="#E62117" />
    <path d="M10 82 L75 82 L42.5 28 Z" fill="#E62117" />
    <defs>
      <mask id="overlapMaskApp">
        <rect x="0" y="0" width="100" height="100" fill="black" />
        <circle cx="66" cy="38" r="26" fill="white" />
      </mask>
    </defs>
    <path d="M10 82 L75 82 L42.5 28 Z" fill="white" mask="url(#overlapMaskApp)" />
  </svg>
);

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);
  const [teacherPassword, setTeacherPassword] = useState('');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<RegisteredStudent | null>(null);
  const [allStudents, setAllStudents] = useState<RegisteredStudent[]>([]);
  const [regForm, setRegForm] = useState({ name: '', className: '', studentId: '' });

  useEffect(() => {
    const savedReg = localStorage.getItem('nihongo_student_reg');
    const savedAll = localStorage.getItem('nihongo_all_students');
    
    if (savedReg) {
      const info = JSON.parse(savedReg);
      setStudentInfo(info);
    }
    
    if (savedAll) {
      setAllStudents(JSON.parse(savedAll));
    }
  }, []);

  const handleLogout = () => {
    setRole(null);
    setIsTeacherAuthenticated(false);
    setActiveModule(null);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.name && regForm.className && regForm.studentId) {
      const today = new Date().toLocaleDateString();
      const existingStudent = allStudents.find(s => s.studentId === regForm.studentId);
      
      const newStudent: RegisteredStudent = { 
        ...regForm, 
        totalPoints: existingStudent ? existingStudent.totalPoints : 0,
        lastActiveDate: today,
        kanaCount: existingStudent && existingStudent.lastActiveDate === today ? existingStudent.kanaCount : 0,
        puzzleCount: existingStudent && existingStudent.lastActiveDate === today ? existingStudent.puzzleCount : 0
      };
      
      setStudentInfo(newStudent);
      localStorage.setItem('nihongo_student_reg', JSON.stringify(newStudent));
      
      const updatedAll = [...allStudents.filter(s => s.studentId !== newStudent.studentId), newStudent];
      setAllStudents(updatedAll);
      localStorage.setItem('nihongo_all_students', JSON.stringify(updatedAll));
    }
  };

  const updatePoints = (earned: number, type: 'KANA' | 'PUZZLE') => {
    if (!studentInfo) return;
    
    const today = new Date().toLocaleDateString();
    let { totalPoints, kanaCount = 0, puzzleCount = 0, lastActiveDate } = studentInfo;
    
    // Reset daily counts if it's a new day
    if (lastActiveDate !== today) {
      kanaCount = 0;
      puzzleCount = 0;
      localStorage.removeItem('nihongo_kana_state');
      localStorage.removeItem('nihongo_puzzle_state');
    }
    
    const newTotal = totalPoints + earned;
    const newKana = type === 'KANA' ? kanaCount + 1 : kanaCount;
    const newPuzzle = type === 'PUZZLE' ? puzzleCount + 1 : puzzleCount;
    
    const updatedStudent = { 
      ...studentInfo, 
      totalPoints: newTotal, 
      kanaCount: newKana, 
      puzzleCount: newPuzzle,
      lastActiveDate: today 
    };
    
    setStudentInfo(updatedStudent);
    localStorage.setItem('nihongo_student_reg', JSON.stringify(updatedStudent));
    
    const updatedAll = allStudents.map(s => s.studentId === studentInfo.studentId ? updatedStudent : s);
    setAllStudents(updatedAll);
    localStorage.setItem('nihongo_all_students', JSON.stringify(updatedAll));
  };

  const resetAllData = (password: string) => {
    if (password === '114477') {
      localStorage.removeItem('nihongo_student_reg');
      localStorage.removeItem('nihongo_all_students');
      setStudentInfo(null);
      setAllStudents([]);
      alert('所有数据已清零');
      window.location.reload();
      return true;
    }
    alert('密码错误');
    return false;
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 简单的混淆校验函数，防止直接搜索字符串
    const check = (p: string) => {
      let s = 0;
      for(let i=0; i<p.length; i++) s += p.charCodeAt(i) * (i+1);
      return s === 5741; // Sensei!114477 的特征值
    };

    if (check(teacherPassword)) {
      setIsTeacherAuthenticated(true);
      setRole(UserRole.TEACHER);
      setShowTeacherLogin(false);
      setTeacherPassword('');
    } else {
      alert('口令错误，非请莫入');
    }
  };

  // 1. 角色选择：全屏居中，不设边框限制
  if (!role) {
    return (
      <div className="h-screen w-full bg-[#FFFAF0] flex flex-col items-center justify-center p-8 text-center relative">
        <div className="w-24 h-24 mb-6 transform rotate-3 animate-bounce-slow">
          <Logo className="w-full h-full drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">日语起跑线</h1>
        <p className="text-gray-400 mt-1 font-bold text-xs tracking-widest uppercase mb-12">Japanese Starting Line</p>
        
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => setRole(UserRole.STUDENT)}
            className="w-full bg-[#FF6B6B] text-white py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all"
          >
            我是学生
          </button>
          <button
            onClick={() => setShowTeacherLogin(true)}
            className="w-full bg-white text-gray-400 py-5 rounded-3xl font-black text-lg active:scale-95 transition-all"
          >
            教师入口
          </button>
        </div>

        {/* 教师登录弹窗 */}
        {showTeacherLogin && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-gray-800 mb-6">身份验证</h3>
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <input 
                  autoFocus
                  type="password" 
                  placeholder="请输入教师授权码" 
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FF6B6B] outline-none font-bold text-center"
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowTeacherLogin(false)}
                    className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-sm"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-gray-800 text-white py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
                  >
                    确认进入
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. 注册：简单清爽的卡片
  if (role === UserRole.STUDENT && !studentInfo) {
    return (
      <div className="h-screen w-full bg-[#FFFAF0] flex flex-col p-8 justify-center items-center">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-lg p-10 space-y-6">
          <h2 className="text-2xl font-black text-gray-800 text-center">新成员报到</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input required type="text" value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} placeholder="真实姓名" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#FF6B6B] outline-none font-bold" />
            <input required type="text" value={regForm.className} onChange={(e) => setRegForm({...regForm, className: e.target.value})} placeholder="班级（如：日语A班）" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#FF6B6B] outline-none font-bold" />
            <input required type="text" value={regForm.studentId} onChange={(e) => setRegForm({...regForm, studentId: e.target.value})} placeholder="学号" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#FF6B6B] outline-none font-bold" />
            <button type="submit" className="w-full bg-[#4ECDC4] text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all mt-4">
              进入教室
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (role === UserRole.TEACHER) return <TeacherDashboard students={allStudents} onReset={resetAllData} />;
    if (activeModule === 'm1') return <KanaGame onBack={() => setActiveModule(null)} onComplete={(s) => { updatePoints(s, 'KANA'); setActiveModule(null); }} />;
    if (activeModule === 'm2') return <PuzzleGame onBack={() => setActiveModule(null)} onComplete={(s) => { updatePoints(s, 'PUZZLE'); setActiveModule(null); }} />;
    if (activeModule === 'm3') return null; // Disabled
    return <StudentHome onSelectModule={(id) => setActiveModule(id)} studentData={studentInfo!} allStudents={allStudents} />;
  };

  return (
    <Layout 
      role={role} 
      onLogout={handleLogout} 
      title={role === UserRole.STUDENT ? '日语起跑线' : '管理控制台'}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
