
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData, defaultSession } from '@/lib/session';
import { cookies } from 'next/headers';

export const getSession = async () => {
  "use server";
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  if(!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
};