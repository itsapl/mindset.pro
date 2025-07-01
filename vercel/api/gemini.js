// Ten kod jest przystosowany do działania na platformie Vercel.
export default async function handler(request, response) {
  // Akceptuj tylko zapytania metodą POST
  if (request.method !== 'POST') {
    return response.status(405).send('Method Not Allowed');
  }
  try {
    const { prompt } = request.body;
    // Bezpieczne pobranie klucza ze zmiennych środowiskowych na Vercel
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
      throw new Error("Klucz API (GEMINI_API_KEY) nie jest skonfigurowany na serwerze Vercel.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await apiResponse.json();

    // Ustawianie nagłówków CORS, aby Twoja strona na GitHub Pages mogła się komunikować z tą funkcją
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Zwróć odpowiedź od Google AI
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}