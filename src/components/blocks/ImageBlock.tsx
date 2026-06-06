import React, { useRef, useState } from 'react';
import { ImageBlock as ImageBlockType, BG_COLORS } from '../../types';

interface Props {
  block: ImageBlockType;
  isEditing: boolean;
  onUpdate: (block: ImageBlockType) => void;
  onFocus?: () => void;
}

export function ImageBlock({ block, isEditing, onUpdate, onFocus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ ...block, dataUrl: reader.result as string, annotations: undefined, compositeUrl: undefined });
    };
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayUrl = block.compositeUrl || block.dataUrl;

  if (!block.dataUrl) {
    return (
      <div className="w-full">
        {isEditing ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-gray-500">点击上传图片</div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-center p-4">[图片未上传]</div>
        )}
      </div>
    );
  }

  if (!isEditing) {
    return <ImageBlockViewer block={block} displayUrl={displayUrl} />;
  }

  return (
    <div className="w-full" onClick={onFocus}>
      {block.isDoubleSided && (
        <div className="bg-gray-50 border-l-3 border-gray-400 p-2 rounded mb-2" style={block.backColor ? { background: block.backColor, borderLeftColor: block.backColor } : undefined}>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-500 font-medium">背面 (提示/问题)</div>
            <div className="flex items-center gap-0.5">
              {BG_COLORS.slice(0, 12).map((c) => (
                <button
                  key={c}
                  className={`w-3.5 h-3.5 rounded-sm border ${block.backColor === c || (!block.backColor && c === 'transparent') ? 'border-blue-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: c === 'transparent' ? '#f9fafb' : c }}
                  onClick={(e) => { e.stopPropagation(); onUpdate({ ...block, backColor: c === 'transparent' ? undefined : c }); }}
                  title={c === 'transparent' ? '默认' : c}
                />
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="输入背面提示内容..."
            value={block.backContent || ''}
            onChange={(e) => onUpdate({ ...block, backContent: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
            onFocus={onFocus}
          />
        </div>
      )}
      <img
        src={displayUrl}
        alt={block.caption || ''}
        className="max-w-full rounded-lg"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        type="text"
        placeholder="图片描述（可选）"
        value={block.caption || ''}
        onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
        className="mt-2 w-full px-2 py-1 text-sm border border-gray-200 rounded"
      />
    </div>
  );
}

function ImageBlockViewer({ block, displayUrl }: { block: ImageBlockType; displayUrl: string }) {
  const [showFront, setShowFront] = useState(!block.isDoubleSided);

  if (block.isDoubleSided) {
    return (
      <div
        className="w-full cursor-pointer select-none relative"
        onClick={() => setShowFront(!showFront)}
      >
        <div className={showFront ? '' : 'invisible'}>
          <img
            src={displayUrl}
            alt={block.caption || ''}
            className="max-w-full rounded-lg"
          />
          {block.caption && (
            <div className="text-sm text-gray-500 mt-1 text-center">{block.caption}</div>
          )}
        </div>
        {!showFront && (
          <div
            className="absolute -inset-x-4 -inset-y-4 rounded-lg flex items-center justify-center text-gray-500"
            style={{ backgroundColor: block.backColor || '#f3f4f6' }}
          >
            {block.backContent || '点击查看'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <img
        src={displayUrl}
        alt={block.caption || ''}
        className="max-w-full rounded-lg"
      />
      {block.caption && (
        <div className="text-sm text-gray-500 mt-1 text-center">{block.caption}</div>
      )}
    </div>
  );
}
