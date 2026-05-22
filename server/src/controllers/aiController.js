const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const highlightPDF = async (text) => {
    try {
        const prompt = `
            You are an expert study assistant. Analyze the following text from a PDF.
            Find and extract important phrases and sentences directly from the text.

            Return ONLY a JSON object in this exact format, nothing else:
            {
            "highlights": [
                {
                    "text": "exact phrase or sentence from the original text",
                    "type": "definition",
                    "color": "yellow"
            },
                {
                    "text": "exact phrase or sentence from the original text",
                    "type": "key_concept",
                    "color": "blue"
                },
                {
                    "text": "exact phrase or sentence from the original text",
                    "type": "important_point",
                    "color": "green"
                }
            ]
        }

            Rules:
            - "text" must be copied EXACTLY from the original text, word for word
            - "type" must be one of: definition, key_concept, important_point
            - "color" must be: yellow for definition, blue for key_concept, green for important_point
            - Extract between 5 and 15 highlights total
            - Only highlight genuinely important content

            Text to analyze:
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
