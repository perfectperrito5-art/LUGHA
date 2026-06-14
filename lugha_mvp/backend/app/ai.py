"""AI translator: real (OpenAI/Gemini) with a deterministic mock fallback."""
import os
import httpx

AI_PROVIDER = os.getenv("AI_PROVIDER", "mock").lower()
AI_API_KEY = os.getenv("AI_API_KEY", "").strip()

# Small phrase book so the mock looks impressive in demos.
PHRASEBOOK = {
    ("english", "swahili"): {
        "hello": "Habari", "good morning": "Habari za asubuhi",
        "thank you": "Asante", "how are you": "Habari yako",
        "the rain does not fall on one roof alone":
            "Mvua hainyeshi paa moja peke yake",
        "i love you": "Nakupenda", "welcome": "Karibu",
    },
    ("swahili", "english"): {
        "habari za asubuhi": "Good morning?", "asante": "Thank you",
        "habari": "Hello", "nakupenda": "I love you",
        "karibu": "Welcome", "habari yako": "How are you?",
    },
    ("english", "yoruba"): {"hello": "Bawo", "thank you": "E se", "welcome": "Kaabo"},
    ("english", "zulu"): {"hello": "Sawubona", "thank you": "Ngiyabonga",
                          "ubuntu ungumuntu ngabantu": "A person is a person through others"},
    ("zulu", "english"): {"ubuntu ungumuntu ngabantu": "A person is a person through others",
                          "sawubona": "Hello"},
    ("english", "amharic"): {"hello": "ሰላም", "thank you": "አመሰግናለሁ"},
    ("english", "hausa"): {"hello": "Sannu", "thank you": "Na gode"},
    ("english", "igbo"): {"hello": "Ndewo", "thank you": "Daalụ"},
}


def mock_translate(text: str, src: str, tgt: str) -> str:
    key = (src.lower(), tgt.lower())
    book = PHRASEBOOK.get(key, {})
    needle = text.strip().lower().rstrip("?.!")
    if needle in book:
        return book[needle]
    # word-by-word with passthrough
    out = []
    for w in text.split():
        clean = w.lower().strip(",.?!;:")
        out.append(book.get(clean, w))
    if all(o == w for o, w in zip(out, text.split())):
        return f"[{tgt}] {text}"
    return " ".join(out)


async def openai_translate(text: str, src: str, tgt: str) -> str:
    prompt = (
        f"You are a translator specialised in African languages. "
        f"Translate the following text from {src} to {tgt}. "
        f"Reply with ONLY the translation, no explanation.\n\nText: {text}"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {AI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def gemini_translate(text: str, src: str, tgt: str) -> str:
    prompt = (
        f"Translate from {src} to {tgt}. Respond with only the translation.\n\n{text}"
    )
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={AI_API_KEY}"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
        r.raise_for_status()
        return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()


async def translate(text: str, src: str, tgt: str) -> tuple[str, str]:
    """Returns (translated_text, provider_used)."""
    if AI_PROVIDER == "openai" and AI_API_KEY:
        try:
            return await openai_translate(text, src, tgt), "openai"
        except Exception as e:
            print(f"[ai] openai failed, falling back to mock: {e}")
    if AI_PROVIDER == "gemini" and AI_API_KEY:
        try:
            return await gemini_translate(text, src, tgt), "gemini"
        except Exception as e:
            print(f"[ai] gemini failed, falling back to mock: {e}")
    return mock_translate(text, src, tgt), "mock"
