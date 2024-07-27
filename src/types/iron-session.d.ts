import "iron-session";

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      userid: number;
      firstname: string;
      middlename?: string;
      lastname: string;
      role: string;
      username: string;
      status: string;
      isLoggedIn: boolean;
    };
  }
}
