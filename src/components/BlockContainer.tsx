import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { Block, BG_COLORS } from '../types';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { AudioBlock } from './blocks/AudioBlock';
import { ChoiceBlock } from './blocks/ChoiceBlock';
import { LinkBlock } from './blocks/LinkBlock';

const CUSTOM_BG_KEY = 'markmath-custom-bg-colors';

function loadCustomBgColors(): string[] {
  try {
    const data = localStorage.getItem(CUSTOM_BG_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCustomBgColor(color: string): string[] {
  const colors = loadCustomBgColors();
  const normalized = color.toLowerCase();
  if (colors.includes(normalized)) return colors;
  const updated = [normalized, ...colors].slice(0, 8);
  localStorage.setItem(CUSTOM_BG_KEY, JSON.stringify(updated));
  return updated;
}

interface Props {
  block: Block;
  isEditing: boolean;
  onUpdate: (block: Block) => void;
  onDelete: (id: string) => void;
  onFocus: () => void;
}

export function BlockContainer({ block, isEditing, onUpdate, onDelete, onFocus }: Props) {
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [customBgColors, setCustomBgColors] = useState<string[]>(loadCustomBgColors);
  const [customBgInput, setCustomBgInput] = useState('#FFFDE7');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: !isEditing });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    backgroundColor: block.bgColor && block.bgColor !== 'transparent' ? block.bgColor : undefined,
  };

  const blockTypeLabel: Record<string, string> = {
    text: '文字',
    image: '图片',
    audio: '音频',
    choice: '选项',
    link: '链接',
  };

  const applyBg = (color: string) => {
    onUpdate({ ...block, bgColor: color });
    setShowBgPicker(false);
  };

  const applyCustomBg = (color: string) => {
    const updated = saveCustomBgColor(color);
    setCustomBgColors(updated);
    applyBg(color);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-container rounded-lg mb-2 relative group ${isEditing ? 'bg-white border border-gray-100 p-3' : 'px-4 py-3'}`}
    >
      {isEditing && (
        <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            {...attributes}
            {...listeners}
            className="block-drag-handle p-1 text-gray-400"
            title="拖拽排序"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/>
              <circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/>
              <circle cx="9" cy="18" r="2"/><circle cx="15" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      )}

      <div className={isEditing ? 'pl-4' : ''}>
        {isEditing && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{blockTypeLabel[block.type]}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => setShowBgPicker(!showBgPicker)}
                  title="背景色"
                >
                  🎨
                </button>
                {showBgPicker && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowBgPicker(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-[200px]">
                      <div className="flex gap-1 flex-wrap mb-2">
                        {BG_COLORS.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
                            onClick={() => applyBg(color)}
                            title={color === 'transparent' ? '无背景' : color}
                          >
                            {color === 'transparent' && <span className="text-xs text-gray-400">✕</span>}
                          </button>
                        ))}
                      </div>
                      {customBgColors.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2 border-t border-gray-100 pt-2">
                          <span className="text-[10px] text-gray-400 w-full">常用</span>
                          {customBgColors.map((color) => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              onClick={() => applyBg(color)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 border-t border-gray-100 pt-2">
                        <input
                          type="color"
                          value={customBgInput}
                          onChange={(e) => setCustomBgInput(e.target.value)}
                          className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={customBgInput}
                          onChange={(e) => setCustomBgInput(e.target.value)}
                          className="flex-1 text-xs border border-gray-200 rounded px-1 py-0.5 w-[50px]"
                        />
                        <button
                          className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600"
                          onClick={() => applyCustomBg(customBgInput)}
                        >
                          用
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                className="text-xs text-red-400 hover:text-red-600"
                onClick={() => onDelete(block.id)}
              >
                删除
              </button>
            </div>
          </div>
        )}
        <BlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} onFocus={onFocus} />
      </div>
    </div>
  );
}

function BlockRenderer({ block, isEditing, onUpdate, onFocus }: {
  block: Block;
  isEditing: boolean;
  onUpdate: (block: Block) => void;
  onFocus: () => void;
}) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} isEditing={isEditing} onUpdate={onUpdate} onFocus={onFocus} />;
    case 'image':
      return <ImageBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'audio':
      return <AudioBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'choice':
      return <ChoiceBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'link':
      return <LinkBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} />;
  }
}
