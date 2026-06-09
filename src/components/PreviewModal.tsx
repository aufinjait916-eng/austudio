import React from 'react';
import { X, Sliders, Play, Image, Sparkles } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  prompt: string;
}

export default function PreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  prompt
}: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
      <div className="bg-zinc-900 text-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-zinc-800 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left side viewport column */}
        <div className="flex-1 bg-black flex items-center justify-center p-6 relative min-h-[320px] md:min-h-[480px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
          <button
            id="close-preview-btn-top"
            onClick={onClose}
            className="absolute top-4 left-4 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full p-2 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Right side configuration context column */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-800 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-full">
                Active Placement
              </span>
              <h3 className="text-xl font-bold font-sans text-white mt-3.5 leading-tight">{title}</h3>
              <p className="text-xs text-zinc-400 mt-1">Rendered with Gemini Image Editing API</p>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                Prompt configuration template
              </label>
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/50">
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{prompt}</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60 text-xs text-zinc-400 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                To download, right click on image and select <strong>Save image as</strong> or use the download action in the grid.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              id="close-preview-btn-bottom"
              onClick={onClose}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Back to Studio
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
