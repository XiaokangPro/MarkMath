import React, { useRef, useState } from 'react';
import { ImageBlock as ImageBlockType } from '../../types';

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
      onUpdate({ ...block, dataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

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
    return <ImageBlockViewer block={block} />;
  }

  return (
    <div className="w-full" onClick={onFocus}>
      {block.isDoubleSided && (
        <div className="bg-gray-50 border-l-3 border-gray-400 p-2 rounded mb-2">
          <div className="text-xs text-gray-500 font-medium mb-1">背面 (提示/问题)</div>
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
        src={block.dataUrl}
        alt={block.caption || ''}
        className="max-w-full rounded-lg"
      />
      {isEditing && (
        <input
          type="text"
          placeholder="图片描述（可选）"
          value={block.caption || ''}
          onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
          className="mt-2 w-full px-2 py-1 text-sm border border-gray-200 rounded"
        />
      )}
    </div>
  );
}

function ImageBlockViewer({ block }: { block: ImageBlockType }) {
  const [showFront, setShowFront] = useState(!block.isDoubleSided);

  if (block.isDoubleSided) {
    return (
      <div
        className="w-full cursor-pointer select-none relative"
        onClick={() => setShowFront(!showFront)}
      >
        <div className={showFront ? '' : 'invisible'}>
          <img
            src={block.dataUrl}
            alt={block.caption || ''}
            className="max-w-full rounded-lg"
          />
          {block.caption && (
            <div className="text-sm text-gray-500 mt-1 text-center">{block.caption}</div>
          )}
        </div>
        {!showFront && (
          <div className="absolute -inset-x-4 -inset-y-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            {block.backContent || '点击查看'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <img
        src={block.dataUrl}
        alt={block.caption || ''}
        className="max-w-full rounded-lg"
      />
      {block.caption && (
        <div className="text-sm text-gray-500 mt-1 text-center">{block.caption}</div>
      )}
    </div>
  );
}
