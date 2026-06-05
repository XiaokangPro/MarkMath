import { CardPack } from '../types';

interface Props {
  packs: CardPack[];
  onSelect: (pack: CardPack) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function PackList({ packs, onSelect, onDelete, onNew }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">MarkMath</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          onClick={onNew}
        >
          + 新建卡包
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {packs.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="text-6xl mb-4">📦</div>
            <div className="text-lg mb-2">还没有卡包</div>
            <div className="text-sm">点击上方「新建卡包」开始创建</div>
          </div>
        ) : (
          <div className="space-y-3">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className="bg-white rounded-lg border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => onSelect(pack)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">
                      {pack.title || '未命名卡包'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{pack.cards.length} 张卡片</span>
                      <span>·</span>
                      <span>{new Date(pack.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定删除这个卡包吗？')) {
                        onDelete(pack.id);
                      }
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-gray-200 text-center text-xs text-gray-400">
        积木式卡片编辑器 · 共 {packs.length} 个卡包
      </div>
    </div>
  );
}
