Analiza Błędu: Co Oznacza "Failed to fetch"?
Ten błąd nie oznacza, że Twój kod jest zły. Oznacza, że przeglądarka zablokowała próbę komunikacji ze względów bezpieczeństwa.

Wyobraź to sobie tak:

Twoja strona internetowa mieszka pod jednym adresem (np. twoja-nazwa.github.io).

Twój bezpieczny pośrednik z kluczem API mieszka pod zupełnie innym adresem (np. twoj-posrednik.vercel.app).

Gdy Twoja strona próbuje wysłać zapytanie do pośrednika, przeglądarka widzi, że jest to próba komunikacji między dwoma różnymi domenami. Ze względów bezpieczeństwa, przeglądarki domyślnie blokują takie "rozmowy", aby złośliwe strony nie mogły wysyłać zapytań do innych serwerów bez pozwolenia.

Ten mechanizm bezpieczeństwa nazywa się CORS (Cross-Origin Resource Sharing).

Aby komunikacja była możliwa, serwer pośrednika (na Vercel) musi jawnie powiedzieć przeglądarce: "Hej, wszystko w porządku, ufam stronie twoja-nazwa.github.io i pozwalam jej na wysyłanie do mnie zapytań."

Błąd "Failed to fetch" oznacza, że Twój pośrednik na Vercel nie wysłał tego pozwolenia.

Jak Skutecznie Naprawić Ten Błąd?
Musimy zaktualizować kod Twojej funkcji bezserwerowej (gemini.js na Vercel), aby poprawnie obsługiwała mechanizm CORS. Poniższy kod zawiera niezbędne nagłówki, które stanowią "pozwolenie" dla przeglądarki.

Krok 1: Zaktualizuj Kod Funkcji gemini.js

Otwórz plik gemini.js w swoim projekcie api-posrednik-vercel i zastąp całą jego zawartość poniższym, poprawionym kodem:

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

Krok 2: Wdróż Zmiany na Vercel

Zapisz Zmiany: Zapisz plik gemini.js z nowym kodem.

Wyślij Zmiany na GitHub: Wypchnij (push) zaktualizowany plik do swojego repozytorium api-posrednik-vercel na GitHubie.

Automatyczne Wdrożenie: Vercel jest połączony z Twoim repozytorium, więc automatycznie wykryje zmianę i rozpocznie nowe wdrożenie. Poczekaj, aż się zakończy.

Po wykonaniu tych dwóch kroków Twoja aplikacja na GitHub Pages będzie mogła bezproblemowo komunikować się z pośrednikiem na Vercel, a błąd "Failed to fetch" zniknie.