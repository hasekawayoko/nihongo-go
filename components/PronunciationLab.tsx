
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, RotateCcw, ChevronRight, ChevronLeft, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRONUNCIATION_PHRASES } from '../constants';
import { getPronunciationFeedback } from '../services/geminiService';

interface PronunciationLabProps {
  onBack: () => void;
  onComplete: (points: number) => void;
}

const PronunciationLab: React.FC<PronunciationLabProps> = ({ onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const currentPhrase = PRONUNCIATION_PHRASES[currentIndex];

  useEffect(() => {
    // 初始化语音识别
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ja-JP';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          setTranscription(result[0].transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError('录音出错了，请检查麦克风权限');
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setError('您的浏览器不支持语音识别，请使用 Chrome 或 Safari');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setTranscription('');
    setFeedback(null);
    setError(null);
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsRecording(false);
  };

  const analyzePronunciation = async () => {
    if (!transcription) return;
    setIsAnalyzing(true);
    try {
      const result = await getPronunciationFeedback(currentPhrase.text, transcription);
      setFeedback(result);
      if (result.score >= 80) {
        onComplete(Math.floor(result.score / 10)); // 奖励积分
      }
    } catch (err) {
      console.error(err);
      setError('分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextPhrase = () => {
    if (currentIndex < PRONUNCIATION_PHRASES.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTranscription('');
      setFeedback(null);
      setError(null);
    }
  };

  const prevPhrase = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTranscription('');
      setFeedback(null);
      setError(null);
    }
  };

  const playReference = () => {
    const utterance = new SpeechSynthesisUtterance(currentPhrase.text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="p-2 text-gray-400 hover:text-[#FF6B6B] transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex flex-col items-center">
          <h3 className="font-black text-gray-800 text-xl">发音实验室</h3>
          <span className="text-[10px] font-black text-[#4ECDC4] uppercase tracking-widest">AI Pronunciation Lab</span>
        </div>
        <div className="w-12"></div>
      </div>

      {/* 进度条 */}
      <div className="px-2">
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-[#4ECDC4] h-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / PRONUNCIATION_PHRASES.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          <span>挑战进度</span>
          <span>{currentIndex + 1} / {PRONUNCIATION_PHRASES.length}</span>
        </div>
      </div>

      {/* 核心卡片 */}
      <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-xl p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-4 right-6 text-[#4ECDC4]/10">
          <Sparkles size={80} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-400">{currentPhrase.reading}</p>
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">{currentPhrase.text}</h2>
          <p className="text-lg font-bold text-[#FF6B6B]">{currentPhrase.meaning}</p>
        </div>

        <button 
          onClick={playReference}
          className="flex items-center gap-2 px-6 py-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
        >
          <Volume2 size={18} />
          <span className="text-sm font-black">听范读</span>
        </button>

        <div className="w-full h-px bg-gray-50 my-4"></div>

        {/* 录音区域 */}
        <div className="w-full space-y-6">
          <div className="relative flex justify-center items-center h-32">
            <AnimatePresence>
              {isRecording && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute w-24 h-24 bg-[#FF6B6B] rounded-full"
                />
              )}
            </AnimatePresence>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                isRecording ? 'bg-gray-800 text-white' : 'bg-[#FF6B6B] text-white'
              }`}
            >
              {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
            </button>
          </div>

          <p className={`text-sm font-black transition-colors ${isRecording ? 'text-[#FF6B6B] animate-pulse' : 'text-gray-400'}`}>
            {isRecording ? '正在倾听...' : transcription ? '录制完成' : '点击麦克风开始说话'}
          </p>

          {transcription && !isRecording && !feedback && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">识别结果</p>
                <p className="text-xl font-black text-gray-700">{transcription}</p>
              </div>
              <button
                onClick={analyzePronunciation}
                disabled={isAnalyzing}
                className="w-full bg-[#4ECDC4] text-white py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI 正在拼命分析...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>获取 AI 评分</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-50 py-2 px-4 rounded-xl">{error}</p>
          )}
        </div>

        {/* 反馈区域 */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-gradient-to-br from-white to-gray-50 rounded-[2rem] border-2 border-[#4ECDC4]/30 p-6 space-y-4 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black text-[#4ECDC4] uppercase tracking-widest">发音得分</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${feedback.score >= 80 ? 'text-[#4ECDC4]' : 'text-orange-400'}`}>
                      {feedback.score}
                    </span>
                    <span className="text-sm font-bold text-gray-400">/ 100</span>
                  </div>
                </div>
                {feedback.score >= 80 && (
                  <div className="bg-[#4ECDC4]/10 p-3 rounded-2xl text-[#4ECDC4]">
                    <CheckCircle2 size={32} />
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-gray-600 leading-relaxed text-left">
                {feedback.feedback}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部控制 */}
      <div className="flex gap-4 px-2 pb-8">
        <button 
          onClick={prevPhrase}
          disabled={currentIndex === 0}
          className="flex-1 bg-white border-2 border-gray-100 py-4 rounded-2xl flex items-center justify-center text-gray-400 disabled:opacity-30 active:scale-95 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => {
            setTranscription('');
            setFeedback(null);
            setError(null);
          }}
          className="flex-1 bg-white border-2 border-gray-100 py-4 rounded-2xl flex items-center justify-center text-gray-400 active:scale-95 transition-all"
        >
          <RotateCcw size={24} />
        </button>
        <button 
          onClick={nextPhrase}
          disabled={currentIndex === PRONUNCIATION_PHRASES.length - 1}
          className="flex-[2] bg-gray-800 text-white py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all shadow-lg"
        >
          <span className="font-black">下一句</span>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default PronunciationLab;
