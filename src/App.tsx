/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import ImageUploader from './components/ImageUploader';
import PresetConfigurator from './components/PresetConfigurator';
import SceneOutput from './components/SceneOutput';
import GuideModal from './components/GuideModal';
import PreviewModal from './components/PreviewModal';
import { ProductCategory, SceneType, GenerationResult } from './types';
import { Wand2, AlertCircle, Info, Sparkles, Loader2 } from 'lucide-react';

function getScaledImage(base64: string, scale: number): Promise<string> {
  if (scale === 1.0) {
    return Promise.resolve(base64);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const dx = (canvas.width - newWidth) / 2;
        const dy = (canvas.height - newHeight) / 2;

        ctx.drawImage(img, dx, dy, newWidth, newHeight);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(base64);
      }
    };
    img.onerror = () => {
      resolve(base64);
    };
    img.src = base64;
  });
}

export default function App() {
  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem('luxestyle_session_token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Theme support
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('luxestyle_theme');
    return saved ? saved === 'dark' : true;
  });

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('luxestyle_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Dimensional scale fields requested by user
  const [productWidth, setProductWidth] = useState<string>('');
  const [productLength, setProductLength] = useState<string>('');
  const [productUnit, setProductUnit] = useState<string>('cm');
  const [applySizeReduction, setApplySizeReduction] = useState<boolean>(false);

  // Auto detect small dimensions to recommend 50% scale reduction
  useEffect(() => {
    if (productWidth && productLength) {
      const w = parseFloat(productWidth);
      const l = parseFloat(productLength);
      if (!isNaN(w) && !isNaN(l)) {
        const isSmallInCm = productUnit === 'cm' && (w < 3 || l < 3);
        const isSmallInMm = productUnit === 'mm' && (w < 30 || l < 30);
        const isSmallInInches = productUnit === 'inch' && (w < 1.2 || l < 1.2);
        
        if (isSmallInCm || isSmallInMm || isSmallInInches) {
          setApplySizeReduction(true);
        } else {
          setApplySizeReduction(false);
        }
      }
    }
  }, [productWidth, productLength, productUnit]);

  const [hasApiKey, setHasApiKey] = useState(true);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('wrist_wear');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-image');
  const [aspectRatio, setAspectRatio] = useState<string>('5:4');
  const [productScale, setProductScale] = useState<number>(1.0);
  const [commonPrompt, setCommonPrompt] = useState<string>('');
  
  // 4-Word SEO Phrase States
  const [seoPhrase, setSeoPhrase] = useState<string>('');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState<boolean>(false);
  const [seoError, setSeoError] = useState<string | null>(null);


  // Prompts for each scene category
  const [prompts, setPrompts] = useState<Record<SceneType, string>>({
    satin_fabric: '',
    lifestyle_vanity: '',
    model_wear: ''
  });

  // Modal display states
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    prompt: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    prompt: ''
  });

  // Generation Results tracking state
  const [outputs, setOutputs] = useState<Record<SceneType, GenerationResult>>({
    satin_fabric: {
      sceneId: 'satin_fabric',
      title: '1. Premium Satin Sheet',
      promptUsed: '',
      status: 'idle'
    },
    lifestyle_vanity: {
      sceneId: 'lifestyle_vanity',
      title: '2. Elegant Dressing Table',
      promptUsed: '',
      status: 'idle'
    },
    model_wear: {
      sceneId: 'model_wear',
      title: '3. Model Placement (Wrist/Worn)',
      promptUsed: '',
      status: 'idle'
    }
  });

  // Check session token with the backend upon loading
  useEffect(() => {
    const token = localStorage.getItem('luxestyle_session_token');
    if (!token) {
      setIsAuthChecking(false);
      return;
    }

    fetch('/api/auth-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setSessionToken(token);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('luxestyle_session_token');
          setSessionToken(null);
          setIsAuthenticated(false);
        }
      })
      .catch((err) => {
        console.error('Failed to verify session token:', err);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  // Fetch API configuration when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(!!data.hasApiKey);
      })
      .catch((err) => {
        console.error('Failed to contact config API: ', err);
      });
  }, [isAuthenticated]);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('luxestyle_session_token', token);
    setSessionToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' })
      .finally(() => {
        localStorage.removeItem('luxestyle_session_token');
        setSessionToken(null);
        setIsAuthenticated(false);
      });
  };

  const handleImageSelected = (base64Data: string, name: string) => {
    setSelectedImageBase64(base64Data);
    setSelectedImageName(name);
    setSeoPhrase('');
    setSeoError(null);

    // Dynamic reset past generations
    setOutputs({
      satin_fabric: {
        sceneId: 'satin_fabric',
        title: '1. Premium Satin Sheet',
        promptUsed: prompts.satin_fabric,
        status: 'idle'
      },
      lifestyle_vanity: {
        sceneId: 'lifestyle_vanity',
        title: '2. Elegant Dressing Table',
        promptUsed: prompts.lifestyle_vanity,
        status: 'idle'
      },
      model_wear: {
        sceneId: 'model_wear',
        title: '3. Model Placement (Wrist/Worn)',
        promptUsed: prompts.model_wear,
        status: 'idle'
      }
    });
  };

  const handleClearImage = () => {
    setSelectedImageBase64(null);
    setSelectedImageName(null);
    setSeoPhrase('');
    setSeoError(null);
    setOutputs({
      satin_fabric: {
        sceneId: 'satin_fabric',
        title: '1. Premium Satin Sheet',
        promptUsed: '',
        status: 'idle'
      },
      lifestyle_vanity: {
        sceneId: 'lifestyle_vanity',
        title: '2. Elegant Dressing Table',
        promptUsed: '',
        status: 'idle'
      },
      model_wear: {
        sceneId: 'model_wear',
        title: '3. Model Placement (Wrist/Worn)',
        promptUsed: '',
        status: 'idle'
      }
    });
  };

  const handleGenerateSeoPhrase = async () => {
    if (!selectedImageBase64) return;
    setIsGeneratingSeo(true);
    setSeoError(null);
    try {
      const response = await fetch('/api/generate-seo-phrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          base64Image: selectedImageBase64
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'The server returned an unexpected failure state.');
      }
      setSeoPhrase(data.phrase);
    } catch (err: any) {
      console.error('SEO phrase generation failed:', err);
      setSeoError(err.message || 'An error occurred during SEO phrase generation.');
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const handlePromptChange = (sceneId: SceneType, newPrompt: string) => {
    setPrompts((prev) => ({
      ...prev,
      [sceneId]: newPrompt
    }));
  };

  // Generate an individual scene
  const generateIndividualScene = async (sceneId: SceneType) => {
    if (!selectedImageBase64) {
      alert('Please upload/select a product image first.');
      return;
    }

    let dimensionInstruct = '';
    if (productWidth && productLength) {
      dimensionInstruct = ` The physical product dimensions are ${productWidth} ${productUnit} wide and ${productLength} ${productUnit} long/high. It is critical to properly place and scale the product to these exact real-world dimensions relative to the surrounding props (like flowers, perfume bottles, velvet lining) or the hands, finger, shoulders, ears of the human model. Render the product at its accurate scale and size to match these proportions beautifully without any size warping.`;
    }
    if (applySizeReduction) {
      dimensionInstruct += ` For realistic results, render the product 50% smaller and delicately sized on the model or scene to match its lightweight and dainty nature perfectly.`;
    }

    setOutputs((prev) => ({
      ...prev,
      [sceneId]: {
        ...prev[sceneId],
        promptUsed: `${prompts[sceneId].trim()}${dimensionInstruct}${commonPrompt ? ` | Common: ${commonPrompt.trim()}` : ''}`,
        status: 'generating',
        error: undefined
      }
    }));

    try {
      // Map 5:4 ratio to closest API supported ratio 4:3
      const apiAspectRatio = aspectRatio === '5:4' ? '4:3' : aspectRatio;
      
      // Ensure the generated image focuses sharply on the product with a close-up shot as requested
      let focusMessage = "The product must have a close-up shot, keeping the extra space and outer margins around the product minimal. Zoom in closely to ensure the product itself occupies the dominant portion of the frame and is the absolute main focus in the generated image.";
      
      if (selectedCategory === 'earring' || selectedCategory === 'pendant') {
        focusMessage = "The product must have a pristine close-up macro shot. The product must stay perfectly in the center of the generated image, and contain a superb, sharp close-up focus placed entirely and directly on the product itself with magnificent high-end clarity, minimizing all surrounding margins and background space.";
      }
      
      if (selectedCategory === 'ring' && sceneId === 'model_wear') {
        focusMessage += " CRITICAL: The ring must be worn properly ON/IN the finger (the model's finger must slide completely through the center loop of the ring, sitting snugly and realistically around the base of the finger or knuckle. Do not display the ring floating on top or balanced flat on the finger).";
      }

      const enhancedPrompt = `${prompts[sceneId].trim()}${dimensionInstruct} ${commonPrompt ? `${commonPrompt.trim()} ` : ''}${focusMessage}`;

      // Process and scale the product image before sending to API (with 50% dainty size reduction support)
      const finalScale = applySizeReduction ? productScale * 0.5 : productScale;
      const scaledBase64 = await getScaledImage(selectedImageBase64, finalScale);

      const response = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          base64Image: scaledBase64,
          prompt: enhancedPrompt,
          sceneId: sceneId,
          modelName: selectedModel,
          aspectRatio: apiAspectRatio
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'The server returned an unexpected failure state.');
      }

      setOutputs((prev) => ({
        ...prev,
        [sceneId]: {
          ...prev[sceneId],
          resultImageUrl: data.resultImageUrl,
          status: 'success'
        }
      }));
    } catch (err: any) {
      console.error(`Generation error inside [${sceneId}]: `, err);
      setOutputs((prev) => ({
        ...prev,
        [sceneId]: {
          ...prev[sceneId],
          status: 'failed',
          error: err.message || 'Network communication error'
        }
      }));
    }
  };

  // Generate all 3 scenes in parallel (User's primary requirement!)
  const generateAllScenes = async () => {
    if (!selectedImageBase64) {
      alert('Please upload/select a product image to begin.');
      return;
    }

    // Simultaneously trigger all three scene requests
    const tasks: Promise<void>[] = [];
    
    const sceneIds: SceneType[] = ['satin_fabric', 'lifestyle_vanity', 'model_wear'];
    sceneIds.forEach((id) => {
      tasks.push(generateIndividualScene(id));
    });

    await Promise.all(tasks);
  };

  const isGeneratingAny = (Object.values(outputs) as GenerationResult[]).some((item) => item.status === 'generating');

  const handleViewImage = (imageUrl: string, title: string, prompt: string) => {
    setPreviewState({
      isOpen: true,
      imageUrl,
      title,
      prompt
    });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <h2 className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
            Verifying Authentication Parameters...
          </h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-white leading-normal antialiased transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0a0a0a] text-zinc-350' : 'bg-zinc-100 text-zinc-700'
    }`}>
      <Header 
        onShowHelp={() => setShowHelpModal(true)} 
        hasApiKey={hasApiKey} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Alert if API key is missing */}
        {!hasApiKey && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex gap-3 text-rose-200 shadow-md">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-rose-300">Missing Backend Credentials</h3>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                We couldn't detect a configured <strong>GEMINI_API_KEY</strong> environment variable. Please click on the <strong>Settings &gt; Secrets</strong> panel in the AI Studio sidebar to specify yours.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard grid: Left selection, Right Config editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left section panel */}
          <div className="lg:col-span-5 space-y-6">
            <ImageUploader
              onImageSelected={handleImageSelected}
              selectedImageBase64={selectedImageBase64}
              selectedImageName={selectedImageName}
              onClear={handleClearImage}
              productScale={productScale}
              onScaleChange={setProductScale}
              commonPrompt={commonPrompt}
              onCommonPromptChange={setCommonPrompt}
              onGenerateSeoPhrase={handleGenerateSeoPhrase}
              seoPhrase={seoPhrase}
              isGeneratingSeo={isGeneratingSeo}
              seoError={seoError}
              productWidth={productWidth}
              onProductWidthChange={setProductWidth}
              productLength={productLength}
              onProductLengthChange={setProductLength}
              productUnit={productUnit}
              onProductUnitChange={setProductUnit}
              applySizeReduction={applySizeReduction}
              onApplySizeReductionChange={setApplySizeReduction}
              isDarkMode={isDarkMode}
            />

            {/* Instruction Callout */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 transition-colors ${
              isDarkMode ? 'bg-[#121212] border-zinc-805/80 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                <Info className="h-4 w-4 text-amber-500" />
                <span className={isDarkMode ? 'text-white' : 'text-zinc-800'}>How to Get Best Results</span>
              </div>
              <p className={`leading-relaxed ${isDarkMode ? 'text-zinc-405' : 'text-zinc-550'}`}>
                Gemini's Image Editing works best on clean catalog images where the item is sharp and isolated against a clean solid-white or neutral-grey background. High quality reference jewelry yields pristine consistent renders.
              </p>
            </div>
          </div>

          {/* Right section panel presets */}
          <div className="lg:col-span-7 space-y-6">
            <PresetConfigurator
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              prompts={prompts}
              onPromptChange={handlePromptChange}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              isDarkMode={isDarkMode}
            />

            {/* Render All Call to Action Bar */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl transition-colors ${
              isDarkMode ? 'bg-[#121212] border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <div className="hidden sm:block">
                <h3 className={`text-xs font-semibold uppercase tracking-widest font-mono ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>Parallel Rendering</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Generates all 3 luxury placements simultaneously</p>
              </div>

              <button
                id="generate-all-btn"
                disabled={!selectedImageBase64 || isGeneratingAny}
                onClick={generateAllScenes}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 border shadow-md ${
                  !selectedImageBase64 
                    ? isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-650 cursor-not-allowed'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-400 cursor-not-allowed'
                    : isGeneratingAny
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 cursor-wait animate-pulse'
                    : 'bg-amber-500 border-transparent hover:bg-amber-400 text-black hover:scale-[1.01]'
                }`}
              >
                <Wand2 className={`h-4 w-4 ${isGeneratingAny ? 'animate-spin' : ''}`} />
                {isGeneratingAny ? 'Active Render Pipelines...' : 'Generate All 3 Placements'}
              </button>
            </div>
          </div>

        </div>

        {/* Results grids visual outcomes */}
        <div className={`pt-4 border-t ${isDarkMode ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
          <SceneOutput
            outputs={outputs}
            onGenerateIndividual={generateIndividualScene}
            isGeneratingAll={isGeneratingAny}
            onViewImage={handleViewImage}
            selectedImageName={selectedImageName}
            isDarkMode={isDarkMode}
          />
        </div>

      </main>

      {/* Guide/Help Overlay modal drawer */}
      <GuideModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Lightbox photo preview */}
      <PreviewModal
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={previewState.imageUrl}
        title={previewState.title}
        prompt={previewState.prompt}
      />
    </div>
  );
}

