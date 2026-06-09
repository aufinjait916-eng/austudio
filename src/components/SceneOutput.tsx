import React from 'react';
import { Eye, CheckCircle, RefreshCw, AlertTriangle, ArrowRight, Download, Sliders } from 'lucide-react';
import { GenerationResult, SceneType } from '../types';

interface SceneOutputProps {
  outputs: Record<SceneType, GenerationResult>;
  onGenerateIndividual: (sceneId: SceneType) => void;
  isGeneratingAll: boolean;
  onViewImage: (imageUrl: string, title: string, prompt: string) => void;
  selectedImageName?: string | null;
  isDarkMode?: boolean;
}

export default function SceneOutput({
  outputs,
  onGenerateIndividual,
  isGeneratingAll,
  onViewImage,
  selectedImageName,
  isDarkMode = true
}: SceneOutputProps) {

  const downloadImageHelper = (url: string, sceneId: SceneType) => {
    // Clean and sanitize base filename, default to 'product' if missing
    const baseName = selectedImageName
      ? selectedImageName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_')
      : 'product';

    // Map sceneId to requested image style type: 'satin', 'lifestyle', or 'model wear'
    let styleType = 'lifestyle';
    if (sceneId === 'satin_fabric') {
      styleType = 'satin';
    } else if (sceneId === 'model_wear') {
      styleType = 'model wear';
    }

    const filename = `${baseName}-${styleType}.png`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Create high-resolution 1500x1200 offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1500;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const targetWidth = 1500;
        const targetHeight = 1200;
        const targetRatio = targetWidth / targetHeight; // 1.25 ratio
        const imgRatio = img.width / img.height;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // Perform center crop keeping the aspect ratio consistent
        if (imgRatio > targetRatio) {
          sourceWidth = img.height * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (imgRatio < targetRatio) {
          sourceHeight = img.width / targetRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        try {
          const resizedUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = resizedUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (e) {
          console.error('Canvas processing failed, using fallback direct download', e);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-zinc-900'
          }`}>
            <Eye className="h-4 w-4 text-amber-500" />
            3. Lifestyle Placements Results
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Check generated images or retry specific settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(outputs) as [SceneType, GenerationResult][]).map(([sceneId, item]) => {
          const isIdle = item.status === 'idle';
          const isGenerating = item.status === 'generating';
          const isSuccess = item.status === 'success' && item.resultImageUrl;
          const isFailed = item.status === 'failed';

          return (
            <div
              key={sceneId}
              id={`scene-card-${sceneId}`}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col ${
                isGenerating 
                  ? 'border-amber-500/80 ring-2 ring-amber-500/10 shadow-lg' 
                  : isSuccess
                  ? isDarkMode ? 'bg-[#121212] border-zinc-800 hover:border-zinc-700 shadow-md' : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                  : isDarkMode ? 'bg-[#121212] border-[#1f1f1f]' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              {/* Card Header Info */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-zinc-800/80 bg-[#181818]/40' : 'border-zinc-200 bg-zinc-50/50'
              }`}>
                <div>
                  <h3 className={`text-xs font-semibold leading-tight ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[160px]">
                    {sceneId === 'satin_fabric' 
                      ? 'Satin Fabric backdrop' 
                      : sceneId === 'lifestyle_vanity' 
                      ? 'Vanity table placement' 
                      : 'Worn by human model'}
                  </p>
                </div>

                {isSuccess && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20 uppercase tracking-tight">
                    Ready
                  </span>
                )}
                {isGenerating && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-amber-500/20 animate-pulse">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                    Placing...
                  </span>
                )}
                {isFailed && (
                   <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-medium border border-rose-500/20">
                     Failed
                   </span>
                )}
                {isIdle && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                    isDarkMode ? 'bg-zinc-805 border-zinc-700 text-zinc-400' : 'bg-zinc-100 border-zinc-250 text-zinc-500'
                  }`}>
                    Pending
                  </span>
                )}
              </div>

              {/* Card Product Visual Frame */}
              <div className={`aspect-square relative flex items-center justify-center overflow-hidden border-b group max-h-[290px] ${
                isDarkMode ? 'bg-[#0b0b0b] border-zinc-800' : 'bg-zinc-55 border-zinc-200'
              }`}>
                {isSuccess && (
                  <>
                    <img
                      src={item.resultImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Actions Bar */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        id={`btn-view-${sceneId}`}
                        onClick={() => onViewImage(item.resultImageUrl!, item.title, item.promptUsed)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg p-2 text-xs font-semibold flex items-center gap-1 border border-zinc-700 shadow-md cursor-pointer transition-colors"
                      >
                        <Eye className="h-4 w-4 text-amber-500" />
                        Full Screen
                      </button>
                      <button
                        id={`btn-download-${sceneId}`}
                        onClick={() => downloadImageHelper(item.resultImageUrl!, sceneId)}
                        className="bg-amber-500 hover:bg-amber-400 text-black rounded-lg p-2 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </>
                )}

                {isGenerating && (
                  <div className="text-center p-6 space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/20 shadow-sm relative">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-amber-500 border border-zinc-900"></span>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>Placing product</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Retaining design details with Gemini</p>
                    </div>
                    {/* Animated pipeline bars */}
                    <div className="w-24 bg-zinc-800 h-1.5 rounded-full mx-auto overflow-hidden">
                      <div className="bg-amber-500 h-full w-2/3 rounded-full animate-marquee"></div>
                    </div>
                  </div>
                )}

                {isFailed && (
                   <div className="text-center p-6 space-y-2">
                     <div className="mx-auto h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-455 border border-rose-500/20">
                       <AlertTriangle className="h-5 w-5" />
                     </div>
                     <div>
                       <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>Failed to render</p>
                       <p className="text-[10px] text-rose-400 mt-1 max-w-[180px] line-clamp-2 leading-tight">
                         {item.error || 'Server rejected request'}
                       </p>
                     </div>
                     <button
                       id={`btn-retry-err-${sceneId}`}
                       disabled={isGeneratingAll}
                       onClick={() => onGenerateIndividual(sceneId)}
                       className="mt-2 text-xs text-amber-500 hover:text-amber-400 font-medium underline flex items-center gap-1 mx-auto cursor-pointer"
                     >
                       Retry scene
                     </button>
                   </div>
                )}

                {isIdle && (
                  <div className="text-center p-6 space-y-2">
                    <div className={`mx-auto h-10 w-10 rounded-full border flex items-center justify-center ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-250'
                    }`}>
                      <Sliders className={`h-4 w-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-405' : 'text-zinc-600'}`}>Awaiting product upload</p>
                    <p className="text-[10px] text-zinc-500">Preset loaded & ready</p>
                  </div>
                )}
              </div>

              {/* Bottom Card Prompts Preview & Button bar */}
              <div className={`p-4 flex-grow flex flex-col justify-between space-y-3 ${
                isDarkMode ? 'bg-[#121212]' : 'bg-white border-t border-zinc-200'
              }`}>
                <div className={`text-xs p-2.5 rounded-lg border flex-grow ${
                  isDarkMode ? 'bg-[#0b0b0b] border-zinc-800/85' : 'bg-zinc-50 border-zinc-205'
                }`}>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Prompt template</p>
                  <p className={`font-sans mt-0.5 line-clamp-3 leading-relaxed text-[11px] ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                    {item.promptUsed || 'No active prompt config'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    id={`btn-render-${sceneId}`}
                    onClick={() => onGenerateIndividual(sceneId)}
                    disabled={isGenerating || isGeneratingAll}
                    style={{ contentVisibility: 'auto' }}
                    className={`flex-grow py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isSuccess 
                        ? isDarkMode
                          ? 'bg-zinc-800 hover:bg-zinc-705 border-zinc-700 text-zinc-305' 
                          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-250 text-zinc-700'
                        : 'bg-amber-500 border-transparent text-black hover:bg-amber-400 font-bold'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Rendering...
                      </>
                    ) : (
                      <>
                        {isSuccess ? 'Re-render Shot' : 'Place Product'}
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
