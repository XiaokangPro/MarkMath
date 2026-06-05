import React, { useState } from 'react';
import katex from 'katex';
import { FONT_COLORS, FONT_SIZES, EMOJIS } from '../types';

const FONTS = [
  { name: '默认(楷体)', value: '' },
  { name: '黑体', value: 'SimHei, "Microsoft YaHei", sans-serif' },
  { name: '宋体', value: 'SimSun, STSong, serif' },
  { name: '圆体', value: '"PingFang SC", "Microsoft YaHei UI Light", sans-serif' },
  { name: '手写', value: '"STXingkai", "华文行楷", cursive' },
  { name: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { name: 'Mono', value: '"Cascadia Code", "Fira Code", Consolas, monospace' },
];

const CUSTOM_COLORS_KEY = 'markmath-custom-colors';

function loadCustomColors(): string[] {
  try {
    const data = localStorage.getItem(CUSTOM_COLORS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCustomColor(color: string) {
  const colors = loadCustomColors();
  const normalized = color.toLowerCase();
  if (colors.includes(normalized)) return colors;
  const updated = [normalized, ...colors].slice(0, 10);
  localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(updated));
  return updated;
}

interface Props {
  onToggleDoubleSided: () => void;
  isDoubleSided: boolean;
}

let savedRange: Range | null = null;

function saveSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
}

function restoreSelection() {
  if (savedRange) {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
  }
}

export function Toolbar({ onToggleDoubleSided, isDoubleSided }: Props) {
  const [showColors, setShowColors] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontColors, setShowFontColors] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [showLatex, setShowLatex] = useState(false);
  const [latexInput, setLatexInput] = useState('');
  const [customColors, setCustomColors] = useState<string[]>(loadCustomColors);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleCustomColor = (color: string, onSelect: (c: string) => void) => {
    const updated = saveCustomColor(color);
    setCustomColors(updated);
    onSelect(color);
  };

  const applyFont = (fontFamily: string) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowFonts(false);
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedText = range.extractContents();
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    span.appendChild(selectedText);
    range.insertNode(span);
    selection.removeAllRanges();
    setShowFonts(false);
    triggerInput(span);
  };

  const applyUnderlineColor = (color: string) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      execCommand('underline');
      setShowColors(false);
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedText = range.extractContents();
    const span = document.createElement('span');
    span.style.textDecoration = 'underline';
    span.style.textDecorationColor = color;
    span.appendChild(selectedText);
    range.insertNode(span);
    selection.removeAllRanges();
    setShowColors(false);
    triggerInput(span);
  };

  const applyFontColor = (color: string) => {
    restoreSelection();
    execCommand('foreColor', color);
    setShowFontColors(false);
  };

  const insertEmoji = (emoji: string) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection) return;
    if (selection.rangeCount === 0) {
      setShowEmojis(false);
      return;
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(emoji);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    setShowEmojis(false);
    triggerInput(textNode);
  };

  const insertLatex = () => {
    if (!latexInput.trim()) {
      setShowLatex(false);
      return;
    }
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setShowLatex(false);
      return;
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const span = document.createElement('span');
    span.setAttribute('data-latex', latexInput);
    span.contentEditable = 'false';
    span.style.display = 'inline-block';
    span.style.verticalAlign = 'middle';
    try {
      span.innerHTML = katex.renderToString(latexInput, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      span.textContent = latexInput;
    }
    range.insertNode(span);
    range.setStartAfter(span);
    range.setEndAfter(span);
    selection.removeAllRanges();
    selection.addRange(range);
    setShowLatex(false);
    setLatexInput('');
    triggerInput(span);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-200 sticky top-0 z-10">
      <ToolBtn
        active={isDoubleSided}
        onClick={onToggleDoubleSided}
        title="双面隐藏"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="8" rx="1"/>
          <rect x="2" y="13" width="20" height="8" rx="1"/>
        </svg>
      </ToolBtn>

      <Divider />

      <ToolBtn onClick={() => execCommand('bold')} title="加粗">
        <strong>B</strong>
      </ToolBtn>

      <ToolBtn onClick={() => execCommand('italic')} title="斜体">
        <em>I</em>
      </ToolBtn>

      <div className="relative">
        <ToolBtn
          onClick={() => execCommand('underline')}
          onContextMenu={(e) => { e.preventDefault(); saveSelection(); setShowColors(!showColors); }}
          title="下划线（右键选色）"
        >
          <span className="underline">U</span>
        </ToolBtn>
        {showColors && (
          <ColorPickerWithCustom
            colors={FONT_COLORS}
            customColors={customColors}
            onSelect={applyUnderlineColor}
            onCustom={(c) => handleCustomColor(c, applyUnderlineColor)}
            onClose={() => setShowColors(false)}
          />
        )}
      </div>

      <ToolBtn onClick={() => execCommand('strikeThrough')} title="删除线">
        <span className="line-through">S</span>
      </ToolBtn>

      <Divider />

      <div className="relative">
        <ToolBtn onClick={() => { saveSelection(); setShowFontColors(!showFontColors); }} title="字体颜色">
          <span className="text-red-500 font-bold">A</span>
        </ToolBtn>
        {showFontColors && (
          <ColorPickerWithCustom
            colors={FONT_COLORS}
            customColors={customColors}
            onSelect={applyFontColor}
            onCustom={(c) => handleCustomColor(c, applyFontColor)}
            onClose={() => setShowFontColors(false)}
          />
        )}
      </div>

      <div className="relative">
        <ToolBtn onClick={() => { saveSelection(); setShowFontSize(!showFontSize); }} title="字号">
          <span className="text-xs">字号</span>
        </ToolBtn>
        {showFontSize && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowFontSize(false)} />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100 rounded text-sm"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    restoreSelection();
                    execCommand('fontSize', '7');
                    const fontElements = document.querySelectorAll('font[size="7"]');
                    fontElements.forEach((el) => {
                      const span = document.createElement('span');
                      span.style.fontSize = `${size}px`;
                      span.innerHTML = el.innerHTML;
                      el.parentNode?.replaceChild(span, el);
                    });
                    setShowFontSize(false);
                  }}
                >
                  <span style={{ fontSize: `${Math.min(size, 20)}px` }}>{size}px</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <ToolBtn onClick={() => { saveSelection(); setShowFonts(!showFonts); }} title="字体">
          <span className="text-xs">字体</span>
        </ToolBtn>
        {showFonts && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowFonts(false)} />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-[160px]">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-sm"
                  style={{ fontFamily: font.value || 'inherit' }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (!font.value) {
                      restoreSelection();
                      execCommand('removeFormat');
                      setShowFonts(false);
                    } else {
                      applyFont(font.value);
                    }
                  }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Divider />

      <ToolBtn onClick={() => execCommand('justifyLeft')} title="左对齐">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
        </svg>
      </ToolBtn>

      <ToolBtn onClick={() => execCommand('justifyCenter')} title="居中">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </ToolBtn>

      <ToolBtn onClick={() => execCommand('superscript')} title="上角标">
        <span className="text-xs">X<sup>2</sup></span>
      </ToolBtn>

      <ToolBtn onClick={() => execCommand('subscript')} title="下角标">
        <span className="text-xs">X<sub>2</sub></span>
      </ToolBtn>

      <Divider />

      <div className="relative">
        <ToolBtn onClick={() => { saveSelection(); setShowLatex(!showLatex); }} title="LaTeX公式">
          <span className="text-xs font-serif italic">fx</span>
        </ToolBtn>
        {showLatex && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowLatex(false)} />
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-[280px]">
              <div className="text-xs text-gray-500 mb-1">输入 LaTeX 公式</div>
              <input
                type="text"
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') insertLatex(); }}
                placeholder="例如: E = mc^2"
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm mb-2"
                autoFocus
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-1 flex-wrap">
                  {['\\frac{a}{b}', '\\sqrt{x}', 'x^2', '\\sum_{i=1}^n', '\\int_a^b'].map((f) => (
                    <button
                      key={f}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded"
                      onClick={() => setLatexInput((prev) => prev + f)}
                    >
                      {f.length > 8 ? f.slice(0, 8) + '..' : f}
                    </button>
                  ))}
                </div>
                <button
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-2"
                  onClick={insertLatex}
                >
                  插入
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <ToolBtn onClick={() => { saveSelection(); setShowEmojis(!showEmojis); }} title="表情">
          <span className="text-sm">😀</span>
        </ToolBtn>
        {showEmojis && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowEmojis(false)} />
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 grid grid-cols-8 gap-1 w-[260px]">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-lg"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Divider />

      <ToolBtn onClick={() => execCommand('undo')} title="撤销">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h13a4 4 0 0 1 0 8H7"/><polyline points="7,6 3,10 7,14"/>
        </svg>
      </ToolBtn>
    </div>
  );
}

function triggerInput(node: Node) {
  let el: Node | null = node;
  while (el && !(el instanceof HTMLElement && el.contentEditable === 'true')) {
    el = el.parentNode;
  }
  if (el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function ToolBtn({ children, onClick, onContextMenu, active, title }: {
  children: React.ReactNode;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
      }`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={title}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

function ColorPickerWithCustom({ colors, customColors, onSelect, onCustom, onClose }: {
  colors: string[];
  customColors: string[];
  onSelect: (color: string) => void;
  onCustom: (color: string) => void;
  onClose: () => void;
}) {
  const [customColor, setCustomColor] = useState('#000000');

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-[220px]">
        <div className="flex gap-1 flex-wrap mb-2">
          {colors.map((color) => (
            <button
              key={color}
              className="w-7 h-7 rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(color)}
            />
          ))}
        </div>
        {customColors.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2 border-t border-gray-100 pt-2">
            <span className="text-[10px] text-gray-400 w-full">常用</span>
            {customColors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(color)}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 border-t border-gray-100 pt-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 w-[60px]"
            placeholder="#hex"
          />
          <button
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onCustom(customColor)}
          >
            用
          </button>
        </div>
      </div>
    </>
  );
}
