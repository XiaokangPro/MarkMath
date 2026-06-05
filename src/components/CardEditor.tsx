import { useState, useRef, useCallback, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { toPng } from 'html-to-image';
import { Card, Block, BlockType, TextBlock } from '../types';
import { generateId } from '../store';
import { Toolbar } from './Toolbar';
import { BlockContainer } from './BlockContainer';

interface Props {
  card: Card;
  onSave: (card: Card) => void;
}

export function CardEditor({ card, onSave }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(card.blocks);
  const [isEditing, setIsEditing] = useState(true);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const blocksRef = useRef(blocks);
  const previewRef = useRef<HTMLDivElement>(null);
  blocksRef.current = blocks;

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const addBlock = (type: BlockType) => {
    let newBlock: Block;
    switch (type) {
      case 'text':
        newBlock = { id: generateId(), type: 'text', content: '', isDoubleSided: false };
        break;
      case 'image':
        newBlock = { id: generateId(), type: 'image', dataUrl: '' };
        break;
      case 'audio':
        newBlock = { id: generateId(), type: 'audio', dataUrl: '' };
        break;
      case 'choice':
        newBlock = { id: generateId(), type: 'choice', options: [
          { id: generateId(), text: '', isCorrect: false },
          { id: generateId(), text: '', isCorrect: false },
        ]};
        break;
      case 'link':
        newBlock = { id: generateId(), type: 'link', url: '', title: '' };
        break;
    }
    setBlocks((prev) => [...prev, newBlock]);
    setShowBlockMenu(false);
  };

  const updateBlock = useCallback((updated: Block) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addBlockBefore = useCallback((id: string) => {
    const newBlock: Block = { id: generateId(), type: 'text', content: '', isDoubleSided: false };
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 0, newBlock);
      return next;
    });
  }, []);

  const addBlockAfter = useCallback((id: string) => {
    const newBlock: Block = { id: generateId(), type: 'text', content: '', isDoubleSided: false };
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const clone = JSON.parse(JSON.stringify(prev[idx]));
      clone.id = generateId();
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  }, []);

  const pasteBlockAfter = useCallback((id: string, blockData: Block) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx + 1, 0, { ...blockData, id: generateId() });
      return next;
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const toggleDoubleSided = () => {
    if (activeBlock && (activeBlock.type === 'text' || activeBlock.type === 'image')) {
      updateBlock({ ...activeBlock, isDoubleSided: !activeBlock.isDoubleSided });
    }
  };

  const handleSave = useCallback(() => {
    onSave({
      ...card,
      blocks: blocksRef.current,
      updatedAt: Date.now(),
    });
  }, [card, onSave]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave();
    }, 500);
    return () => clearTimeout(timer);
  }, [blocks, handleSave]);

  const saveAsImage = async () => {
    if (!previewRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${card.title || '卡片'}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Save image failed:', e);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded text-sm ${
              isEditing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setIsEditing(true)}
          >
            编辑
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              !isEditing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => { handleSave(); setIsEditing(false); }}
          >
            预览
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              className="text-sm text-blue-500 hover:text-blue-700 disabled:opacity-50"
              onClick={saveAsImage}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存图片'}
            </button>
          )}
          <button
            className="text-green-500 hover:text-green-700 font-medium text-sm"
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>

      {isEditing && (
        <Toolbar
          onToggleDoubleSided={toggleDoubleSided}
          isDoubleSided={
            activeBlock?.type === 'text' ? (activeBlock as TextBlock).isDoubleSided :
            activeBlock?.type === 'image' ? !!(activeBlock as any).isDoubleSided : false
          }
        />
      )}

      <div
        ref={previewRef}
        className={`flex-1 overflow-y-auto px-4 py-2 ${!isEditing ? 'bg-white' : ''}`}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <BlockContainer
                key={block.id}
                block={block}
                isEditing={isEditing}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onAddBefore={addBlockBefore}
                onAddAfter={addBlockAfter}
                onDuplicate={duplicateBlock}
                onPasteBlock={pasteBlockAfter}
                onFocus={() => setActiveBlockId(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-3">📝</div>
            <div>点击下方 + 号添加功能块</div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="relative p-3 bg-white border-t border-gray-200">
          {showBlockMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 grid grid-cols-5 gap-3">
              {[
                { type: 'text' as BlockType, icon: '📝', label: '文字' },
                { type: 'image' as BlockType, icon: '🖼️', label: '图片' },
                { type: 'audio' as BlockType, icon: '🎵', label: '音频' },
                { type: 'choice' as BlockType, icon: '☑️', label: '选项' },
                { type: 'link' as BlockType, icon: '🔗', label: '链接' },
              ].map(({ type, icon, label }) => (
                <button
                  key={type}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => addBlock(type)}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
            onClick={() => setShowBlockMenu(!showBlockMenu)}
          >
            {showBlockMenu ? '✕' : '+'}
          </button>
        </div>
      )}
    </div>
  );
}
