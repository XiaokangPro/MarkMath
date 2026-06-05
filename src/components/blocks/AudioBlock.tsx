import { useRef } from 'react';
import { AudioBlock as AudioBlockType } from '../../types';

interface Props {
  block: AudioBlockType;
  isEditing: boolean;
  onUpdate: (block: AudioBlockType) => void;
}

export function AudioBlock({ block, isEditing, onUpdate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ ...block, dataUrl: reader.result as string, label: file.name });
    };
    reader.readAsDataURL(file);
  };

  if (!block.dataUrl) {
    return (
      <div className="w-full">
        {isEditing ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <div className="text-3xl mb-2">🎵</div>
            <div className="text-gray-500">点击上传音频</div>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-center p-4">[音频未上传]</div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {block.label && (
        <div className="text-sm text-gray-600 mb-1">{block.label}</div>
      )}
      <audio controls src={block.dataUrl} className="w-full" />
    </div>
  );
}
