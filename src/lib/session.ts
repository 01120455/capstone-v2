import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "session",
  ttl: 24 * 60 * 60, // 24 hours
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};

export interface SessionData {
  userid?: number;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  username?: string;
  isLoggedIn?: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

declare module "iron-session" {
  interface IronSessionData {
    user?: SessionData;
  }
}