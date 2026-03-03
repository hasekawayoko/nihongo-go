
import React, { useState, useEffect } from 'react';
import { MOCK_CLASSES, MOCK_STUDENTS } from '../constants';
import { ResetConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

interface TeacherDashboardProps {
  students: any[];
  onReset: (password: string) => boolean;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ students, onReset }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [resetConfig, setResetConfig] = useState<ResetConfig>({ day: 1, hour: 12 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('nihongo_reset_config');
    if (saved) {
      setResetConfig(JSON.parse(saved));
    }
  }, []);

  const updateResetDay = (day: number) => {
    const newConfig = { ...resetConfig, day };
    setResetConfig(newConfig);
    localStorage.setItem('nihongo_reset_config', JSON.stringify(newConfig));
  };

  const exportData = () => {
    const csvRows = [
      ['学号', '学生姓名', '班级', '总积分'],
      ...students.map(s => [s.studentId, s.name, s.className, s.totalPoints.toString()])
    ];
    
    const csvContent = "\uFEFF" + csvRows.map(e => e.join(",")).join("\n"); // Add BOM for Excel Chinese support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "日语起跑线_学生学情报告.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group students by class
  const classes = Array.from(new Set(students.map(s => s.className))).map(className => {
    const classStudents = students.filter(s => s.className === className);
    return {
      name: className,
      studentCount: classStudents.length,
      avgPoints: classStudents.reduce((acc, curr) => acc + curr.totalPoints, 0) / classStudents.length
    };
  });

  const chartData = classes.map(c => ({
    name: c.name,
    points: c.avgPoints,
  }));

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-gray-800">班级学情概览</h2>
        <button 
          onClick={exportData}
          className="bg-[#4ECDC4] text-white text-xs px-4 py-2.5 rounded-2xl font-black hover:bg-[#45BDB5] shadow-lg flex items-center gap-2 transition-transform active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          导出 Excel
        </button>
      </header>

      {/* Stats Summary */}
      <section className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-100 shadow-sm h-72">
        <p className="text-gray-400 text-[10px] font-black mb-6 uppercase tracking-widest text-center">各班平均积分概览</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#F9FAFB'}}
                contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="points" radius={[10, 10, 0, 0]} barSize={35}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FF6B6B' : '#4ECDC4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-300 font-bold text-sm italic">暂无学生数据</div>
        )}
      </section>

      {/* Reset Data Button */}
      <section className="pt-8 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <div>
            <h3 className="font-black text-gray-800">积分清零管理</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">点击下方按钮手动清空所有学生积分</p>
          </div>
        </div>

        {!showResetConfirm ? (
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="w-full bg-red-50 text-red-500 py-5 rounded-3xl font-black text-base hover:bg-red-100 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            立即执行全员积分清零
          </button>
        ) : (
          <div className="bg-red-50 p-6 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <p className="text-red-600 font-black text-center text-sm">⚠️ 确定要清空所有学生数据吗？此操作不可逆！</p>
            <input 
              type="password" 
              placeholder="请输入管理员密码" 
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-red-100 focus:ring-2 focus:ring-red-500 outline-none font-bold text-center"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowResetConfirm(false); setResetPassword(''); }}
                className="flex-1 bg-white text-gray-400 py-3 rounded-xl font-black text-xs border border-gray-100"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (onReset(resetPassword)) {
                    setShowResetConfirm(false);
                    setResetPassword('');
                  }
                }}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all"
              >
                确认清零
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="space-y-4">
        <h3 className="font-black text-gray-800 px-1">班级管理</h3>
        <div className="grid grid-cols-1 gap-3">
          {classes.length > 0 ? classes.map(c => (
            <div 
              key={c.name} 
              className="bg-white p-5 rounded-[2rem] border-2 border-gray-50 shadow-sm flex justify-between items-center group hover:border-blue-100 transition-colors"
            >
              <div>
                <h4 className="font-black text-gray-800 text-base">{c.name}</h4>
                <p className="text-xs text-gray-400 font-bold">{c.studentCount} 位活跃学生</p>
              </div>
              <button 
                onClick={() => setSelectedClass(selectedClass === c.name ? null : c.name)}
                className="bg-gray-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-50 transition-colors"
              >
                {selectedClass === c.name ? '收起详情' : '查看进度'}
              </button>
            </div>
          )) : (
            <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-100 text-center text-gray-300 font-bold">
              暂无班级信息
            </div>
          )}
        </div>
      </section>

      {/* Student List (Conditional) */}
      {selectedClass && (
        <section className="space-y-4 animate-in slide-in-from-top-4 duration-500 pb-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-gray-800">学生明细</h3>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest bg-gray-100 px-2 py-1 rounded-lg">{selectedClass}</span>
          </div>
          <div className="bg-white rounded-[2rem] border-2 border-gray-50 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-4 font-black">姓名</th>
                  <th className="px-5 py-4 font-black text-center">学号</th>
                  <th className="px-5 py-4 font-black text-right">积分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-gray-600">
                {students.filter(s => s.className === selectedClass).map(s => (
                  <tr key={s.studentId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4 text-gray-800">{s.name}</td>
                    <td className="px-5 py-4 text-center">{s.studentId}</td>
                    <td className="px-5 py-4 text-right font-black text-blue-500">{s.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reset Data Button (Removed redundant section) */}
    </div>
  );
};

export default TeacherDashboard;
