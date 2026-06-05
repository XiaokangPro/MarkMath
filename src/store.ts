import { Card, CardPack } from './types';

const PACKS_KEY = 'markmath-packs';
const OLD_CARDS_KEY = 'markmath-cards';

export function loadPacks(): CardPack[] {
  const data = localStorage.getItem(PACKS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  const oldData = localStorage.getItem(OLD_CARDS_KEY);
  if (oldData) {
    try {
      const cards: Card[] = JSON.parse(oldData);
      if (cards.length > 0) {
        const pack: CardPack = {
          id: generateId(),
          title: '我的卡包',
          cards,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const packs = [pack];
        savePacks(packs);
        localStorage.removeItem(OLD_CARDS_KEY);
        return packs;
      }
    } catch {}
  }
  return [];
}

export function savePacks(packs: CardPack[]): void {
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
