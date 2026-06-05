import { LinkBlock as LinkBlockType } from '../../types';

interface Props {
  block: LinkBlockType;
  isEditing: boolean;
  onUpdate: (block: LinkBlockType) => void;
}

export function LinkBlock({ block, isEditing, onUpdate }: Props) {
  if (!isEditing) {
    return (
      <div className="w-full">
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <span className="text-xl">🔗</span>
          <span className="text-blue-600 underline">{block.title || block.url || '未设置链接'}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <input
        type="text"
        value={block.title}
        placeholder="链接标题..."
        onChange={(e) => onUpdate({ ...block, title: e.target.value })}
        className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
      />
      <input
        type="url"
        value={block.url}
        placeholder="https://..."
        onChange={(e) => onUpdate({ ...block, url: e.target.value })}
        className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
      />
    </div>
  );
}
