const { HfInference } = require('@huggingface/inference');
const config = require('../config/env');

const hf = new HfInference(config.huggingfaceApiKey);

const generateRap = async (userRap, theme = 'freestyle') => {
  try {
    // Enhanced prompt specifically optimized for instruction-following models like Mistral
    const prompt = `<s>[INST] You are an elite battle rapper with the lyrical prowess of Eminem, the wordplay of MF DOOM, the flow of Black Thought, and the battle instincts of Loaded Lux. You're in a high-stakes rap battle where every bar counts.

**OPPONENT'S BAR:**
"${userRap}"

**BATTLE THEME:** ${theme}

**YOUR OBJECTIVE:**
Craft a devastating comeback that completely outclasses your opponent. This is competitive battle rap - be aggressive, clever, and technically superior.

**MANDATORY REQUIREMENTS:**

🎯 **DIRECT CONFRONTATION:**
- Address their specific bars and flip them against them
- Call out weaknesses in their rhyme scheme, flow, or content
- Use their own words against them when possible
- Assert your lyrical dominance explicitly

🔥 **ADVANCED WORDPLAY:**
- Deploy multi-syllabic rhyme schemes (3+ syllables)
- Use internal rhymes within lines, not just at the end
- Include at least 2 quotable punchlines that hit different
- Use metaphors, similes, double meanings, and entendres
- Incorporate alliteration and assonance for sonic impact

🎵 **FLOW MASTERY:**
- Create clear rhythmic patterns with varied cadence
- Mix short punchy bars with longer complex flows
- Use strategic line breaks and emphasis points
- Make it performable - imagine this on a stage
- Include both predictable and unexpected rhyme placements

💎 **STRUCTURAL EXCELLENCE:**
- Length: 6-8 lines (aim for 7 for optimal impact)
- Opening: Hook them with a strong setup (1-2 lines)
- Body: Deploy your main attacks with escalating intensity (3-4 lines)
- Closer: End with an unforgettable knockout bar (1-2 lines)

⚡ **BATTLE RAP ATTITUDE:**
- Confidence bordering on arrogance - you're the best and you know it
- Competitive aggression without crossing into explicit content
- Technical superiority demonstrated through craft, not just claims
- Make every syllable purposeful - zero filler
- Create bars that would make a live crowd erupt

🎭 **REFERENCE GAME:**
- Weave in hip-hop culture references when clever
- Use pop culture analogies that enhance your disses
- Reference current events or trends if they strengthen bars
- Show cultural literacy and authenticity

**STRATEGIC FORMULA:**
Line 1-2: "You thought that was fire? Let me show you real flames..."
Line 3-5: [Main attack with escalating punchlines and wordplay]
Line 6-7: [Devastating finisher that leaves no comeback possible]

**CRITICAL RULES:**
- NO explanations, NO commentary - ONLY rap bars
- NO asking questions or seeking approval - just DROP IT
- NO meta-references to the task - stay in character
- Keep it PG-13 (aggressive but no explicit profanity)
- Every line must advance the attack or build to a punchline

Now drop your verse - make it LEGENDARY and UNFORGETTABLE: [/INST]

`;

    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: prompt,
      parameters: {
        max_new_tokens: 450,        // Increased for more complex bars
        temperature: 0.92,          // Optimized for creativity while maintaining coherence
        top_p: 0.95,               // High diversity for creative wordplay
        top_k: 50,                 // Added for better token selection
        repetition_penalty: 1.15,  // Prevent repetitive phrases
        return_full_text: false,   // Only return generated text, not the prompt
      },
    });

    let rapText = response.generated_text || 'Error generating rap';

    // Clean up the response - remove any meta-commentary or artifacts
    const cleanRap = (text) => {
      // Split into lines and filter
      const lines = text.split('\n').map(line => line.trim()).filter(line => {
        const lower = line.toLowerCase();
        // Remove common meta-commentary patterns
        return line.length > 0 &&
          !lower.startsWith('here') &&
          !lower.startsWith('note:') &&
          !lower.startsWith('explanation') &&
          !lower.startsWith('this verse') &&
          !lower.startsWith('i ') && // Remove "I hope" type comments
          !lower.includes('[inst]') &&
          !lower.includes('[/inst]') &&
          !lower.includes('</s>') &&
          !line.startsWith('*') &&
          !line.startsWith('-') &&
          line.length > 15; // Filter very short non-rap lines
      });

      // Take first 8-12 lines max (in case model generates too much)
      const rapLines = lines.slice(0, 12);

      // If we have valid lines, return them
      if (rapLines.length > 0) {
        return rapLines.join('\n');
      }

      // Fallback: return original text
      return text;
    };

    const cleanedRap = cleanRap(rapText);

    // Final validation: ensure we have actual content
    if (cleanedRap.trim().length < 20) {
      throw new Error('Generated rap too short or invalid');
    }

    return cleanedRap;

  } catch (error) {
    console.error('Hugging Face API Error:', error);
    console.error('Error details:', error.message || error);

    // Provide more specific error message
    if (error.message && error.message.includes('rate limit')) {
      throw new Error('Hugging Face rate limit reached. Please try again in a moment.');
    } else if (error.message && error.message.includes('model')) {
      throw new Error('Model temporarily unavailable. Please try again.');
    } else {
      throw new Error('Failed to generate rap with Hugging Face: ' + (error.message || 'Unknown error'));
    }
  }
};

module.exports = { generateRap };