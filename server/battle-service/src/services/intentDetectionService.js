/**
 * Detect if user wants to end the battle
 * Checks for keywords and phrases indicating user wants to quit
 */
const detectEndIntent = (text) => {
  const endPhrases = [
    'i am done',
    "i'm done",
    'im done',
    'that is all',
    "that's all",
    'thats all',
    'end battle',
    'finish battle',
    'stop battle',
    'quit',
    'exit',
    'i quit',
    'you win',
    'i give up',
    'enough',
    "that's enough",
    'thats enough',
    'wrap it up',
    'battle over',
    'drop the mic',
    'mic drop',
    'peace out',
    'im out',
    "i'm out"
  ];

  const lowerText = text.toLowerCase().trim();
  
  // Check for exact matches or contains
  return endPhrases.some(phrase => lowerText.includes(phrase));
};

/**
 * Detect if AI response indicates it wants to end
 * AI might say things like "final verse" or "last bars"
 */
const detectAIEndIntent = (text) => {
  const aiEndIndicators = [
    'final verse',
    'last bars',
    'closing statement',
    'drop the mic',
    'mic drop',
    'battle over',
    'peace out',
    'im out'
  ];

  const lowerText = text.toLowerCase().trim();
  return aiEndIndicators.some(phrase => lowerText.includes(phrase));
};

module.exports = {
  detectEndIntent,
  detectAIEndIntent,
};
