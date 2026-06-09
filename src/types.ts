export type SceneType = 'satin_fabric' | 'lifestyle_vanity' | 'model_wear';

export interface ScenePreset {
  id: SceneType;
  title: string;
  subtitle: string;
  description: string;
  placeholderPrompt: string;
  promptTemplate: string;
}

export interface GenerationResult {
  sceneId: SceneType;
  title: string;
  promptUsed: string;
  resultImageUrl?: string;
  status: 'idle' | 'generating' | 'success' | 'failed';
  error?: string;
}

export type ProductCategory = 
  | 'wrist_wear' 
  | 'ring' 
  | 'pendant'
  | 'earring';

export interface SampleProduct {
  id: string;
  name: string;
  category: ProductCategory;
  thumbnailUrl: string;
  base64Data: string;
}
