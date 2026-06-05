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
  onAddBefore: (id: string) => void;
  onAddAfter: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPasteBlock: (id: string, blockData: Block) => void;
  onFocus: () => void;
}

export function BlockContainer({ block, isEditing, onUpdate, onDelete, onAddBefore, onAddAfter, onDuplicate, onPasteBlock, onFocus }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [showColorSub, setShowColorSub] = useState(false);
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

  const applyBg = (color: string) => {
    onUpdate({ ...block, bgColor: color });
    setShowColorSub(false);
    setShowMenu(false);
  };

  const applyCustomBg = (color: string) => {
    const updated = saveCustomBgColor(color);
    setCustomBgColors(updated);
    applyBg(color);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(block));
    } catch {}
    setShowMenu(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      if (parsed && parsed.type) {
        onPasteBlock(block.id, parsed);
      }
    } catch {}
    setShowMenu(false);
  };

  const menuItems = [
    {
      label: '在此前加块',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          <line x1="4" y1="4" x2="20" y2="4"/>
        </svg>
      ),
      action: () => { onAddBefore(block.id); setShowMenu(false); },
    },
    {
      label: '在此后加块',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          <line x1="4" y1="20" x2="20" y2="20"/>
        </svg>
      ),
      action: () => { onAddAfter(block.id); setShowMenu(false); },
    },
    {
      label: '复制',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      ),
      action: () => { onDuplicate(block.id); setShowMenu(false); },
    },
    {
      label: '拷贝',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1"/>
        </svg>
      ),
      action: handleCopy,
    },
    {
      label: '粘贴',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1"/>
          <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      ),
      action: handlePaste,
    },
    {
      label: '颜色',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      ),
      action: () => setShowColorSub(!showColorSub),
      noClose: true,
    },
    {
      label: '删除',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      ),
      action: () => { onDelete(block.id); setShowMenu(false); },
      danger: true,
    },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-container rounded-lg mb-2 relative group ${isEditing ? 'bg-white border border-gray-100 p-3' : block.type === 'image' ? 'px-4 py-0' : 'px-4 py-4'}`}
      onClick={isEditing ? onFocus : undefined}
    >
      {isEditing && (
        <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center pl-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div
            {...attributes}
            {...listeners}
            className="block-drag-handle p-1 text-gray-400 cursor-grab"
            title="拖拽排序 / 点击操作"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); setShowColorSub(false); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/>
              <circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/>
              <circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/>
            </svg>
          </div>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setShowMenu(false); setShowColorSub(false); }} />
              <div className="absolute left-full top-0 ml-1 z-40 bg-[#FFFDF5] rounded-xl shadow-lg py-1.5 w-[140px] border border-[#F0EBE0]">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                      item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-[#F5F0E8]'
                    }`}
                    onClick={(e) => { e.stopPropagation(); item.action(); }}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}

                {showColorSub && (
                  <div className="px-3 py-2 border-t border-[#F0EBE0]">
                    <div className="flex gap-1 flex-wrap mb-2">
                      {BG_COLORS.map((color) => (
                        <button
                          key={color}
                          className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
                          onClick={(e) => { e.stopPropagation(); applyBg(color); }}
                          title={color === 'transparent' ? '无背景' : color}
                        >
                          {color === 'transparent' && <span className="text-[10px] text-gray-400">✕</span>}
                        </button>
                      ))}
                    </div>
                    {customBgColors.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-2 border-t border-gray-100 pt-1">
                        <span className="text-[9px] text-gray-400 w-full">常用</span>
                        {customBgColors.map((color) => (
                          <button
                            key={color}
                            className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={(e) => { e.stopPropagation(); applyBg(color); }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 border-t border-gray-100 pt-1">
                      <input
                        type="color"
                        value={customBgInput}
                        onChange={(e) => setCustomBgInput(e.target.value)}
                        className="w-5 h-5 rounded border border-gray-200 cursor-pointer p-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <input
                        type="text"
                        value={customBgInput}
                        onChange={(e) => setCustomBgInput(e.target.value)}
                        className="flex-1 text-xs border border-gray-200 rounded px-1 py-0.5 w-[40px]"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded hover:bg-blue-600"
                        onClick={(e) => { e.stopPropagation(); applyCustomBg(customBgInput); }}
                      >
                        用
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className={isEditing ? 'pl-4 relative min-h-[48px] flex items-center' : ''}>
        <div className="w-full">
          <BlockRenderer block={block} isEditing={isEditing} onUpdate={onUpdate} onFocus={onFocus} />
        </div>
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
      return <ImageBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} onFocus={onFocus} />;
    case 'audio':
      return <AudioBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'choice':
      return <ChoiceBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} />;
    case 'link':
      return <LinkBlock block={block} isEditing={isEditing} onUpdate={onUpdate as any} />;
  }
}
