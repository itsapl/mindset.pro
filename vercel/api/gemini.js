// Ten kod jest przystosowany do działania na platformie Vercel i poprawnie obsługuje CORS.
export default async function handler(request, response) {
  // KROK 1: Ustawianie nagłówków CORS, aby pozwolić na komunikację z dowolnej domeny.
  // To jest "pozwolenie" dla przeglądarki.
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // KROK 2: Obsługa zapytania wstępnego (preflight) wysyłanego przez przeglądarkę.
  // Przeglądarka najpierw "pyta", czy może wysłać właściwe zapytanie.
  // My odpowiadamy "tak, możesz".
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Akceptuj tylko właściwe zapytania metodą POST
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
    
    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Błąd z Google API:", errorData);
        throw new Error(errorData.error.message || 'Błąd serwera Google AI');
    }

    const data = await apiResponse.json();

    // Zwróć odpowiedź od Google AI
    return response.status(200).json(data);

  } catch (error) {
    console.error("Błąd w funkcji bezserwerowej:", error);
    return response.status(500).json({ error: error.message });
  }
}