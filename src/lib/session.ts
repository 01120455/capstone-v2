import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "session",
  ttl: 24 * 60 * 60, // 24 hours
  cookieOptions: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    domain: "192.168.1.103",
  },
};

export interface SessionData {
  userid?: number;
  imagepath?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  email?: string;
  status?: string;
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
