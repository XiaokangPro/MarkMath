import { useRef } from 'react';
import { ImageBlock as ImageBlockType } from '../../types';

interface Props {
  block: ImageBlockType;
  isEditing: boolean;
  onUpdate: (block: ImageBlockType) => void;
}

export function ImageBlock({ block, isEditing, onUpdate }: Props) {
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

  return (
    <div className="w-full">
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
      {!isEditing && block.caption && (
        <div className="text-sm text-gray-500 mt-1 text-center">{block.caption}</div>
      )}
    </div>
  );
}
