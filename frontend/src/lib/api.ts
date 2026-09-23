import { Product } from '@/types/product';
import { ChatMessage, Conversation, ChatResponse } from '@/types/chat';

export async function sendChatMessageStream(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  onToken?: (token: string) => void,
  onProducts?: (products: Product[]) => void,
  signal?: AbortSignal,
  conversationId?: string
): Promise<ChatResponse> {
  const payload = {
    message,
    history,
    conversationId,
  };

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.detail || `AI service returned error (HTTP ${response.status})`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const answer = data.answer || data.message || '';
  const products: Product[] = Array.isArray(data.products) ? data.products : [];

  if (onToken && answer) {
    onToken(answer);
  }

  if (onProducts && products.length > 0) {
    onProducts(products);
  }

  return {
    answer,
    products,
    requestId: data.requestId,
    conversationId: data.conversationId || conversationId,
    messageId: data.messageId,
  };
}

export async function fetchConversations(searchQuery?: string): Promise<Conversation[]> {
  try {
    const url = searchQuery
      ? `/api/ai/conversations?q=${encodeURIComponent(searchQuery)}`
      : '/api/ai/conversations';
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return [];
  }
}

export async function fetchConversationById(id: string): Promise<Conversation | null> {
  try {
    const res = await fetch(`/api/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching conversation ${id}:`, err);
    return null;
  }
}

export async function renameConversation(id: string, title: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    return res.ok;
  } catch (err) {
    console.error(`Error renaming conversation ${id}:`, err);
    return false;
  }
}

export async function deleteConversation(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    return res.ok;
  } catch (err) {
    console.error(`Error deleting conversation ${id}:`, err);
    return false;
  }
}

export async function saveMessageToConversation(
  convId: string,
  messageData: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    product_ids?: number[];
    products?: Product[];
    created_at?: string;
  }
): Promise<ChatMessage | null> {
  try {
    const productIds = messageData.product_ids || (messageData.products ? messageData.products.map((p) => p.id) : undefined);
    const res = await fetch(`/api/ai/conversations/${encodeURIComponent(convId)}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: messageData.id,
        role: messageData.role,
        content: messageData.content,
        product_ids: productIds,
        created_at: messageData.created_at,
      }),
    });

    if (!res.ok) {
      return null;
    }

    const saved = await res.json();
    return saved;
  } catch (err) {
    console.error(`Error saving message to conversation ${convId}:`, err);
    return null;
  }
}
