exports.handler = async function(event, context) {
  // Akceptuj tylko zapytania metodą POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.AIzaSyCrZpDu_PusazJHNFyYH-LjFtiCzSRd0T0; // Bezpieczne pobranie klucza

    if (!apiKey) {
      throw new Error("Klucz API nie został skonfigurowany na serwerze.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Błąd odpowiedzi z Google AI:', errorBody);
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: `Błąd API Google: ${response.statusText}` })
        };
    }

    const data = await response.json();

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