import React, { useRef, useEffect, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import twemoji from 'twemoji';
import { TextBlock as TextBlockType, BG_COLORS } from '../../types';

interface Props {
  block: TextBlockType;
  isEditing: boolean;
  onUpdate: (block: TextBlockType) => void;
  onFocus: () => void;
}

export function TextBlock({ block, isEditing, onUpdate, onFocus }: Props) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!isEditing) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (frontRef.current && frontRef.current.innerHTML !== block.content) {
      frontRef.current.innerHTML = block.content;
    }
  }, [block.content, isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    if (backRef.current && backRef.current.innerHTML !== (block.backContent || '')) {
      backRef.current.innerHTML = block.backContent || '';
    }
  }, [block.backContent, isEditing]);

  const handleFrontInput = useCallback(() => {
    if (frontRef.current) {
      isInternalUpdate.current = true;
      onUpdate({ ...block, content: frontRef.current.innerHTML });
    }
  }, [block, onUpdate]);

  const handleBackInput = useCallback(() => {
    if (backRef.current) {
      onUpdate({ ...block, backContent: backRef.current.innerHTML });
    }
  }, [block, onUpdate]);

  if (!isEditing) {
    return <TextBlockViewer block={block} />;
  }

  return (
    <div className="w-full">
      {block.isDoubleSided && (
        <div className="double-sided-back mb-2" style={block.backColor ? { background: block.backColor, borderLeftColor: block.backColor } : undefined}>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-green-700 font-medium">背面 (提示/问题)</div>
            <div className="flex items-center gap-0.5">
              {BG_COLORS.slice(0, 12).map((c) => (
                <button
                  key={c}
                  className={`w-3.5 h-3.5 rounded-sm border ${block.backColor === c || (!block.backColor && c === 'transparent') ? 'border-blue-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: c === 'transparent' ? '#EDE9E1' : c }}
                  onClick={(e) => { e.stopPropagation(); onUpdate({ ...block, backColor: c === 'transparent' ? undefined : c }); }}
                  title={c === 'transparent' ? '默认' : c}
                />
              ))}
            </div>
          </div>
          <div
            ref={backRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[32px] text-sm"
            data-placeholder="输入背面内容..."
            onInput={handleBackInput}
            onFocus={onFocus}
          />
        </div>
      )}
      <div
        ref={frontRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[32px] text-base"
        data-placeholder="输入文字..."
        onInput={handleFrontInput}
        onFocus={onFocus}
      />
    </div>
  );
}

function TextBlockViewer({ block }: { block: TextBlockType }) {
  const [showFront, setShowFront] = React.useState(!block.isDoubleSided);

  if (block.isDoubleSided) {
    return (
      <div
        className="w-full cursor-pointer select-none relative"
        onClick={() => setShowFront(!showFront)}
      >
        <div className={showFront ? '' : 'invisible'}>
          <RenderedContent html={block.content} />
        </div>
        {!showFront && (
          <div
            className="absolute -inset-x-4 -inset-y-4 rounded-lg flex items-center justify-center text-gray-500"
            style={{ backgroundColor: block.backColor || '#f3f4f6' }}
          >
            <RenderedContent html={block.backContent || ''} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ClozeContent html={block.content} />
    </div>
  );
}

function renderLatex(container: HTMLElement) {
  const latexEls = container.querySelectorAll('[data-latex]');
  latexEls.forEach((el) => {
    const formula = (el as HTMLElement).dataset.latex;
    if (!formula) return;
    try {
      (el as HTMLElement).innerHTML = katex.renderToString(formula, {
        throwOnError: false,
        displayMode: false,
      });
      (el as HTMLElement).style.display = 'inline-block';
      (el as HTMLElement).style.verticalAlign = 'middle';
    } catch {
      (el as HTMLElement).textContent = formula;
    }
  });
}

function parseEmoji(container: HTMLElement) {
  twemoji.parse(container, {
    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
    folder: 'svg',
    ext: '.svg',
  });
  container.querySelectorAll('img.emoji').forEach(async (img) => {
    const src = (img as HTMLImageElement).src;
    if (!src || src.startsWith('data:')) return;
    try {
      const resp = await fetch(src);
      const text = await resp.text();
      const dataUri = 'data:image/svg+xml;base64,' + btoa(text);
      (img as HTMLImageElement).src = dataUri;
    } catch {}
  });
}

function RenderedContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = html;
    renderLatex(ref.current);
    parseEmoji(ref.current);
  }, [html]);

  return <div ref={ref} className={className} />;
}

function ClozeContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = html;

    renderLatex(containerRef.current);

    const clozes = containerRef.current.querySelectorAll('[data-cloze]');
    clozes.forEach((el) => {
      const color = (el as HTMLElement).dataset.clozeColor || '#8C8E54';
      const htmlEl = el as HTMLElement;
      htmlEl.style.cssText = '';
      htmlEl.className = 'cloze-hidden';
      htmlEl.style.setProperty('--cloze-color', color);
      htmlEl.onclick = (e) => {
        e.stopPropagation();
        htmlEl.classList.toggle('revealed');
      };
    });

    parseEmoji(containerRef.current);
  }, [html]);

  return <div ref={containerRef} />;
}
