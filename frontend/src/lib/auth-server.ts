import { NextRequest } from 'next/server';
import { get_session, User, Session } from './db';

export function getAuthenticatedUser(request: NextRequest): { user: User; session: Session } | null {
  let token = request.cookies.get('digicomp_session')?.value;

  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  return get_session(token);
}
