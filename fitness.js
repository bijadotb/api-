// api/fitness.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body || {};
    if (!image) return res.status(400).json({ error: 'No image provided' });

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable not set' });
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this food image and provide ONLY a JSON response with the following exact format:
{"foodName":"name of the food in Arabic","calories":number,"protein":number,"carbs":number,"fat":number,"healthyFat":number}
Provide nutritional information for the entire portion shown. All numbers in grams except calories (kcal). Return ONLY the JSON.`
              },
              { inline_data: { mime_type: "image/jpeg", data: image } }
            ]
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
        })
      }
    );

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: 'Gemini error', details: data });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonString = text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
    const out = JSON.parse(jsonString);

    return res.status(200).json({ success: true, data: out });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
```

**Next steps:**
1. Save this as `api/fitness.js` in your GitHub repo
2. In Vercel dashboard â†’ Project Settings â†’ Environment Variables
3. Add: `GEMINI_API_KEY` = `AIzaSyDvTi6wV1q5opf2fOBxNOqMO0vQDiW43JA`
4. Redeploy

This keeps your key secure and hidden from the code! ðŸ”’
