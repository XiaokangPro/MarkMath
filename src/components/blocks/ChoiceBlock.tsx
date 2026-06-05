import React from 'react';
import { ChoiceBlock as ChoiceBlockType } from '../../types';
import { generateId } from '../../store';

interface Props {
  block: ChoiceBlockType;
  isEditing: boolean;
  onUpdate: (block: ChoiceBlockType) => void;
}

export function ChoiceBlock({ block, isEditing, onUpdate }: Props) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [showAnswer, setShowAnswer] = React.useState(false);

  const addOption = () => {
    onUpdate({
      ...block,
      options: [...block.options, { id: generateId(), text: '', isCorrect: false }],
    });
  };

  const updateOption = (id: string, text: string) => {
    onUpdate({
      ...block,
      options: block.options.map((o) => (o.id === id ? { ...o, text } : o)),
    });
  };

  const toggleCorrect = (id: string) => {
    onUpdate({
      ...block,
      options: block.options.map((o) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)),
    });
  };

  const removeOption = (id: string) => {
    onUpdate({
      ...block,
      options: block.options.filter((o) => o.id !== id),
    });
  };

  if (!isEditing) {
    return (
      <div className="w-full">
        <div className="space-y-2">
          {block.options.map((opt) => {
            let bgClass = 'bg-white border-gray-200';
            if (showAnswer) {
              if (opt.isCorrect) bgClass = 'bg-green-50 border-green-400';
              else if (selected === opt.id) bgClass = 'bg-red-50 border-red-400';
            } else if (selected === opt.id) {
              bgClass = 'bg-blue-50 border-blue-400';
            }
            return (
              <div
                key={opt.id}
                className={`border rounded-lg px-4 py-2 cursor-pointer transition-colors ${bgClass}`}
                onClick={() => {
                  setSelected(opt.id);
                  setShowAnswer(true);
                }}
              >
                {opt.text || '(空选项)'}
              </div>
            );
          })}
        </div>
        {showAnswer && (
          <button
            className="mt-2 text-sm text-blue-500"
            onClick={() => {
              setSelected(null);
              setShowAnswer(false);
            }}
          >
            重置
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {block.options.map((opt) => (
        <div key={opt.id} className="flex items-center gap-2">
          <button
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
              opt.isCorrect ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}
            onClick={() => toggleCorrect(opt.id)}
            title="标记为正确答案"
          />
          <input
            type="text"
            value={opt.text}
            placeholder="输入选项内容..."
            onChange={(e) => updateOption(opt.id, e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
          />
          <button
            className="text-red-400 hover:text-red-600 text-sm"
            onClick={() => removeOption(opt.id)}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        className="text-sm text-blue-500 hover:text-blue-700"
        onClick={addOption}
      >
        + 添加选项
      </button>
    </div>
  );
}
