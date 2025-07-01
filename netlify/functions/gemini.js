exports.handler = async function(event) {
  // Akceptuj tylko zapytania metodą POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Pobierz prompt wysłany z Twojej strony
    const { prompt } = JSON.parse(event.body);

    // Pobierz swój tajny klucz API ze zmiennych środowiskowych Netlify
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Klucz API (GEMINI_API_KEY) nie został skonfigurowany na serwerze Netlify.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    // Wyślij zapytanie do Google AI
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Zwróć odpowiedź od Google AI z powrotem do Twojej strony
    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Błąd w funkcji bezserwerowej:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
