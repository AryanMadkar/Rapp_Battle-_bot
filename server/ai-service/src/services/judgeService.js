const axios = require('axios');
const config = require('../config/env');

/**
 * Use AI as a judge to analyze and score rap battles with maximum analytical depth
 * Uses DeepSeek V3.1 via OpenRouter for enhanced reasoning and analysis
 */
const judgeRapBattle = async (userRap, aiRap, theme) => {
  try {
    const judgingPrompt = `You are a world-class rap battle judge with encyclopedic knowledge of hip-hop culture, decades of battle rap experience, and deep expertise in linguistics, poetry, and performance art.

Your task is to provide the most comprehensive, insightful, and nuanced analysis of these rap battle verses. Think deeply about every aspect - from phonetic patterns to cultural significance.

**Theme:** ${theme || 'freestyle'}

**Rapper 1 (User):**
${userRap}

**Rapper 2 (AI):**
${aiRap}

**Deep Analysis Instructions:**
Examine these verses with extreme attention to detail:

1. **Flow & Rhythm Analysis:**
   - Analyze syllable stress patterns, syncopation, and pocket riding
   - Evaluate breath control implications and delivery variations
   - Assess how well the flow complements the presumed beat
   - Consider off-beat flows, pauses, and rhythmic complexity

2. **Rhyme Scheme Mastery:**
   - Identify perfect rhymes, slant rhymes, internal rhymes, and multi-syllabic patterns
   - Evaluate rhyme density and placement sophistication
   - Assess assonance, consonance, and alliteration usage
   - Consider rhyme scheme consistency vs. creative variation

3. **Wordplay & Punchlines Deep Dive:**
   - Analyze metaphor layers, similes, and extended imagery
   - Identify double entendres, triple entendres, and hidden meanings
   - Evaluate bar construction and punchline delivery setup
   - Assess wordplay originality and wit sharpness

4. **Content & Substance Examination:**
   - Evaluate narrative coherence and message clarity
   - Assess thematic relevance and depth of concepts
   - Consider authenticity and emotional resonance
   - Analyze argument structure and persuasive elements

5. **Originality & Creativity Assessment:**
   - Identify unique phrases, fresh perspectives, and innovative approaches
   - Evaluate cliché avoidance and creative risk-taking
   - Consider voice distinctiveness and artistic signature
   - Assess conceptual innovation and execution

6. **Technical Skill Evaluation:**
   - Analyze vocabulary sophistication and lexical diversity
   - Evaluate sentence structure complexity and variation
   - Assess use of literary devices (anaphora, epistrophe, chiasmus, etc.)
   - Consider technical execution and structural mastery

7. **Battle Impact & Aggression:**
   - Evaluate confidence projection and dominance assertion
   - Assess comeback potential and opponent addressing
   - Consider intimidation factor and presence
   - Analyze competitive edge and killer instinct

8. **Cultural References & Authenticity:**
   - Identify hip-hop culture references and their appropriateness
   - Evaluate pop culture integration and relevance
   - Assess authenticity markers and cultural fluency
   - Consider historical context and scene awareness

**Scoring Philosophy:**
- Be extremely discerning - reserve 9-10 for truly exceptional work
- Consider context: amateur vs. professional level expectations
- Reward innovation and risk-taking when executed well
- Penalize clichés, weak bars, and lazy writing
- Balance technical skill with emotional impact and message

**Response Format (strict JSON):**
\`\`\`json
{
  "rapper1": {
    "totalScore": 0,
    "scores": {
      "flow": 0,
      "rhyme": 0,
      "wordplay": 0,
      "content": 0,
      "originality": 0,
      "technical": 0,
      "impact": 0,
      "culture": 0
    },
    "strengths": ["specific strength with example", "another detailed strength"],
    "weaknesses": ["specific weakness with example", "another detailed weakness"],
    "bestLine": "quote the most impressive line",
    "worstLine": "quote the weakest line or missed opportunity",
    "feedback": "3-4 sentences of expert-level analysis with specific examples",
    "technicalNotes": "Detailed technical observations about delivery, structure, or craft"
  },
  "rapper2": {
    "totalScore": 0,
    "scores": {
      "flow": 0,
      "rhyme": 0,
      "wordplay": 0,
      "content": 0,
      "originality": 0,
      "technical": 0,
      "impact": 0,
      "culture": 0
    },
    "strengths": ["specific strength with example", "another detailed strength"],
    "weaknesses": ["specific weakness with example", "another detailed weakness"],
    "bestLine": "quote the most impressive line",
    "worstLine": "quote the weakest line or missed opportunity",
    "feedback": "3-4 sentences of expert-level analysis with specific examples",
    "technicalNotes": "Detailed technical observations about delivery, structure, or craft"
  },
  "winner": "rapper1" or "rapper2" or "draw",
  "winReason": "Detailed explanation with specific comparative examples of why this rapper won",
  "overallAnalysis": "4-5 sentences providing deep comparative analysis, discussing the battle dynamics, and offering insight into what made the difference",
  "battleDynamics": "Analysis of how the two styles contrasted and which approach was more effective in this context",
  "crowdAppeal": "Assessment of which performance would likely resonate more with a live audience and why"
}
\`\`\`

Think like a PhD in linguistics combined with a battle rap veteran. Provide insights that go beyond surface-level observations. Be fair but brutally honest. Your analysis should teach both rappers something they didn't know about their craft.`;

    // Make request to OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'system',
            content: 'You are an elite rap battle judge with deep analytical capabilities. Respond ONLY with valid JSON matching the exact format specified. Use your maximum reasoning capacity to provide expert-level insights. No additional text outside the JSON.'
          },
          {
            role: 'user',
            content: judgingPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4000,
        top_p: 0.95,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openrouterApiKey}`,
          'HTTP-Referer': 'https://your-app-url.com', // Optional: Replace with your app URL
          'X-Title': 'Rap Battle Judge', // Optional: Your app name
          'Content-Type': 'application/json'
        }
      }
    );

    const judgmentText = response.data.choices[0].message.content;
    const judgment = JSON.parse(judgmentText);

    // Validate and normalize scores with stricter validation
    const normalizeScore = (score) => {
      const parsed = parseFloat(score);
      if (isNaN(parsed)) return 0;
      return Math.max(0, Math.min(10, Math.round(parsed * 10) / 10)); // Round to 1 decimal
    };

    // Calculate total scores if not provided
    const calculateTotal = (scores) => {
      return Object.values(scores).reduce((sum, score) => sum + normalizeScore(score), 0);
    };

    const rapper1Total = judgment.rapper1.totalScore || calculateTotal(judgment.rapper1.scores);
    const rapper2Total = judgment.rapper2.totalScore || calculateTotal(judgment.rapper2.scores);

    return {
      userScore: normalizeScore(rapper1Total),
      aiScore: normalizeScore(rapper2Total),
      userAnalysis: {
        scores: judgment.rapper1.scores,
        strengths: judgment.rapper1.strengths,
        weaknesses: judgment.rapper1.weaknesses,
        bestLine: judgment.rapper1.bestLine,
        worstLine: judgment.rapper1.worstLine,
        feedback: judgment.rapper1.feedback,
        technicalNotes: judgment.rapper1.technicalNotes
      },
      aiAnalysis: {
        scores: judgment.rapper2.scores,
        strengths: judgment.rapper2.strengths,
        weaknesses: judgment.rapper2.weaknesses,
        bestLine: judgment.rapper2.bestLine,
        worstLine: judgment.rapper2.worstLine,
        feedback: judgment.rapper2.feedback,
        technicalNotes: judgment.rapper2.technicalNotes
      },
      winner: judgment.winner === 'rapper1' ? 'user' : 
              judgment.winner === 'rapper2' ? 'ai' : 'draw',
      winReason: judgment.winReason,
      overallAnalysis: judgment.overallAnalysis,
      battleDynamics: judgment.battleDynamics,
      crowdAppeal: judgment.crowdAppeal
    };
  } catch (error) {
    console.error('OpenRouter Judge service error:', error);
    
    // Enhanced error handling for OpenRouter specific errors
    if (error.response) {
      console.error('OpenRouter API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // Handle specific error cases
      if (error.response.status === 401) {
        throw new Error('OpenRouter API authentication failed. Check your API key.');
      } else if (error.response.status === 429) {
        throw new Error('OpenRouter rate limit exceeded. Please try again later.');
      } else if (error.response.status === 402) {
        throw new Error('OpenRouter insufficient credits. Please add credits to your account.');
      } else {
        throw new Error(`OpenRouter API error: ${error.response.data?.error?.message || error.message}`);
      }
    } else if (error.request) {
      console.error('No response received from OpenRouter:', error.request);
      throw new Error('Failed to connect to OpenRouter API. Check your internet connection.');
    } else {
      console.error('Error details:', error.message);
      throw new Error('Failed to judge rap battle: ' + error.message);
    }
  }
};

module.exports = {
  judgeRapBattle
};