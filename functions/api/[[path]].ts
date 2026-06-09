// Cloudflare Pages Function catch-all router for /api/* requested by the LuxeStyleStudio front-end
export const onRequest: PagesFunction<{
  GEMINI_API_KEY?: string;
  AUTH_USERNAME?: string;
  AUTH_PASSWORD?: string;
}> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Build standard response headers supporting JSON and CORS
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  // Handle preflight CORS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Retrieve auth parameters from Cloudflare Pages environment binds (fallbacks included)
  const AUTH_USER = env.AUTH_USERNAME || 'admin';
  const AUTH_PASS = env.AUTH_PASSWORD || 'luxestyle2026';

  // Helper function to dynamically derive the stateless session token matching configured credentials
  const getExpectedToken = async (): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${AUTH_USER}:${AUTH_PASS}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `luxestyle-session-${hexHash}`;
  };

  // Helper to statelessly verify authorization token
  const verifyToken = async (authHeader: string | null): Promise<boolean> => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const clientToken = authHeader.split(' ')[1];
    const expectedToken = await getExpectedToken();
    return clientToken === expectedToken;
  };

  try {
    // 1. Healthcheck Route
    if (path === '/api/health') {
      return new Response(
        JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString(), platform: 'cloudflare' }),
        { headers }
      );
    }

    // 2. User Login Endpoint
    if (path === '/api/login' && request.method === 'POST') {
      const body: any = await request.json();
      const { username, password } = body;

      if (!username || !password) {
        return new Response(
          JSON.stringify({ success: false, error: 'Username and password are required' }),
          { status: 400, headers }
        );
      }

      if (username === AUTH_USER && password === AUTH_PASS) {
        const token = await getExpectedToken();
        return new Response(JSON.stringify({ success: true, token }), { headers });
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid username or password' }),
          { status: 401, headers }
        );
      }
    }

    // 3. User Authentication Active Verification Route
    if (path === '/api/auth-check' && request.method === 'POST') {
      const body: any = await request.json();
      const { token } = body;
      const expectedToken = await getExpectedToken();

      if (token && token === expectedToken) {
        return new Response(JSON.stringify({ authenticated: true }), { headers });
      } else {
        return new Response(JSON.stringify({ authenticated: false }), { headers });
      }
    }

    // 4. Logout Endpoint
    if (path === '/api/logout' && request.method === 'POST') {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // 5. Config / API Status Endpoint
    if (path === '/api/config' && request.method === 'GET') {
      return new Response(
        JSON.stringify({ hasApiKey: !!env.GEMINI_API_KEY }),
        { headers }
      );
    }

    // 6. Gemini Scene Generation (Protected Session Route)
    if (path === '/api/generate-scene' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization');
      const isAuthorized = await verifyToken(authHeader);

      if (!isAuthorized) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized. Please login again.' }),
          { status: 401, headers }
        );
      }

      const body: any = await request.json();
      const {
        base64Image,
        prompt,
        sceneId,
        modelName = 'gemini-2.5-flash-image',
        aspectRatio = '1:1',
        imageSize = '1K'
      } = body;

      if (!base64Image) {
        return new Response(
          JSON.stringify({ error: 'Missing base64Image input data.' }),
          { status: 400, headers }
        );
      }
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Missing prompt input data.' }),
          { status: 400, headers }
        );
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare. Please set it in Pages Dashboard > Settings > Variables.' }),
          { status: 500, headers }
        );
      }

      // Format clean base64 data & mimeType
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      let mimeType = 'image/png';
      const typeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
      if (typeMatch) {
        mimeType = typeMatch[1];
      }

      // Rest structure for Google Gemini Content Generation API
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                }
              },
              {
                text: `${prompt} Ensure the product from the input image remains completely unmodified, crisp, identical in design detail, shape, color, texture, and styling; do not warp or distort the product structure itself. Integrate it seamlessly into the described background.`
              }
            ]
          }
        ],
        generationConfig: {
          imageConfig: {
            aspectRatio: aspectRatio,
            ...(modelName === 'gemini-3.1-flash-image' ? { imageSize } : {})
          }
        }
      };

      const geminiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aistudio-build-cloudflare',
        },
        body: JSON.stringify(payload)
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        return new Response(
          JSON.stringify({ error: `Cloudflare Edge: Gemini API invocation failed: ${errorText}` }),
          { status: 500, headers }
        );
      }

      const responseJson: any = await geminiResponse.json();
      let resultImageUrl: string | null = null;
      let modelResponseText = '';

      if (responseJson.candidates && responseJson.candidates[0]?.content?.parts) {
        for (const part of responseJson.candidates[0].content.parts) {
          if (part.inlineData) {
            resultImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            modelResponseText += part.text;
          }
        }
      }

      if (!resultImageUrl) {
        return new Response(
          JSON.stringify({
            error: 'Model failed to generate an output image. Try adjusting your prompt parameters.',
            textResponse: modelResponseText
          }),
          { status: 500, headers }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          sceneId,
          resultImageUrl,
          promptUsed: prompt,
          textResponse: modelResponseText || null
        }),
        { headers }
      );
    }

    // 7. SEO Phrase Generation (Protected Session Route)
    if (path === '/api/generate-seo-phrase' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization');
      const isAuthorized = await verifyToken(authHeader);

      if (!isAuthorized) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized. Please login again.' }),
          { status: 401, headers }
        );
      }

      const body: any = await request.json();
      const { base64Image } = body;

      if (!base64Image) {
        return new Response(
          JSON.stringify({ error: 'Missing base64Image input data.' }),
          { status: 400, headers }
        );
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare. Please set it in Pages Dashboard > Settings > Variables.' }),
          { status: 500, headers }
        );
      }

      // Format clean base64 data & mimeType
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      let mimeType = 'image/png';
      const typeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
      if (typeMatch) {
        mimeType = typeMatch[1];
      }

      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                }
              },
              {
                text: "Analyze this luxury product image and generate a professional, simple to read, and SEO-friendly marketing phrase that is EXACTLY 4 words long. Do not output anything else. No quotes, no explanations, no period at the end. Just exactly 4 descriptive words (e.g. 'Elegant Silver Mesh Bracelet' or 'Classic Gold Diamond Ring')."
              }
            ]
          }
        ]
      };

      const geminiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aistudio-build-cloudflare',
        },
        body: JSON.stringify(payload)
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        return new Response(
          JSON.stringify({ error: `Cloudflare Edge: Gemini API invocation failed: ${errorText}` }),
          { status: 500, headers }
        );
      }

      const responseJson: any = await geminiResponse.json();
      let modelResponseText = '';

      if (responseJson.candidates && responseJson.candidates[0]?.content?.parts) {
        for (const part of responseJson.candidates[0].content.parts) {
          if (part.text) {
            modelResponseText += part.text;
          }
        }
      }

      const phrase = modelResponseText ? modelResponseText.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '') : 'Elegant Luxury Product Design';

      return new Response(
        JSON.stringify({
          success: true,
          phrase
        }),
        { headers }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unsupported API route: ${path}` }),
      { status: 404, headers }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'An unexpected exception occurred inside Cloudflare Workers runtime.' }),
      { status: 500, headers }
    );
  }
};
