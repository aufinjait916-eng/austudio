import React, { useState, useRef } from 'react';
import { Upload, FileImage, Clipboard, RefreshCw, Layers, CheckCircle2, Sliders, Sparkles } from 'lucide-react';
// @ts-ignore
import banglesDemoUrl from '../assets/images/product_demo_bangles_1780559661320.png';

interface ImageUploaderProps {
  onImageSelected: (base64Data: string, name: string) => void;
  selectedImageBase64: string | null;
  selectedImageName: string | null;
  onClear: () => void;
  productScale: number;
  onScaleChange: (scale: number) => void;
  commonPrompt: string;
  onCommonPromptChange: (prompt: string) => void;
  onGenerateSeoPhrase: () => void;
  seoPhrase: string;
  isGeneratingSeo: boolean;
  seoError: string | null;
  productWidth: string;
  onProductWidthChange: (width: string) => void;
  productLength: string;
  onProductLengthChange: (length: string) => void;
  productUnit: string;
  onProductUnitChange: (unit: string) => void;
  applySizeReduction: boolean;
  onApplySizeReductionChange: (apply: boolean) => void;
  isDarkMode?: boolean;
}

export default function ImageUploader({
  onImageSelected,
  selectedImageBase64,
  selectedImageName,
  onClear,
  productScale,
  onScaleChange,
  commonPrompt,
  onCommonPromptChange,
  onGenerateSeoPhrase,
  seoPhrase,
  isGeneratingSeo,
  seoError,
  productWidth,
  onProductWidthChange,
  productLength,
  onProductLengthChange,
  productUnit,
  onProductUnitChange,
  applySizeReduction,
  onApplySizeReductionChange,
  isDarkMode = true
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (seoPhrase) {
      navigator.clipboard.writeText(seoPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG/JPG/WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerLoader = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-xl space-y-4 transition-colors ${
      isDarkMode ? 'bg-[#121212] border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-zinc-900'
        }`}>
          <Layers className="h-4 w-4 text-amber-500" />
          1. Input Product Image
        </h2>
        {selectedImageBase64 && (
          <button
            id="clear-img-btn"
            onClick={onClear}
            className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${
              isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Clear image
          </button>
        )}
      </div>

      {!selectedImageBase64 ? (
        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            id="dropzone"
            onClick={triggerLoader}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/5 scale-[0.99]'
                : isDarkMode
                ? 'border-zinc-800 bg-[#141414]/30 hover:border-zinc-700 hover:bg-[#1c1c1c]/30 text-zinc-350'
                : 'border-zinc-250 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100/50 text-zinc-600'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400 shadow-sm'
            }`}>
              <Upload className="h-5 w-5" />
            </div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Drag and drop your product photo</p>
            <p className="text-xs text-zinc-500 mt-1">PNG, JPG or WEBP (Works best on solid white background)</p>
            <div className={`mt-4 inline-flex items-center gap-2 px-3 rounded-lg text-xs py-1.5 transition-colors border ${
              isDarkMode 
                ? 'bg-zinc-850 border-zinc-750 hover:bg-zinc-800 text-zinc-300' 
                : 'bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-600 shadow-sm'
            }`}>
              <FileImage className="h-3.5 w-3.5 text-zinc-400" />
              Browse file
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Active Preview Area supporting Drag & Drop replacement */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-xl overflow-hidden aspect-video flex items-center justify-center border transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10 scale-[0.99] shadow-inner shadow-amber-500/20'
                : isDarkMode
                ? 'border-zinc-805 bg-zinc-950/40'
                : 'border-zinc-200 bg-zinc-50/80 shadow-inner'
            }`}
          >
            <img
              src={selectedImageBase64}
              alt="Selected Product"
              className="max-h-full max-w-full object-contain p-4 transition-all duration-150 ease-out"
              style={{ transform: `scale(${productScale})` }}
              referrerPolicy="no-referrer"
            />
            
            {isDragging ? (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 text-amber-500">
                <Upload className="h-8 w-8 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider">Drop to replace product!</span>
              </div>
            ) : (
              <>
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-emerald-550/90 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-md uppercase tracking-wider bg-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  White Background Loaded
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-zinc-300 text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Drag & drop new file here to switch
                </div>
              </>
            )}
          </div>

          {/* Product Scale / Zoom Control Slider */}
          <div className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
            isDarkMode ? 'bg-[#18181b]/60 border-zinc-805/80' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-350' : 'text-zinc-700'}`}>
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                Product Scale / Size
              </span>
              <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                {Math.round(productScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.8"
              step="0.05"
              value={productScale}
              onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none ${
                isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.2x (Ultra Small)</span>
              <span>1.0x (Original)</span>
              <span>1.8x (Closeup / Zoomed)</span>
            </div>
          </div>

          {/* New Feature: Product Physical Dimensions inputs */}
          <div className={`p-4 rounded-xl border space-y-3 transition-all ${
            isDarkMode ? 'bg-[#18181b]/60 border-zinc-805/80' : 'bg-zinc-50 border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                Product Physical Dimensions
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              Provide actual width and length. This guides Gemini to output a lifelike proportion when placing the product on models or next to table props.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Width</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={productWidth}
                  onChange={(e) => onProductWidthChange(e.target.value)}
                  placeholder="e.g. 5"
                  className={`w-full text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-amber-500/25 ${
                    isDarkMode 
                      ? 'bg-[#0d0d0d] border border-zinc-800 text-white placeholder-zinc-700' 
                      : 'bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Length</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={productLength}
                  onChange={(e) => onProductLengthChange(e.target.value)}
                  placeholder="e.g. 5"
                  className={`w-full text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-amber-500/25 ${
                    isDarkMode 
                      ? 'bg-[#0d0d0d] border border-zinc-800 text-white placeholder-zinc-700' 
                      : 'bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Unit</label>
                <select
                  value={productUnit}
                  onChange={(e) => onProductUnitChange(e.target.value)}
                  className={`w-full text-xs font-medium rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-amber-500/25 ${
                    isDarkMode 
                      ? 'bg-[#0d0d0d] border border-zinc-800 text-white' 
                      : 'bg-white border border-zinc-300 text-zinc-900'
                  }`}
                >
                  <option value="cm" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>cm (Centimeter)</option>
                  <option value="mm" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>mm (Millimeter)</option>
                  <option value="inch" className={isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}>in (Inches)</option>
                </select>
              </div>
            </div>

            {/* 50% Size Reduction Control */}
            <div className={`mt-3 pt-3 border-t flex items-start gap-2.5 transition-colors ${
              isDarkMode ? 'border-zinc-800' : 'border-zinc-200'
            }`}>
              <input
                id="apply-size-reduction-checkbox"
                type="checkbox"
                checked={applySizeReduction}
                onChange={(e) => onApplySizeReductionChange(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-amber-500 focus:ring-amber-500/25 accent-amber-500 cursor-pointer mt-0.5"
              />
              <div 
                className="space-y-0.5 cursor-pointer select-none flex-1" 
                onClick={() => onApplySizeReductionChange(!applySizeReduction)}
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <label className={`text-xs font-bold leading-none ${
                    isDarkMode ? 'text-zinc-250' : 'text-zinc-850'
                  }`}>
                    Apply 50% Size Reduction
                  </label>
                  <span className="text-[9px] bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Recommended for mm
                  </span>
                </div>
                <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-zinc-500' : 'text-zinc-550'}`}>
                  Fits delicate catalog shots (like rings & earrings under 30mm) perfectly, preventing oversized elements on the human model.
                </p>
              </div>
            </div>
          </div>

          {/* Input file details and clear options */}
          <div className={`p-3 rounded-xl border flex flex-col gap-3 transition-colors ${
            isDarkMode ? 'bg-[#1c1c1c] border-zinc-800/85' : 'bg-zinc-50 border-zinc-200 shadow-sm'
          }`}>
            <div className={`truncate w-full pb-2 border-b ${isDarkMode ? 'border-zinc-850' : 'border-zinc-200'}`}>
              <p className="text-[10px] font-mono text-zinc-500 leading-none uppercase tracking-wider">Selected product</p>
              <p className={`text-xs font-semibold truncate mt-1.5 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedImageName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="change-img-btn"
                onClick={triggerLoader}
                className={`text-xs font-semibold cursor-pointer h-9 px-3 rounded-lg flex items-center justify-center transition-colors border gap-1.5 uppercase ${
                  isDarkMode 
                    ? 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border-amber-500/20' 
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-500/30'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                Change file
              </button>
              <button
                id="clear-img-btn-bottom"
                onClick={onClear}
                className={`text-xs font-semibold cursor-pointer h-9 px-3 rounded-lg flex items-center justify-center transition-colors border gap-1.5 uppercase ${
                  isDarkMode 
                    ? 'text-rose-500 hover:text-rose-450 hover:bg-rose-500/10 border-rose-500/15' 
                    : 'text-rose-600 hover:text-rose-705 hover:bg-rose-50 border-rose-200 shadow-sm'
                }`}
              >
                Clear Image
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* SEO Ecom Phrase Generator */}
          <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
            isDarkMode ? 'bg-[#18181b]/60 border-zinc-805/80' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center gap-1.5 font-sans ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <Sparkles className="h-4 w-4 text-amber-500" />
                SEO Ecom Title Generator
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">4-Word Spec</span>
            </div>

            {!seoPhrase ? (
              <button
                id="generate-seo-phrase-btn"
                onClick={onGenerateSeoPhrase}
                disabled={isGeneratingSeo}
                className={`w-full text-xs font-bold uppercase py-2.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isGeneratingSeo
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 cursor-wait animate-pulse'
                    : isDarkMode
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-[#1a1a1a] hover:border-zinc-700 hover:text-white'
                    : 'bg-white border-zinc-300 text-zinc-750 hover:bg-zinc-100 hover:border-zinc-400 hover:text-zinc-900'
                }`}
              >
                {isGeneratingSeo ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Analyzing product...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    Generate 4-Word SEO Title
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className={`flex items-center justify-between border p-2.5 rounded-lg text-xs transition-colors ${
                  isDarkMode ? 'bg-[#0d0d0d] border-zinc-850 text-zinc-200' : 'bg-white border-zinc-250 text-zinc-800'
                }`}>
                  <span className="font-sans font-semibold tracking-wide text-amber-500 dark:text-amber-400">{seoPhrase}</span>
                  <button
                    id="copy-seo-phrase-btn"
                    onClick={handleCopy}
                    className={`text-[10.5px] font-semibold flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-md transition-all border ${
                      isDarkMode 
                        ? 'text-zinc-300 bg-zinc-900/85 hover:text-white hover:bg-zinc-850 border-zinc-800/80' 
                        : 'text-zinc-700 bg-white hover:text-zinc-950 hover:bg-zinc-100 border-zinc-250'
                    }`}
                  >
                    {copied ? (
                      <span className="text-emerald-550 dark:text-emerald-400 font-bold uppercase tracking-wider text-[9px]">Copied!</span>
                    ) : (
                      <>
                        <Clipboard className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <p className="text-zinc-500 font-sans leading-tight">
                    Simple to read & SEO friendly for your ecom product.
                  </p>
                  <button
                    id="regenerate-seo-phrase-btn"
                    onClick={onGenerateSeoPhrase}
                    disabled={isGeneratingSeo}
                    className="text-[10px] text-amber-500 hover:text-amber-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RefreshCw className={`h-3 w-3 ${isGeneratingSeo ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            {seoError && (
              <p className="text-[11px] text-rose-500 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 font-sans">
                {seoError}
              </p>
            )}
          </div>

          {/* New Common Shared Prompt box for all scene styles */}
          <div className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
            isDarkMode ? 'bg-[#151515] border-zinc-805/80' : 'bg-zinc-50 border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <label className={`text-[10px] font-bold uppercase tracking-widest leading-none ${
                isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
                Shared Global Prompt Enrichment
              </label>
            </div>
            <textarea
              id="common-prompt-input"
              value={commonPrompt}
              onChange={(e) => onCommonPromptChange(e.target.value)}
              placeholder="e.g. realistic golden hour sunlight beams, soft studio key light casting delicate shadows, hyper-detailed commercial display magazine photography"
              rows={3}
              className={`w-full rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/10 resize-none leading-relaxed font-sans ${
                isDarkMode 
                  ? 'bg-[#0d0d0d] border border-zinc-850 text-zinc-300 placeholder-zinc-750' 
                  : 'bg-white border border-zinc-250 text-zinc-800 placeholder-zinc-400'
              }`}
            />
            <p className="text-[9px] text-zinc-500 leading-tight">
              Descriptors here will automatically be appended as environmental instructions to all 3 placements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
