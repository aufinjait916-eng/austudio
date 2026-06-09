import React, { useEffect, useState } from 'react';
import { Settings2, Sliders, Palette, Users, Shirt, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { ProductCategory, SceneType } from '../types';

interface PresetConfiguratorProps {
  selectedCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  prompts: Record<SceneType, string>;
  onPromptChange: (sceneId: SceneType, prompt: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (aspectRatio: string) => void;
  isDarkMode?: boolean;
}

// Highly stylized options dictionary divided by target gender
const OPTIONS_BY_GENDER = {
  women: {
    satinColor: [
      { value: 'light cream-colored', label: 'Soft Light Cream' },
      { value: 'blush rose-pink', label: 'Blush Rose Pink' },
      { value: 'champagne golden', label: 'Champagne Gold' },
      { value: 'lustrous pearl white', label: 'Lustrous Pearl White' },
      { value: 'rich emerald green', label: 'Rich Emerald Green' },
      { value: 'deep royal burgundy red', label: 'Deep Royal Burgundy' },
    ],
    satinFinish: [
      { value: 'high-gloss fluid silk', label: 'High-Gloss Fluid Silk' },
      { value: 'rich soft-matte satin', label: 'Rich Soft-Matte Satin' },
      { value: 'dramatically folded micro-crease silk', label: 'Dramatically Folded/Creased Silk' },
      { value: 'luxurious crinkled premium velvet with soft sheen', label: 'Luxurious Crinkled Velvet' },
    ],
    vanityMaterial: [
      { value: 'polished white Carrara marble', label: 'Polished White Carrara Marble' },
      { value: 'warm Scandinavian light oak wood', label: 'Warm Light Oak Wood' },
      { value: 'ivory high-gloss premium lacquer vanity', label: 'Ivory High-Gloss Lacquer' },
      { value: 'vintage gold-trimmed vanity mirror surface', label: 'Vintage Gold-Trimmed Mirror' },
    ],
    vanityProp: [
      { value: 'luxury crystal perfume bottle and soft jewelry dish', label: 'Luxury Crystal Perfume Bottle' },
      { value: 'fresh white roses arranged in a slender crystal vase', label: 'Fresh White Roses in Vase' },
      { value: 'designer leather clutch handbag relaxing in the soft background', label: 'Designer Leather Clutch Bag' },
      { value: 'plush open velvet jewelry ring box with satin lining', label: 'Plush Open Velvet Jewelry Box' },
    ],
    modelSkin: [
      { value: 'elegantly manicured soft feminine', label: 'Elegantly Manicured (Soft Feminine)' },
      { value: 'gorgeous warm-toned clear model skin with subtle glow', label: 'Warm-Toned Clear (Subtle Glow)' },
      { value: 'studio-lit high fashion skin with pristine nails', label: 'High Fashion Studio Skin' },
    ],
    modelOutfit: [
      { value: 'premium minimalist silk evening dress sleeve', label: 'Minimalist Silk Evening Dress' },
      { value: 'luxurious dark cashmere sweater sleeve', label: 'Luxurious Cashmere Sweater' },
      { value: 'classic off-shoulder satin bridal gown collar', label: 'Off-Shoulder Satin Gown/Collar' },
      { value: 'chic modern jewelry mannequin styling with soft fabrics', label: 'Chic Gown / Mannequin' },
    ]
  },
  men: {
    satinColor: [
      { value: 'charcoal slate-grey', label: 'Charcoal Slate' },
      { value: 'metallic silver-grey', label: 'Metallic Silver Grey' },
      { value: 'classic matte gold', label: 'Classic Matte Gold' },
      { value: 'midnight navy blue', label: 'Midnight Navy Blue' },
      { value: 'obsidian black', label: 'Obsidian Black' },
      { value: 'rich forest emerald green', label: 'Forest / Emerald Green' },
    ],
    satinFinish: [
      { value: 'heavy fluid matte satin with strong highlights', label: 'Heavy Fluid Matte Satin' },
      { value: 'sleek ultra-smooth dry-finish silk cloth', label: 'Sleek Dry-Finish Silk' },
      { value: 'structured premium wool-blend folded fabric', label: 'Structured Wool-Blend Folded' },
      { value: 'luxurious dark corduroy with elegant soft textures', label: 'Luxurious Textured Corduroy' },
    ],
    vanityMaterial: [
      { value: 'rich dark polished walnut wood executive table', label: 'Rich Polished Walnut Wood' },
      { value: 'brutalist matte slate-grey industrial concrete countertop', label: 'Brutalist Matte Grey Concrete' },
      { value: 'sleek modern smoked charcoal tempered-glass dressing tablescape', label: 'Smoked Temper-Glass' },
      { value: 'brushed industrial steel and dark slate workspace', label: 'Polished Steel & Slate Workspace' },
    ],
    vanityProp: [
      { value: 'premium mechanical chronograph executive watch', label: 'Premium Chronograph Watch' },
      { value: 'distressed dark leather pocket journal and a brass fountain pen', label: 'Leather Journal & Brass Pen' },
      { value: 'minimalist designer modern cologne bottle with metal accents', label: 'Minimalist Cologne Bottle' },
      { value: 'geometric contemporary matte-black ceramic tray', label: 'Geometric Ceramic Tray' },
    ],
    modelSkin: [
      { value: 'refined, clean-groomed masculine', label: 'Clean-Groomed Masculine' },
      { value: 'rugged elegant textured masculine skin under warm glow', label: 'Rugged Elegant (Warm Glow)' },
      { value: 'studio-lit masculine grooming with precise features', label: 'High-end Studio-Groomed' },
    ],
    modelOutfit: [
      { value: 'tailored bespoke charcoal wool suit cuff', label: 'Charcoal Wool Suit Cuff/Sleeve' },
      { value: 'premium heavy-knit black sweater cuff', label: 'Heavy-Knit Black Sweater' },
      { value: 'classic off-white linen collar dress shirt', label: 'Classic Linen Dress Shirt' },
      { value: 'modern dark leather bomber jacket sleeve details', label: 'Modern Leather Jacket' },
    ]
  }
};

// Generates cohesive, customized high-focus prompts according to selections
function compilePrompt(
  category: ProductCategory,
  sceneId: SceneType,
  gender: 'women' | 'men',
  options: {
    satinColor: string;
    satinFinish: string;
    vanityMaterial: string;
    vanityProp: string;
    modelSkin: string;
    modelOutfit: string;
  }
): string {
  const catLabels: Record<ProductCategory, string> = {
    wrist_wear: 'wristwear (bangle or bracelet)',
    ring: 'premium loop ring',
    pendant: 'pendant necklace',
    earring: 'earring'
  };

  const productLabel = catLabels[category];

  if (sceneId === 'satin_fabric') {
    if (category === 'pendant' || category === 'earring') {
      return `Luxury close-up photo of the ${productLabel} placed elegantly on a ${options.satinColor} premium satin cloth sheet, featuring a ${options.satinFinish} and rich fluid folds. Macro close-up shot keeping the ${productLabel} in the absolute center of the generated image, with a sharp focus staying on the centered product, minimizing extra background space around it.`;
    }
    return `Luxury close-up photo of the ${productLabel} placed elegantly on a ${options.satinColor} premium satin cloth sheet, featuring a ${options.satinFinish} and rich fluid folds. Macro close-up shot keeping the product in sharp central focus, minimizing extra background space around it.`;
  }

  if (sceneId === 'lifestyle_vanity') {
    let placementDetail = '';
    if (category === 'ring') {
      placementDetail = `resting elegant inside a plush velvet ring jewelry box, positioned beautifully on top of a ${options.vanityMaterial}`;
    } else {
      placementDetail = `resting elegantly flat on a ${options.vanityMaterial}`;
    }

    if (category === 'pendant' || category === 'earring') {
      return `High quality lifestyle photography of the ${productLabel} ${placementDetail}, and accompanied closely in soft focus by a ${options.vanityProp}. Micro close-up perspective showcasing rich textures, with the ${productLabel} positioned in the absolute center of the generated image. Ensure a sharp close-up focus on the centered product, keeping extra surrounding space minimal.`;
    }
    return `High quality lifestyle photography of the ${productLabel} ${placementDetail}, and accompanied closely in soft focus by a ${options.vanityProp}. Micro close-up perspective showcasing rich textures, with a sharp central focus on the product, keeping extra space minimal.`;
  }

  if (sceneId === 'model_wear') {
    if (category === 'ring') {
      return `Premium catalog close-up photo of the premium loop ring worn elegantly on the finger of a ${gender === 'women' ? 'female' : 'male'} model. CRITICAL details: The ring must be worn properly slid ON the finger (the model's finger must go completely through the center loop of the ring band, sitting snugly and realistically around the base of the finger near the knuckle, and never floating or balanced flat on top). The hand features ${options.modelSkin} skin details, beautifully accessorized with a ${options.modelOutfit}. Close-up macro catalog shot highlighting the jewelry on the finger, background softly blurred, cropped very tightly to keep the product as the dominant central focus with minimal extra outer space.`;
    }

    if (category === 'pendant') {
      return `Premium catalog close-up photo of the pendant necklace worn on the neck and collarbone of a ${gender === 'women' ? 'female' : 'male'} model. The pendant sits beautifully flat on the skin and stays in the absolute center of the generated image. Close-up macro shot directly focusing on the pendant details in the middle of the frame, sharp focus on the central pendant, background in soft bokeh blur with the face elegantly cropped out to keep extra margins minimal and focus maximal.`;
    }

    if (category === 'earring') {
      return `Premium catalog close-up photo of the earring worn on the earlobe of a ${gender === 'women' ? 'female' : 'male'} model. The camera captures a side-profile or angled macro close-up shot of one ear lobe so the earring is positioned in the absolute center of the generated image. Close-up macro catalog shot directly and sharply focusing on the details of the earring at the center, backdrop softly blurred, cropped tightly to maximize the product visual clarity and minimize extra outer margins around the ear.`;
    }

    // Wrist Wear
    return `Premium catalog close-up photo of the wristwear (bangle or bracelet) worn on the wrist of a ${gender === 'women' ? 'female' : 'male'} model's hand. The wrist has ${options.modelSkin} skin details, beautifully styled under a ${options.modelOutfit}. Macro close-up shot focusing directly on the details of the bangle on the wrist, soft focus background, face cropped out, cropped tightly to minimize extra borders.`;
  }

  return '';
}

export default function PresetConfigurator({
  selectedCategory,
  onCategoryChange,
  prompts,
  onPromptChange,
  selectedModel,
  onModelChange,
  aspectRatio,
  onAspectRatioChange,
  isDarkMode = true
}: PresetConfiguratorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [targetGender, setTargetGender] = useState<'women' | 'men'>('women');

  // Option states for customization
  const [satinColor, setSatinColor] = useState('');
  const [satinFinish, setSatinFinish] = useState('');
  const [vanityMaterial, setVanityMaterial] = useState('');
  const [vanityProp, setVanityProp] = useState('');
  const [modelSkin, setModelSkin] = useState('');
  const [modelOutfit, setModelOutfit] = useState('');

  // Track visibility of generated raw prompts for debug / verification
  const [visiblePrompts, setVisiblePrompts] = useState<Record<SceneType, boolean>>({
    satin_fabric: false,
    lifestyle_vanity: false,
    model_wear: false
  });

  const togglePromptVisibility = (sceneId: SceneType) => {
    setVisiblePrompts(prev => ({ ...prev, [sceneId]: !prev[sceneId] }));
  };

  // 1. Initialize and update default options list when target gender or category is selected
  useEffect(() => {
    const list = OPTIONS_BY_GENDER[targetGender];
    setSatinColor(list.satinColor[0].value);
    setSatinFinish(list.satinFinish[0].value);
    setVanityMaterial(list.vanityMaterial[0].value);
    setVanityProp(list.vanityProp[0].value);
    setModelSkin(list.modelSkin[0].value);
    setModelOutfit(list.modelOutfit[0].value);
  }, [targetGender, selectedCategory]);

  // 2. Compile and push computed prompts to App state on any choice alteration
  useEffect(() => {
    if (!satinColor || !satinFinish || !vanityMaterial || !vanityProp || !modelSkin || !modelOutfit) {
      return;
    }

    const currentOptions = { satinColor, satinFinish, vanityMaterial, vanityProp, modelSkin, modelOutfit };

    const p1 = compilePrompt(selectedCategory, 'satin_fabric', targetGender, currentOptions);
    const p2 = compilePrompt(selectedCategory, 'lifestyle_vanity', targetGender, currentOptions);
    const p3 = compilePrompt(selectedCategory, 'model_wear', targetGender, currentOptions);

    onPromptChange('satin_fabric', p1);
    onPromptChange('lifestyle_vanity', p2);
    onPromptChange('model_wear', p3);
  }, [selectedCategory, targetGender, satinColor, satinFinish, vanityMaterial, vanityProp, modelSkin, modelOutfit]);

  return (
    <div className={`p-6 rounded-2xl border shadow-xl space-y-6 transition-colors ${
      isDarkMode 
        ? 'bg-[#121212] border-zinc-800 text-zinc-300' 
        : 'bg-white border-zinc-200 text-zinc-750 shadow-sm'
    }`}>
      <div>
        <h2 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-zinc-900'
        }`}>
          <Sliders className="h-4 w-4 text-amber-500" />
          2. Scene Configuration Options
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Select drop-down parameters to customize output backdrops instead of typing prompts</p>
      </div>

      {/* Grid containing Category selector & Target Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category selector */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Product Category</label>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { cat: 'wrist_wear', label: 'Wrist Wear (Bangle/Bracelet)' },
              { cat: 'ring', label: 'Ring (Worn on Finger)' },
              { cat: 'pendant', label: 'Pendant (Worn on Neck)' },
              { cat: 'earring', label: 'Earring (Worn on Ear)' }
            ].map(({ cat, label }) => (
              <button
                key={cat}
                id={`cat-btn-${cat}`}
                onClick={() => onCategoryChange(cat as ProductCategory)}
                className={`p-2.5 rounded-xl text-xs font-bold border text-left cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'border-amber-500 bg-amber-505/15 text-amber-500 dark:text-amber-400 font-bold'
                    : isDarkMode
                    ? 'border-zinc-800 bg-[#1c1c1c]/45 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    : 'border-zinc-250 bg-zinc-50 text-zinc-600 hover:border-zinc-350 hover:bg-zinc-100 hover:text-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Group Gender Selector */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            <Users className="h-3.5 w-3.5 text-zinc-405" />
            Jewelry Target User (Gender Style)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'women', label: 'For Women', desc: 'Feminine attire & manicures' },
              { value: 'men', label: 'For Men', desc: 'Masculine sleeves & styling' }
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                id={`gender-btn-${value}`}
                onClick={() => setTargetGender(value as 'women' | 'men')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  targetGender === value
                    ? 'border-amber-500 bg-amber-505/15 text-amber-505 dark:text-amber-400 font-bold'
                    : isDarkMode
                    ? 'border-zinc-800 bg-[#1c1c1c]/45 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    : 'border-zinc-250 bg-zinc-50 text-zinc-650 hover:border-zinc-350 hover:bg-zinc-100 hover:text-zinc-850'
                }`}
              >
                <span className="text-xs">{label}</span>
                <span className="text-[9px] text-zinc-500 font-normal leading-tight">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Styled drop-down selectors instead of raw prompt textareas */}
      <div className={`space-y-5 border-t pt-5 ${isDarkMode ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
        <div className="flex items-center justify-between pb-1">
          <label className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Backdrop Options Grid</label>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider border ${
            isDarkMode 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-500' 
              : 'bg-zinc-100 border-zinc-200 text-zinc-600 shadow-inner'
          }`}>
            All 3 Configured
          </span>
        </div>

        {/* 1. Satin Fabric Container */}
        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
          isDarkMode ? 'bg-[#161616] border-zinc-800' : 'bg-zinc-50/50 border-zinc-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-zinc-250' : 'text-zinc-800'}`}>1. Premium Satin Sheet</h4>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Laid elegante on waving cloth backdrop</p>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20">
              Satin Output
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Palette className="h-3 w-3 text-amber-500/80" /> Satin Color
              </label>
              <select
                id="select-satin-color"
                value={satinColor}
                onChange={(e) => setSatinColor(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/15 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0e0e0e] border-zinc-800 text-zinc-300' 
                    : 'bg-white border-zinc-300 text-zinc-805 shadow-sm'
                }`}
              >
                {OPTIONS_BY_GENDER[targetGender].satinColor.map(opt => (
                  <option key={opt.value} value={opt.value} className={isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-white text-zinc-800"}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Sliders className="h-3 w-3 text-amber-500/80" /> Finish / Texture
              </label>
              <select
                id="select-satin-finish"
                value={satinFinish}
                onChange={(e) => setSatinFinish(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/15 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0e0e0e] border-zinc-800 text-zinc-300' 
                    : 'bg-white border-zinc-300 text-zinc-805 shadow-sm'
                }`}
              >
                {OPTIONS_BY_GENDER[targetGender].satinFinish.map(opt => (
                  <option key={opt.value} value={opt.value} className={isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-white text-zinc-800"}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inspect Generated Prompt */}
          <div className="pt-1.5">
            <button
              onClick={() => togglePromptVisibility('satin_fabric')}
              className={`text-[10px] flex items-center gap-1 transition-colors outline-none cursor-pointer ${
                isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-450 hover:text-zinc-700'
              }`}
            >
              {visiblePrompts.satin_fabric ? 'Hide compiled prompt' : 'Show compiled prompt'}
              <HelpCircle className="h-3 w-3" />
            </button>
            {visiblePrompts.satin_fabric && (
              <div className="mt-2 text-[10px] font-mono text-zinc-500 bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-900 leading-normal max-h-24 overflow-y-auto">
                {prompts.satin_fabric}
              </div>
            )}
          </div>
        </div>

        {/* 2. Elegant Dressing Table Container */}
        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
          isDarkMode ? 'bg-[#161616] border-zinc-800' : 'bg-zinc-50/50 border-zinc-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-zinc-250' : 'text-zinc-800'}`}>2. Elegant Dressing Table</h4>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Places on table countertop with props</p>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20">
              Table Output
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Palette className="h-3 w-3 text-amber-500/80" /> Table Material / Color
              </label>
              <select
                id="select-table-material"
                value={vanityMaterial}
                onChange={(e) => setVanityMaterial(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/15 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0e0e0e] border-zinc-800 text-zinc-300' 
                    : 'bg-white border-zinc-300 text-zinc-805 shadow-sm'
                }`}
              >
                {OPTIONS_BY_GENDER[targetGender].vanityMaterial.map(opt => (
                  <option key={opt.value} value={opt.value} className={isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-white text-zinc-800"}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Settings2 className="h-3 w-3 text-amber-500/80" /> Backdrop Props
              </label>
              <select
                id="select-table-prop"
                value={vanityProp}
                onChange={(e) => setVanityProp(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/15 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0e0e0e] border-zinc-800 text-zinc-300' 
                    : 'bg-white border-zinc-300 text-zinc-805 shadow-sm'
                }`}
              >
                {OPTIONS_BY_GENDER[targetGender].vanityProp.map(opt => (
                  <option key={opt.value} value={opt.value} className={isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-white text-zinc-800"}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inspect Generated Prompt */}
          <div className="pt-1.5">
            <button
              onClick={() => togglePromptVisibility('lifestyle_vanity')}
              className={`text-[10px] flex items-center gap-1 transition-colors outline-none cursor-pointer ${
                isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-450 hover:text-zinc-700'
              }`}
            >
              {visiblePrompts.lifestyle_vanity ? 'Hide compiled prompt' : 'Show compiled prompt'}
              <HelpCircle className="h-3 w-3" />
            </button>
            {visiblePrompts.lifestyle_vanity && (
              <div className={`mt-2 text-[10px] font-mono p-2.5 rounded-lg border leading-normal max-h-24 overflow-y-auto ${
                isDarkMode ? 'text-zinc-500 bg-zinc-950/70 border-zinc-900' : 'text-zinc-650 bg-zinc-100 border-zinc-200 shadow-inner'
              }`}>
                {prompts.lifestyle_vanity}
              </div>
            )}
          </div>
        </div>

        {/* 3. Model Wear (On {selectedCategory === 'ring' ? 'Finger' : selectedCategory === 'pendant' ? 'Neck' : selectedCategory === 'earring' ? 'Ear' : 'Wrist'}) */}
        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
          isDarkMode ? 'bg-[#161616] border-zinc-800' : 'bg-zinc-50/50 border-zinc-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-zinc-250' : 'text-zinc-800'}`}>
                3. Model Wear (On {selectedCategory === 'ring' ? 'Finger' : selectedCategory === 'pendant' ? 'Neck' : selectedCategory === 'earring' ? 'Ear' : 'Wrist'})
              </h4>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Worn naturally by human model ({selectedCategory === 'earring' ? 'focused on ear profile' : 'no face shown'})</p>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20">
              Wear Output
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Palette className="h-3 w-3 text-amber-500/80" /> Model Skin & Glow
              </label>
              <select
                id="select-model-skin"
                value={modelSkin}
                onChange={(e) => setModelSkin(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/15 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0e0e0e] border-zinc-800 text-zinc-300' 
                    : 'bg-white border-zinc-350 text-zinc-805 shadow-sm'
                }`}
              >
                {OPTIONS_BY_GENDER[targetGender].modelSkin.map(opt => (
                  <option key={opt.value} value={opt.value} className={isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-white text-zinc-800"}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Shirt className="h-3 w-3 text-amber-500/80" /> Outfit Costume / Styling
              </label>
              <select
                id="select-model-outfit"
                value={modelOutfit}
                onChange={(e) => setModelOutfit(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/15 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0e0e0e] border-zinc-800 text-zinc-300' 
                    : 'bg-white border-zinc-350 text-zinc-805 shadow-sm'
                }`}
              >
                {OPTIONS_BY_GENDER[targetGender].modelOutfit.map(opt => (
                  <option key={opt.value} value={opt.value} className={isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-white text-zinc-800"}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inspect Generated Prompt */}
          <div className="pt-1.5">
            <button
              onClick={() => togglePromptVisibility('model_wear')}
              className={`text-[10px] flex items-center gap-1 transition-colors outline-none cursor-pointer ${
                isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-450 hover:text-zinc-700'
              }`}
            >
              {visiblePrompts.model_wear ? 'Hide compiled prompt' : 'Show compiled prompt'}
              <HelpCircle className="h-3 w-3" />
            </button>
            {visiblePrompts.model_wear && (
              <div className={`mt-2 text-[10px] font-mono p-2.5 rounded-lg border leading-normal max-h-24 overflow-y-auto ${
                isDarkMode ? 'text-zinc-500 bg-zinc-950/70 border-zinc-900' : 'text-zinc-650 bg-zinc-100 border-zinc-200 shadow-inner'
              }`}>
                {prompts.model_wear}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="pt-2">
        <button
          id="advanced-toggle-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`w-full text-center flex items-center justify-center gap-1.5 text-xs cursor-pointer py-1.5 rounded-lg transition-colors border font-medium ${
            isDarkMode 
              ? 'text-zinc-400 bg-[#1c1c1c] border-zinc-800 hover:bg-zinc-800 hover:text-white' 
              : 'text-zinc-600 bg-zinc-50 border-zinc-250 hover:bg-zinc-100/85 hover:text-zinc-900 shadow-sm'
          }`}
        >
          <Settings2 className="h-3.5 w-3.5 text-amber-500" />
          {showAdvanced ? 'Hide Advanced Config' : 'Show Advanced Config'}
        </button>

        {showAdvanced && (
          <div className={`mt-4 p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200 ${
            isDarkMode ? 'bg-[#141414] border-zinc-800 shadow-inner' : 'bg-zinc-50 border-zinc-200 shadow-sm'
          }`}>
            {/* Model Selection */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold block ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Gemini Image Model</label>
              <div className="space-y-1">
                <button
                  id="model-select-25"
                  onClick={() => onModelChange('gemini-2.5-flash-image')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    selectedModel === 'gemini-2.5-flash-image'
                      ? 'border-amber-500 bg-amber-505/10 font-semibold text-amber-500 dark:text-amber-400'
                      : isDarkMode
                      ? 'border-zinc-800 bg-[#0e0e0e] text-zinc-400 hover:border-zinc-700'
                      : 'border-zinc-250 bg-white text-zinc-600 hover:border-zinc-350 shadow-xs'
                  }`}
                >
                  <p className="leading-none">gemini-2.5-flash-image</p>
                  <p className="text-[10px] text-zinc-505 font-normal mt-1 leading-tight">Fast, highly responsive layout (Default)</p>
                </button>
                <button
                  id="model-select-31"
                  onClick={() => onModelChange('gemini-3.1-flash-image')}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    selectedModel === 'gemini-3.1-flash-image'
                      ? 'border-amber-500 bg-amber-505/10 font-semibold text-amber-500 dark:text-amber-400'
                      : isDarkMode
                      ? 'border-zinc-800 bg-[#0e0e0e] text-zinc-400 hover:border-zinc-700'
                      : 'border-zinc-250 bg-white text-zinc-600 hover:border-zinc-350 shadow-xs'
                  }`}
                >
                  <p className="leading-none">gemini-3.1-flash-image</p>
                  <p className="text-[10px] text-zinc-505 font-normal mt-1 leading-tight">High-quality, supports 1K size (Needs Pro Key)</p>
                </button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold block ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { value: '5:4', label: '5:4 (Wide Card)' },
                  { value: '1:1', label: '1:1 Square (Reference)' },
                  { value: '4:3', label: '4:3 Classic Card' },
                  { value: '16:9', label: '16:9 Cinematic' },
                  { value: '3:4', label: '3:4 Portrait' }
                ].map((ratio) => (
                  <button
                    key={ratio.value}
                    id={`ratio-btn-${ratio.value.replace(':', '-')}`}
                    onClick={() => onAspectRatioChange(ratio.value)}
                    className={`py-2 px-2.5 rounded-lg border text-center text-xs cursor-pointer transition-all ${
                      aspectRatio === ratio.value
                        ? 'border-amber-500 bg-amber-505/10 text-amber-500 dark:text-amber-400 font-medium'
                        : isDarkMode
                        ? 'border-zinc-800 bg-[#0e0e0e] text-zinc-450 hover:border-zinc-700'
                        : 'border-zinc-250 bg-white text-zinc-600 hover:border-zinc-350 shadow-xs'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
