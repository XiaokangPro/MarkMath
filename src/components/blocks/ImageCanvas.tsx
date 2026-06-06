import React, { useCallback, useRef, useState } from 'react';

interface Props {
  imageUrl: string;
  annotations?: string;
  onSave: (annotations: string, compositeUrl: string) => void;
  onCancel: () => void;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  state = { hasError: false, errorMsg: '' };
  static getDerivedStateFromError(error: any) { return { hasError: true, errorMsg: String(error?.message || error) }; }
  render() {
    if (this.state.hasError) {
      return <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">
        <div>编辑器加载异常<br/><span className="text-xs text-gray-400">{this.state.errorMsg}</span></div>
      </div>;
    }
    return this.props.children;
  }
}

export function ImageCanvas({ imageUrl, annotations, onSave, onCancel }: Props) {
  const apiRef = useRef<any>(null);
  const [ExcalidrawComp, setExcalidrawComp] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const initRef = useRef(false);

  const loadExcalidraw = useCallback(() => {
    if (initRef.current) return;
    initRef.current = true;

    Promise.all([
      import('@excalidraw/excalidraw'),
      import('@excalidraw/excalidraw/index.css').catch(() => {}),
    ])
      .then(([mod]) => {
        setExcalidrawComp(() => mod.Excalidraw);
      })
      .catch((err) => {
        setLoadError(err?.message || '加载编辑器失败');
      });
  }, []);

  React.useEffect(() => { loadExcalidraw(); }, [loadExcalidraw]);

  const getInitialData = useCallback(async () => {
    const lockedAppState = {
      activeTool: { type: 'selection', locked: true },
    };

    if (annotations) {
      try {
        const saved = JSON.parse(annotations);
        if (saved.elements && saved.files) {
          return { elements: saved.elements, files: saved.files, appState: lockedAppState, scrollToContent: true };
        }
      } catch {}
    }

    const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');

    const img = new Image();
    img.src = imageUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const fileId = 'bg-image-file';
    const elements = convertToExcalidrawElements([
      {
        type: 'image',
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
        fileId: fileId as any,
        locked: true,
      },
    ]);

    const files: Record<string, any> = {
      [fileId]: {
        id: fileId,
        dataURL: imageUrl,
        mimeType: 'image/png',
        created: Date.now(),
      },
    };

    return { elements, files, appState: lockedAppState, scrollToContent: true };
  }, [imageUrl, annotations]);

  const handleSave = async () => {
    const api = apiRef.current;
    if (!api) return;

    const { exportToBlob } = await import('@excalidraw/excalidraw');
    const elements = api.getSceneElements();
    const files = api.getFiles();
    const sceneJson = JSON.stringify({ elements, files });

    const blob = await exportToBlob({
      elements: elements as any,
      files,
      appState: { exportBackground: true } as any,
      getDimensions: () => {
        const bgEl = elements.find((el: any) => el.type === 'image' && el.locked);
        if (bgEl) {
          return { width: bgEl.width * 2, height: bgEl.height * 2, scale: 2 };
        }
        return { width: 1200, height: 800, scale: 2 };
      },
    });

    const reader = new FileReader();
    reader.onload = () => {
      onSave(sceneJson, reader.result as string);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex flex-col items-center justify-center"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[85vh] flex flex-col overflow-hidden">
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
          {loadError ? (
            <div className="flex items-center justify-center h-full text-red-500">{loadError}</div>
          ) : !ExcalidrawComp ? (
            <div className="flex items-center justify-center h-full text-gray-500">加载编辑器...</div>
          ) : (
            <ErrorBoundary>
              <ExcalidrawComp
                excalidrawAPI={(api: any) => { apiRef.current = api; }}
                initialData={getInitialData}
                langCode="zh-CN"
                theme="light"
              />
            </ErrorBoundary>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-gray-200 bg-gray-50">
          <button
            className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleSave}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
