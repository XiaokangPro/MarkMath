export type BlockType = 'text' | 'image' | 'audio' | 'choice' | 'link';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
  backContent?: string;
  isDoubleSided: boolean;
  bgColor?: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  dataUrl: string;
  caption?: string;
  bgColor?: string;
  isDoubleSided?: boolean;
  backContent?: string;
}

export interface AudioBlock {
  id: string;
  type: 'audio';
  dataUrl: string;
  label?: string;
  bgColor?: string;
}

export interface ChoiceBlock {
  id: string;
  type: 'choice';
  options: { id: string; text: string; isCorrect: boolean }[];
  bgColor?: string;
}

export interface LinkBlock {
  id: string;
  type: 'link';
  url: string;
  title: string;
  bgColor?: string;
}

export type Block = TextBlock | ImageBlock | AudioBlock | ChoiceBlock | LinkBlock;

export interface Card {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export const CLOZE_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'];
export const FONT_COLORS = ['#333333', '#E91E63', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#795548'];
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
export const BG_COLORS = ['transparent', '#FFF9C4', '#E3F2FD', '#E8F5E9', '#FCE4EC', '#F3E5F5', '#FBE9E7', '#E0F7FA'];
export const EMOJIS = [
  '😀','😂','🤣','😊','😍','🤔','😅','😭','😤','🥺',
  '👍','👎','👏','🙏','💪','✌️','🤝','👋','✨','🔥',
  '❤️','💯','⭐','🎉','🎊','💡','📝','📌','✅','❌',
  '⚡','🌟','🏆','🎯','💎','🔑','📚','🧠','💬','🤖',
];
