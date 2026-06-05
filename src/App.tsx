import { useState, useEffect } from 'react';
import { Card } from './types';
import { loadCards, saveCards, generateId } from './store';
import { CardList } from './components/CardList';
import { CardEditor } from './components/CardEditor';

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  useEffect(() => {
    setCards(loadCards());
  }, []);

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  const createNewCard = () => {
    const newCard: Card = {
      id: generateId(),
      title: '',
      blocks: [{ id: generateId(), type: 'text', content: '', isDoubleSided: false }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCards([newCard, ...cards]);
    setActiveCard(newCard);
  };

  const handleSaveCard = (updated: Card) => {
    const titleBlock = updated.blocks.find((b) => b.type === 'text');
    let title = updated.title;
    if (!title && titleBlock && titleBlock.type === 'text') {
      const temp = document.createElement('div');
      temp.innerHTML = titleBlock.content;
      title = (temp.textContent || '').slice(0, 30) || '未命名卡片';
    }
    const savedCard = { ...updated, title };
    setCards(cards.map((c) => (c.id === savedCard.id ? savedCard : c)));
    setActiveCard(savedCard);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  if (activeCard) {
    return (
      <div className="h-screen flex flex-col max-w-2xl mx-auto bg-gray-50">
        <CardEditor
          card={activeCard}
          onSave={handleSaveCard}
          onBack={() => setActiveCard(null)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto bg-gray-50">
      <CardList
        cards={cards}
        onSelect={setActiveCard}
        onDelete={handleDeleteCard}
        onNew={createNewCard}
      />
    </div>
  );
}

export default App;
