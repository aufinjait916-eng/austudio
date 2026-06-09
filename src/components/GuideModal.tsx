import React from 'react';
import { X, Sparkles, Info } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#121212] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-800 flex flex-col max-h-[90vh]">
        
        {/* Banner with style */}
        <div className="bg-gradient-to-r from-[#1c1c1c] to-[#121212] p-6 text-white border-b border-zinc-800 relative">
          <button
            id="close-guide-btn"
            onClick={onClose}
            className="absolute top-4 right-4 bg-zinc-800/85 hover:bg-zinc-700 text-white rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30 text-amber-550">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans text-white">Product Placement Guide</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Analyze photo inputs & achieve consistent results</p>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-zinc-300 leading-relaxed bg-[#121212]">
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs flex items-center justify-center font-bold">1</span>
              How does consistency work?
            </h4>
            <p className="text-zinc-400 text-xs pl-7 leading-relaxed">
              The application leverages <strong>photo-to-photo editing conditioning</strong> using state-of-the-art Gemini Generative Image Models. It processes the clean white background input product, identifies design properties, and replaces ambient elements to produce beautiful lifestyle photos.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs flex items-center justify-center font-bold">2</span>
              User Required Outputs Checklist
            </h4>
            <ul className="text-xs text-zinc-400 pl-7 space-y-2.5 list-disc">
              <li>
                <strong>Product on light colored satin:</strong> Highlights premium fluid folds, soft reflections, and delicate sheen to emulate catalog standards.
              </li>
              <li>
                <strong>Product on dressing table / desk:</strong> Integrates relatable props in field-of-depth blur (such as quilted handbags or flower vases) to establish a natural setting.
              </li>
              <li>
                <strong>Product on model (no face):</strong> Cropped photography showing the product being naturally worn on the wrist, finger, or neck depending on the category. Face is cropped out to focus purely on item detail.
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs bg-[#1a1a1a] p-4 rounded-xl border border-zinc-800 text-zinc-400">
            <div className="flex items-center gap-2 font-semibold text-amber-400">
              <Info className="h-4 w-4 shrink-0" />
              Pro Tips for Image Selection
            </div>
            <p className="mt-1 leading-relaxed text-zinc-400">
              For best results, upload images where the product is clearly defined and isolated on a solid white background. Avoid uploading products with strong existing shadows or cluttered background scenes.
            </p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="p-4 border-t border-zinc-800/80 flex items-center justify-end bg-[#181818]/65">
          <button
            id="close-guide-footer-btn"
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2 px-6 rounded-xl cursor-pointer transition-colors uppercase tracking-wider font-sans"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
}
