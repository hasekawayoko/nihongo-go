
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
  title: string;
}

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="66" cy="38" r="26" fill="#E62117" />
    <path d="M10 82 L75 82 L42.5 28 Z" fill="#E62117" />
    <defs>
      <mask id="overlapMaskLayout">
        <rect x="0" y="0" width="100" height="100" fill="black" />
        <circle cx="66" cy="38" r="26" fill="white" />
      </mask>
    </defs>
    <path d="M10 82 L75 82 L42.5 28 Z" fill="white" mask="url(#overlapMaskLayout)" />
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, title }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#FFFAF0] overflow-hidden">
      {/* 顶部固定栏 */}
      <header className="flex-none bg-white/95 backdrop-blur-md px-6 py-4 flex justify-between items-center z-30 border-b border-gray-100 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-base font-black text-gray-800">{title}</h1>
        </div>
        <button 
          onClick={onLogout}
          className="bg-gray-100 text-gray-400 p-2 rounded-full active:scale-90 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </header>

      {/* 核心内容区：独立滚动，解决 Safari 兼容性 */}
      <main className="flex-1 overflow-y-auto scrolling-touch px-5 py-6 pb-24">
        <div className="max-w-xl mx-auto"> {/* 电脑端保持内容居中但不限制外框 */}
          {children}
        </div>
      </main>

      {/* 底部导航 */}
      <nav className="flex-none bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center pt-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] px-4 z-30">
        <button className="flex flex-col items-center gap-1 text-[#FF6B6B]">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 00-1.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          <span className="text-[10px] font-black uppercase">学习</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[10px] font-black uppercase">统计</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-black uppercase">设置</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
