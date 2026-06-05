import { useState } from 'react';
import { CardPack } from '../types';

interface Props {
  packs: CardPack[];
  onSelect: (pack: CardPack) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onJumpToCard: (packId: string, cardIndex: number) => void;
}

export function PackList({ packs, onSelect, onDelete, onNew, onJumpToCard }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.trim()
    ? packs.flatMap((pack) =>
        pack.cards
          .map((card, idx) => ({ pack, card, cardIndex: idx }))
          .filter(({ card }) =>
            (card.title || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 flex-1">MarkMath</h1>
        <div className="relative w-[140px]">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 outline-none focus:border-blue-300 focus:bg-white transition-colors"
            placeholder="搜索卡片"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-[240px] overflow-y-auto">
              {searchResults.map(({ pack, card, cardIndex }) => (
                <button
                  key={`${pack.id}-${card.id}`}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  onClick={() => { onJumpToCard(pack.id, cardIndex); setSearchQuery(''); }}
                >
                  <div className="text-sm text-gray-800">{card.title || '未命名卡片'}</div>
                  <div className="text-xs text-gray-400">{pack.title || '未命名卡包'}</div>
                </button>
              ))}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 px-3 py-3 text-center text-sm text-gray-400">
              未找到匹配卡片
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {packs.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="text-6xl mb-4">📦</div>
            <div className="text-lg mb-2">还没有卡包</div>
            <div className="text-sm">点击下方「+ 新建卡包」开始创建</div>
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

      <div className="p-3 bg-white border-t border-gray-200">
        <button
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm mb-2"
          onClick={onNew}
        >
          + 新建卡包
        </button>
        <div className="text-center text-xs text-gray-400">
          积木式卡片编辑器 · 共 {packs.length} 个卡包
        </div>
      </div>
    </div>
  );
}
