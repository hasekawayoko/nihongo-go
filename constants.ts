
import { StudentStats, ClassData, LearningModule } from './types';

export const MOCK_CLASSES: ClassData[] = [
  { id: 'c1', name: '日语入门 A班', studentCount: 25, avgCompletion: 78 },
  { id: 'c2', name: '大学日语 B班', studentCount: 22, avgCompletion: 82 },
  { id: 'c3', name: '商务日语初级', studentCount: 18, avgCompletion: 65 },
];

export const MOCK_STUDENTS: StudentStats[] = [
  { id: 's1', name: '李华', className: '日语入门 A班', loginCount: 12, streakDays: 5, completionRate: 85, puzzleAccuracy: 92, pronunciationScore: 88, totalPoints: 1250 },
  { id: 's2', name: '张伟', className: '日语入门 A班', loginCount: 8, streakDays: 2, completionRate: 60, puzzleAccuracy: 75, pronunciationScore: 70, totalPoints: 800 },
  { id: 's3', name: '陈洁', className: '大学日语 B班', loginCount: 15, streakDays: 12, completionRate: 95, puzzleAccuracy: 98, pronunciationScore: 94, totalPoints: 2100 },
];

export const MODULES: LearningModule[] = [
  { id: 'm1', title: '假名大作战', description: '随机挑战46个基础五十音', difficulty: 'Beginner', type: 'KANA' },
  { id: 'm2', title: '五十音拼拼乐', description: '碎片拼图挑战，限时训练反应力', difficulty: 'Beginner', type: 'VOCAB' }, // Repurposing VOCAB type for the new puzzle game
  { id: 'm3', title: '发音实验室', description: 'AI智能发音评测（正在开发中）', difficulty: 'Beginner', type: 'PRONUNCIATION' },
];

export const KANA_DATA = [
  { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
  { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' },
  { char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' },
  { char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' },
  { char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' },
  { char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' },
  { char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' },
  { char: 'や', romaji: 'ya' }, { char: 'ゆ', romaji: 'yu' }, { char: 'よ', romaji: 'yo' },
  { char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' },
  { char: 'わ', romaji: 'wa' }, { char: 'を', romaji: 'wo' }, { char: 'ん', romaji: 'n' }
];

export const PRONUNCIATION_PHRASES = [
  { id: 1, text: 'こんにちは', reading: 'こんにちは', meaning: '你好' },
  { id: 2, text: 'ありがとうございます', reading: 'ありがとうございます', meaning: '谢谢' },
  { id: 3, text: '日本語を勉強しています', reading: 'にほんごをべんきょうしています', meaning: '我正在学习日语' },
  { id: 4, text: '美味しいです', reading: 'おいしいです', meaning: '很好吃' },
  { id: 5, text: 'はじめまして', reading: 'はじめまして', meaning: '初次见面' },
  { id: 6, text: 'お元気ですか', reading: 'おげんきですか', meaning: '你好吗？' },
];

export const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  background: '#FFFAF0',
};
