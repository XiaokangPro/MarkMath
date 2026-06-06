export type BlockType = 'text' | 'image' | 'audio' | 'choice' | 'link';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
  backContent?: string;
  backColor?: string;
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
  backColor?: string;
  annotations?: string;
  compositeUrl?: string;
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

export interface CardPack {
  id: string;
  title: string;
  cards: Card[];
  createdAt: number;
  updatedAt: number;
}

export const CLOZE_COLORS = ['#8C8E54', '#73A0CD', '#E1655D', '#E5B75A', '#9891AE'];
export const FONT_COLORS = ['#F9F0D8', '#ECEA8D', '#8C8E54', '#E5B75A', '#E1655D', '#6D7A96', '#73A0CD', '#9891AE', '#4E4549', '#302E29', '#FFFFFF', '#EDE9E1', '#C3E6D5', '#EAE4B3', '#EAC0A4', '#A1AFC3', '#AED0F0', '#D2CEE0', '#DED3C6', '#D5D5D5'];
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
export const BG_COLORS = ['transparent', '#F9F0D8', '#ECEA8D', '#8C8E54', '#E5B75A', '#E1655D', '#6D7A96', '#73A0CD', '#9891AE', '#4E4549', '#302E29', '#FFFFFF', '#EDE9E1', '#C3E6D5', '#EAE4B3', '#EAC0A4', '#A1AFC3', '#AED0F0', '#D2CEE0', '#DED3C6', '#D5D5D5'];
export const EMOJIS = [
  '😀','😂','🤣','😊','😍','🤔','😅','😭','😤','🥺',
  '👍','👎','👏','🙏','💪','✌️','🤝','👋','✨','🔥',
  '❤️','💯','⭐','🎉','🎊','💡','📝','📌','✅','❌',
  '⚡','🌟','🏆','🎯','💎','🔑','📚','🧠','💬','🤖',
];
