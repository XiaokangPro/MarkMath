import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardPack } from './types';
import { loadPacks, savePacks, generateId } from './store';
import { PackList } from './components/CardList';
import { CardEditor } from './components/CardEditor';

function createNewCard(): Card {
  return {
    id: generateId(),
    title: '',
    blocks: [{ id: generateId(), type: 'text', content: '', isDoubleSided: false }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function App() {
  const [packs, setPacks] = useState<CardPack[]>([]);
  const [activePack, setActivePack] = useState<CardPack | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    setPacks(loadPacks());
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    savePacks(packs);
  }, [packs]);

  const createNewPack = () => {
    const newPack: CardPack = {
      id: generateId(),
      title: '',
      cards: [createNewCard()],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPacks([newPack, ...packs]);
    setActivePack(newPack);
    setActiveCardIndex(0);
  };

  const handleDeletePack = (id: string) => {
    setPacks(packs.filter((p) => p.id !== id));
  };

  const handleSelectPack = (pack: CardPack) => {
    setActivePack(pack);
    setActiveCardIndex(0);
  };

  const handleSaveCard = useCallback((updated: Card) => {
    const savedCard = { ...updated };

    setPacks((prev) =>
      prev.map((p) => {
        if (p.id !== activePack?.id) return p;
        const updatedPack = {
          ...p,
          cards: p.cards.map((c) => (c.id === savedCard.id ? savedCard : c)),
          updatedAt: Date.now(),
        };
        setActivePack(updatedPack);
        return updatedPack;
      })
    );
  }, [activePack?.id]);

  const handleAddCard = () => {
    if (!activePack) return;
    const newCard = createNewCard();
    setPacks((prev) =>
      prev.map((p) => {
        if (p.id !== activePack.id) return p;
        const updatedPack = {
          ...p,
          cards: [...p.cards, newCard],
          updatedAt: Date.now(),
        };
        setActivePack(updatedPack);
        setActiveCardIndex(updatedPack.cards.length - 1);
        return updatedPack;
      })
    );
  };

  const handleDeleteCard = () => {
    if (!activePack || activePack.cards.length <= 1) return;
    setPacks((prev) =>
      prev.map((p) => {
        if (p.id !== activePack.id) return p;
        const newCards = p.cards.filter((_, i) => i !== activeCardIndex);
        const updatedPack = { ...p, cards: newCards, updatedAt: Date.now() };
        setActivePack(updatedPack);
        setActiveCardIndex(Math.min(activeCardIndex, newCards.length - 1));
        return updatedPack;
      })
    );
  };

  const handleBack = () => {
    setActivePack(null);
    setActiveCardIndex(0);
  };

  const handlePackTitleChange = (title: string) => {
    if (!activePack) return;
    setPacks((prev) =>
      prev.map((p) => {
        if (p.id !== activePack.id) return p;
        const updatedPack = { ...p, title, updatedAt: Date.now() };
        setActivePack(updatedPack);
        return updatedPack;
      })
    );
  };

  const handleCardTitleChange = (title: string) => {
    if (!activePack) return;
    setPacks((prev) =>
      prev.map((p) => {
        if (p.id !== activePack.id) return p;
        const newCards = p.cards.map((c, i) =>
          i === activeCardIndex ? { ...c, title, updatedAt: Date.now() } : c
        );
        const updatedPack = { ...p, cards: newCards, updatedAt: Date.now() };
        setActivePack(updatedPack);
        return updatedPack;
      })
    );
  };

  const handleJumpToCard = (packId: string, cardIndex: number) => {
    const pack = packs.find((p) => p.id === packId);
    if (pack) {
      setActivePack(pack);
      setActiveCardIndex(cardIndex);
    }
  };

  if (activePack) {
    const currentCard = activePack.cards[activeCardIndex];
    const totalCards = activePack.cards.length;

    return (
      <div className="h-screen flex flex-col max-w-2xl mx-auto bg-gray-50">
        <div className="flex items-center gap-3 p-3 bg-white border-b border-gray-200">
          <button
            className="text-blue-500 hover:text-blue-700 text-sm shrink-0"
            onClick={handleBack}
          >
            ← 返回
          </button>
          <div className="relative inline-grid items-center min-w-[40px]">
            <span className="invisible whitespace-pre text-sm font-medium px-0 col-start-1 row-start-1">
              {activePack.title || '卡包名称...'}
            </span>
            <input
              type="text"
              className="col-start-1 row-start-1 text-sm font-medium border-none outline-none bg-transparent w-full"
              placeholder="卡包名称..."
              value={activePack.title}
              onChange={(e) => handlePackTitleChange(e.target.value)}
            />
          </div>
          <div className="shrink-0 ml-auto">
            <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-full px-2 py-px relative">
              <span className="text-xs whitespace-pre invisible">{currentCard.title || '命名'}</span>
              <input
                type="text"
                className="absolute inset-0 text-xs text-gray-500 bg-transparent border-none outline-none rounded-full px-2 py-px focus:text-gray-700 w-full text-center"
                placeholder="命名"
                value={currentCard.title}
                onChange={(e) => handleCardTitleChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <CardEditor
            key={currentCard.id}
            card={currentCard}
            onSave={handleSaveCard}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-white border-t border-gray-200">
          <button
            className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => setActiveCardIndex(activeCardIndex - 1)}
            disabled={activeCardIndex === 0}
          >
            ‹ 上一张
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {activeCardIndex + 1} / {totalCards}
            </span>
            <button
              className="text-xs text-blue-500 hover:text-blue-700"
              onClick={handleAddCard}
            >
              + 新建卡片
            </button>
            {totalCards > 1 && (
              <button
                className="text-xs text-red-400 hover:text-red-600"
                onClick={() => {
                  if (confirm('确定删除当前卡片吗？')) handleDeleteCard();
                }}
              >
                删除
              </button>
            )}
          </div>
          <button
            className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => setActiveCardIndex(activeCardIndex + 1)}
            disabled={activeCardIndex === totalCards - 1}
          >
            下一张 ›
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto bg-gray-50">
      <PackList
        packs={packs}
        onSelect={handleSelectPack}
        onDelete={handleDeletePack}
        onNew={createNewPack}
        onJumpToCard={handleJumpToCard}
      />
    </div>
  );
}

export default App;
