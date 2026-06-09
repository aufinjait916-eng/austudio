import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environmental variables
dotenv.config();

const DEBUG_FILE = path.join(process.cwd(), 'server_debug.log');

function logDebug(message: string) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(DEBUG_FILE, `[${timestamp}] ${message}\n`);
    console.log(`[DEBUG] ${message}`);
  } catch (e) {
    console.error('Failed to write debug log:', e);
  }
}

// Log startup
logDebug('Backend server starting up...');

const app = express();
const PORT = 3000;

// Log all incoming requests
app.use((req: Request, res: Response, next) => {
  logDebug(`Incoming Request: ${req.method} ${req.url} | Content-Type: ${req.headers['content-type']}`);
  next();
});

// Set max body size to allow high-resolution base64 product images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Session authentication and single-user storage (Stateless)
const AUTH_USER = process.env.AUTH_USERNAME || 'admin';
const AUTH_PASS = process.env.AUTH_PASSWORD || 'luxestyle2026';

// Helper to derive stateless secure session token matching user credentials
function getExpectedToken(): string {
  const hash = crypto.createHash('sha256').update(`${AUTH_USER}:${AUTH_PASS}`).digest('hex');
  return `luxestyle-session-${hash}`;
}

// Middleware to verify session token
const authMiddleware = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Please login.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (token !== getExpectedToken()) {
    res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
    return;
  }
  next();
};

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User login endpoint
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username and password are required' });
    return;
  }

  if (username === AUTH_USER && password === AUTH_PASS) {
    const token = getExpectedToken();
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
});

// Query active auth check
app.post('/api/auth-check', (req: Request, res: Response) => {
  const { token } = req.body;
  if (token && token === getExpectedToken()) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout endpoint
app.post('/api/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

// Check if Gemini API key is available
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Single Scene Generation Endpoint (Protected by authMiddleware)
app.post('/api/generate-scene', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      base64Image, 
      prompt, 
      sceneId, // 'satin_fabric' | 'lifestyle_vanity' | 'model_wear'
      modelName = 'gemini-2.5-flash-image', // Default fast model
      aspectRatio = '1:1',
      imageSize = '1K'
    } = req.body;

    if (!base64Image) {
      res.status(400).json({ error: 'Missing base64Image data' });
      return;
    }
    if (!prompt) {
      res.status(400).json({ error: 'Missing generation prompt' });
      return;
    }

    const ai = getAiClient();

    // Clean up base64 prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Auto detect mime type or default to image/png
    let mimeType = 'image/png';
    const match = base64Image.match(/^data:(image\/\w+);base64,/);
    if (match) {
      mimeType = match[1];
    }

    console.log(`Generating scene [${sceneId}] with model [${modelName}] and prompt: "${prompt.substring(0, 60)}..."`);

    // Call generateContent with photo-to-photo editing input
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `${prompt} Ensure the product from the input image remains completely unmodified, crisp, identical in design detail, shape, color, texture, and styling; do not warp or distort the product structure itself. Integrate it seamlessly into the described background.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          // imageSize is supported for gemini-3.1-flash-image
          ...(modelName === 'gemini-3.1-flash-image' ? { imageSize } : {})
        }
      }
    });

    // Parse the image part in the response
    let resultImageUrl: string | null = null;
    let modelResponseText = '';

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const resultBase64 = part.inlineData.data;
          resultImageUrl = `data:image/png;base64,${resultBase64}`;
        } else if (part.text) {
          modelResponseText += part.text;
        }
      }
    }

    if (!resultImageUrl) {
      console.warn('No image data found in generation response. Text response was: ', modelResponseText);
      res.status(500).json({ 
        error: 'Model failed to generate an output image. Try adjusting your prompt or checking your input image format.',
        textResponse: modelResponseText 
      });
      return;
    }

    res.json({
      success: true,
      sceneId,
      resultImageUrl,
      promptUsed: prompt,
      textResponse: modelResponseText || null
    });

  } catch (error: any) {
    console.error('Generation failure: ', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during lifestyle photo generation.' 
    });
  }
});

// 4-Word SEO Phrase Generation Endpoint (Protected by authMiddleware)
app.post('/api/generate-seo-phrase', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      res.status(400).json({ error: 'Missing base64Image data' });
      return;
    }

    const ai = getAiClient();

    // Clean up base64 prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Auto detect mime type or default to image/png
    let mimeType = 'image/png';
    const match = base64Image.match(/^data:(image\/\w+);base64,/);
    if (match) {
      mimeType = match[1];
    }

    console.log(`Generating SEO phrase based on uploaded product image...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this luxury product image and generate a professional, simple to read, and SEO-friendly marketing phrase that is EXACTLY 4 words long. Do not output anything else. No quotes, no explanations, no period at the end. Just exactly 4 descriptive words (e.g. 'Elegant Silver Mesh Bracelet' or 'Classic Gold Diamond Ring').",
          },
        ],
      },
    });

    const phrase = response.text ? response.text.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '') : 'Elegant Luxury Product Design';
    res.json({
      success: true,
      phrase
    });

  } catch (error: any) {
    logDebug(`SEO generation failure: ${error.message || error}`);
    console.error('SEO generation failure: ', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during SEO phrase generation.' 
    });
  }
});

// Express global error handler middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  logDebug(`Express Global Error caught: ${err.message || err} | Stack: ${err.stack}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Vite Middleware & Static Assets Serving
const initServer = async () => {
  logDebug(`Initializing server on port ${PORT}. NODE_ENV=${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logDebug(`Express Server running on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

initServer().catch((err) => {
  logDebug(`Failed to boot application server: ${err.message || err}`);
  console.error('Failed to boot application server: ', err);
});
