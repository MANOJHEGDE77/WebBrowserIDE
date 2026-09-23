export function generateConversationTitle(message: string): string {
  if (!message || !message.trim()) {
    return 'New Chat';
  }

  let text = message.trim();

  // Strip common conversational intros
  text = text.replace(/^(?:hello|hi|hey|greetings|please|can you|tell me|what is|how do i|i want to|i need|looking for)\s+/i, '');
  text = text.replace(/[?!.]+$/, '').trim();

  if (!text) {
    text = message.trim();
  }

  // Capitalize first character
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);

  // Truncate to reasonable length for UI
  if (capitalized.length > 36) {
    return capitalized.substring(0, 33).trim() + '...';
  }

  return capitalized || 'New Chat';
}
