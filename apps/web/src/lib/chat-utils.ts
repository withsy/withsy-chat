export function isLongChatMessage(text: string): boolean {
  return text.length > 150;
}
