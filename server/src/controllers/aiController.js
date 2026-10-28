const Groq = require('groq-sdk');

// created on first use so the module can load without an API key (tests)
let groq = null;
const getGroq = () => {
    if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return groq;
};

// Groq free tier allows 8k tokens a minute for this model, so keep the PDF text
// to roughly 5k tokens (~4 chars per token) and leave room for the prompt and answer
const MAX_TEXT_CHARS = 20000;
const MAX_HIGHLIGHTS = 10;

// colour is decided by type here, not trusted from the AI
const TYPE_COLORS = {
    definition: 'yellow',
    key_concept: 'blue',
    important_point: 'green'
};

// FIT TEXT - long PDFs get an equal share of the budget per page, so highlights
// come from the whole document instead of only the first pages
const fitText = (pageTexts) => {
    const total = pageTexts.reduce((sum, text) => sum + text.length, 0);
    if (total <= MAX_TEXT_CHARS) return pageTexts.join('\n');

    const perPage = Math.floor(MAX_TEXT_CHARS / pageTexts.length);
    return pageTexts
        .map(text => {
            if (text.length <= perPage) return text;
            // cut at a word boundary
            const cut = text.slice(0, perPage);
            return cut.slice(0, Math.max(cut.lastIndexOf(' '), 0));
        })
        .join('\n');
};

// CLEAN RESULT - keep only well-formed highlights with a known type
const cleanHighlights = (parsed, max = MAX_HIGHLIGHTS) => {
    const list = Array.isArray(parsed?.highlights) ? parsed.highlights : [];

    return list
        .filter(h => typeof h?.text === 'string' && h.text.trim() && TYPE_COLORS[h.type])
        .slice(0, max)
        .map(h => ({ text: h.text.trim(), type: h.type, color: TYPE_COLORS[h.type] }));
};

// maxHighlights lets short texts (the landing demo) ask for fewer marks
const highlightPDF = async (pageTexts, { maxHighlights = MAX_HIGHLIGHTS } = {}) => {
    const prompt = `
You are an AI PDF highlighter.

Analyze the provided PDF text and extract concise, meaningful highlights directly from the original text.

Return ONLY valid JSON in this exact format:

{
  "highlights": [
    {
      "text": "exact text from PDF",
      "type": "definition"
    }
  ]
}

STRICT RULES:
- "text" MUST be copied EXACTLY from the PDF
- DO NOT paraphrase
- DO NOT merge multiple paragraphs or distant lines
- Prefer complete phrases or single clean bullet points
- Keep highlights concise and naturally readable
- Avoid extremely long sentences
- Avoid isolated single-word keywords
- Each highlight should ideally fit within one visible line in the PDF
- Extract only genuinely important content
- Spread highlights across the whole document, not just the beginning
- Maximum ${maxHighlights} highlights

TYPE RULES:
- definition: a term and what it means
- key_concept: a main idea or topic
- important_point: a fact, result or rule worth remembering

GOOD HIGHLIGHT EXAMPLES:
- "Object-Oriented Programming"
- "Photosynthesis converts light energy into chemical energy"
- "Built a full-stack AI-powered web application"
- "Designed normalized MongoDB schemas"
- "The Calvin cycle fixes carbon dioxide into glucose"

BAD EXAMPLES:
- Entire long paragraphs
- Multi-line merged content
- Very short filler text like "and", "using", "system"
- Overly detailed descriptions spanning multiple clauses

PDF TEXT:
${fitText(pageTexts)}
`;

    let result;
    try {
        result = await getGroq().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-120b',
            temperature: 0.3,
            reasoning_effort: 'low',
            max_completion_tokens: 2000,
            response_format: { type: 'json_object' },
        });
    } catch (err) {
        if (err.status === 429 || err.status === 413) {
            const busy = new Error('The AI is busy right now. Please try again in a minute.');
            busy.status = 429;
            throw busy;
        }
        throw new Error('AI processing failed: ' + err.message);
    }

    let parsed;
    try {
        parsed = JSON.parse(result.choices[0].message.content);
    } catch {
        throw new Error('AI returned invalid JSON');
    }

    return { highlights: cleanHighlights(parsed, maxHighlights) };
};

module.exports = { highlightPDF, fitText, cleanHighlights };
