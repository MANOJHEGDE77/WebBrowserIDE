import { spawnSync } from 'child_process';
import path from 'path';
import { Product } from '@/types/product';
import {
  STATIC_PRODUCTS,
  get_all_products_sync,
  get_product_by_id_sync,
  search_products_sync,
  search_products_by_category_sync,
  search_products_by_price_sync,
  search_products_in_stock_sync,
  search_products_with_filters_sync,
} from './client-products';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  token: string;
  user_id: string;
  expires_at: string;
  created_at?: string;
}

function runPythonDb(funcName: string, args: any[] = []): any {
  const rootDir = path.resolve(process.cwd(), '..');
  const pyCode = `
import sys, json
from pathlib import Path
root = Path(r"${rootDir.replace(/\\/g, '/')}")
if str(root) not in sys.path:
    sys.path.insert(0, str(root))
from backend.db import ${funcName}
args = json.loads(sys.stdin.read())
res = ${funcName}(*args)
print(json.dumps(res))
`;

  try {
    const res = spawnSync('python', ['-c', pyCode], {
      input: JSON.stringify(args),
      encoding: 'utf-8',
      timeout: 5000,
      cwd: rootDir,
    });

    if (res.status === 0 && res.stdout) {
      return JSON.parse(res.stdout.trim());
    }
  } catch (e) {
    console.warn(`[Python DB Bridge] Error calling ${funcName}:`, e);
  }
  return null;
}

// ----------------------------------------------------
// PRODUCT QUERIES
// ----------------------------------------------------

export function get_all_products(): Product[] {
  return get_all_products_sync();
}

export function get_product_by_id(id: number | string): Product | null {
  return get_product_by_id_sync(id);
}

export function search_products(query: string, limit: number = 20): Product[] {
  return search_products_sync(query, limit);
}

export function search_products_by_category(category: string): Product[] {
  return search_products_by_category_sync(category);
}

export function search_products_by_price(minPrice?: number, maxPrice?: number): Product[] {
  return search_products_by_price_sync(minPrice, maxPrice);
}

export function search_products_in_stock(): Product[] {
  return search_products_in_stock_sync();
}

export function search_products_with_filters(options: {
  category?: string;
  subcategory?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'id' | 'price-asc' | 'price-desc' | 'name' | 'stock' | string;
  limit?: number;
}): Product[] {
  return search_products_with_filters_sync(options);
}

// ----------------------------------------------------
// USER AUTHENTICATION & SESSION METHODS
// ----------------------------------------------------

export function create_user(name: string, email: string, password: string): User {
  const res = runPythonDb('create_user', [name, email, password]);
  if (res) return res;
  return {
    id: `user-${Date.now()}`,
    name,
    email,
    created_at: new Date().toISOString(),
  };
}

export function get_user_by_email(email: string): (User & { password_hash: string }) | null {
  return runPythonDb('get_user_by_email', [email]);
}

export function get_user_by_id(userId: string): User | null {
  return runPythonDb('get_user_by_id', [userId]);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const res = runPythonDb('verify_password', [password, storedHash]);
  return Boolean(res);
}

export function create_session(userId: string): Session {
  const res = runPythonDb('create_session', [userId]);
  if (res) return res;
  return {
    token: `tok-${Date.now()}`,
    user_id: userId,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };
}

export function get_session(token: string): { user: User; session: Session } | null {
  return runPythonDb('get_session', [token]);
}

export function delete_session(token: string): boolean {
  return Boolean(runPythonDb('delete_session', [token]));
}

// ----------------------------------------------------
// CONVERSATIONS & CHAT HISTORY METHODS
// ----------------------------------------------------

export function get_all_conversations(userId?: string, query?: string): any[] {
  const res = runPythonDb('get_all_conversations', [userId || null, query || null]);
  return Array.isArray(res) ? res : [];
}

export function get_conversation_by_id(convId: string, userId?: string): any | null {
  return runPythonDb('get_conversation_by_id', [convId, userId || null]);
}

export function create_conversation(convId: string, title = 'New Chat', userId?: string): any {
  const res = runPythonDb('create_conversation', [convId, title, userId || null]);
  if (res) return res;
  return {
    id: convId,
    user_id: userId || null,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    message_count: 0,
    messages: [],
  };
}

export function update_conversation_title(convId: string, title: string, userId?: string): boolean {
  return Boolean(runPythonDb('update_conversation_title', [convId, title, userId || null]));
}

export function delete_conversation(convId: string, userId?: string): boolean {
  return Boolean(runPythonDb('delete_conversation', [convId, userId || null]));
}

export function save_chat_message(params: {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  product_ids?: number[];
  created_at?: string;
  user_id?: string;
}): any {
  const res = runPythonDb('save_chat_message', [
    params.id,
    params.conversation_id,
    params.role,
    params.content,
    params.product_ids || null,
    params.user_id || null,
  ]);
  return (
    res || {
      id: params.id,
      conversation_id: params.conversation_id,
      role: params.role,
      content: params.content,
      product_ids: params.product_ids,
      created_at: params.created_at || new Date().toISOString(),
    }
  );
}
