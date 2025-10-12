const Groq = require("groq-sdk");  // ✅ Fixed typo: was "gorq-sdk"
const config = require("../config/env");

const groq = new Groq({
    apiKey: config.groqApiKey,
});

const generateRap = async (userRap, theme = 'freestyle') => {  // ✅ Added default value
    try {
        const prompt = `You are a skilled battle rapper. The user just dropped this rap bar:

"${userRap}"

Theme: ${theme}

Now it's your turn! Drop a hard-hitting rap response that:
1. Responds directly to what they said
2. Uses clever wordplay and metaphors
3. Has good flow and rhythm
4. Is 4-8 lines long
5. Keeps it creative and fun and very hardcore

Your rap response:`;

        const completion = await groq.chat.completions.create({
            messages: [
                {  // ✅ Fixed: Added opening brace
                    role: 'system',
                    content: 'You are a battle rapper who creates clever, rhythmic, and creative rap verses.',
                },
                {  // ✅ Fixed: Added opening brace
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',  // ✅ Fixed: was 'groq/compound'
            temperature: 0.9,
            max_tokens: 300,
        });

        return completion.choices[0]?.message?.content || 'Error generating rap';
    } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error('Failed to generate rap with Groq');
    }  // ✅ Fixed: Added closing brace for try-catch
};

module.exports = { generateRap };
