const Groq = require("groq-sdk");
const config = require("../config/env");

const groq = new Groq({
    apiKey: config.groqApiKey,
});

const generateRap = async (userRap, theme = 'freestyle') => {
    try {
        const prompt = `You are an elite battle rapper with the wit of Eminem, the wordplay of MF DOOM, the aggression of Canibus, and the flow of Black Thought. You're in a high-stakes rap battle.

**THE OPPONENT JUST SAID:**
"${userRap}"

**BATTLE THEME:** ${theme}

**YOUR MISSION:**
Destroy them with a comeback that's absolutely lethal. This is battle rap - it's competitive, aggressive, and all about proving you're the superior MC.

**BATTLE RAP REQUIREMENTS:**

🎤 **DIRECT RESPONSE & DISSES:**
- Address what they said directly - flip their bars against them
- Use clever disses and comebacks that hit hard
- Call out any weaknesses in their bars (weak rhymes, boring flow, recycled lines)
- Assert your dominance and superiority as an MC

🔥 **WORDPLAY & PUNCHLINES:**
- Use multi-syllabic rhymes and internal rhymes
- Include at least 2-3 killer punchlines that make people say "OHHH!"
- Deploy metaphors, similes, and double entendres
- Use alliteration and assonance for rhythmic impact
- Reference hip-hop culture, current events, or pop culture when clever

🎵 **FLOW & RHYTHM:**
- Create syllable patterns that ride the beat perfectly
- Vary your cadence - mix fast and slow sections
- Use strategic pauses and emphasis
- Make it sound like it could be performed with energy
- Include slant rhymes and creative rhyme schemes

💯 **STRUCTURE & DELIVERY:**
- 4-8 lines total (aim for 6-8 for maximum impact)
- Each line should advance the attack or build to a punchline
- End with your strongest bar - leave them stunned
- Use authentic battle rap language and attitude
- Keep it PG-13 (no explicit profanity, but aggressive and competitive)

⚡ **ENERGY & ATTITUDE:**
- Be confident, aggressive, and dominant
- Show technical superiority through your craft
- Make every line count - no filler
- Create quotable bars that would make the crowd go wild

**STRATEGIC APPROACH:**
1. **Setup** (1-2 lines): Acknowledge their attempt, set them up for the takedown
2. **Attack** (2-4 lines): Deploy your main disses with wordplay and punchlines
3. **Finisher** (1-2 lines): End with an absolutely devastating bar they can't recover from

**REMEMBER:** This is competition. Your goal is to out-rap them completely through superior lyricism, flow, wordplay, and delivery. Make every syllable count. Be creative, be clever, be ruthless.

Now drop your response - make it LEGENDARY:`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a world-class battle rapper with elite lyrical abilities. You create devastating, witty, and technically brilliant rap verses that dominate opponents. Your responses are pure bars - creative, aggressive, and masterfully crafted. You never break character and never add commentary outside of your rap verses.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.95,  // Increased for maximum creativity
            max_tokens: 400,     // Increased to allow for more complex bars
            top_p: 0.95,         // High diversity for creative wordplay
            frequency_penalty: 0.3,  // Reduce repetition
            presence_penalty: 0.2,   // Encourage diverse vocabulary
        });

        const rapResponse = completion.choices[0]?.message?.content || 'Error generating rap';
        
        // Clean up any potential non-rap content (explanations, etc.)
        const lines = rapResponse.split('\n').filter(line => {
            const trimmed = line.trim();
            // Filter out meta-commentary and keep only rap lines
            return trimmed && 
                   !trimmed.toLowerCase().startsWith('here') &&
                   !trimmed.toLowerCase().startsWith('note:') &&
                   !trimmed.toLowerCase().startsWith('*') &&
                   !trimmed.includes('explanation') &&
                   trimmed.length > 10; // Filter out very short non-rap lines
        });
        
        return lines.join('\n') || rapResponse;
        
    } catch (error) {
        console.error('Groq API Error:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw new Error('Failed to generate rap with Groq: ' + error.message);
    }
};

module.exports = { generateRap };