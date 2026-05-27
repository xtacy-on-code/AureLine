const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const highlightPDF = async (text) => {
    try {
        const prompt = `
You are an AI PDF highlighter.

Analyze the provided PDF text and extract concise, meaningful highlights directly from the original text.

Return ONLY valid JSON in this exact format:

{
  "highlights": [
    {
      "text": "exact text from PDF",
      "type": "definition",
      "color": "yellow"
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
- Maximum 10 highlights

TYPE RULES:
- definition → yellow
- key_concept → blue
- important_point → green

GOOD HIGHLIGHT EXAMPLES:
- "Object-Oriented Programming"
- "Groq + LLaMA 3.3 70B"
- "Built a full-stack AI-powered web application"
- "Designed normalized MongoDB schemas"
- "Maximum rating of 1160"
- "FIDE-rated player with a rating of 1509"

BAD EXAMPLES:
- Entire long paragraphs
- Multi-line merged content
- Very short filler text like "and", "using", "system"
- Overly detailed descriptions spanning multiple clauses

PDF TEXT:
        ${text}
        `;


        const result = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
        });

        const response = result.choices[0].message.content;

        const cleaned = response.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);

    } catch (err) {
        throw new Error('AI processing failed: ' + err.message);
    }
}

module.exports = { highlightPDF };
