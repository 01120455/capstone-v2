import { z } from "zod";

export const usernames = z.object({
  usernameid: z.coerce.number(),
  username: z.string(),
  passwordid: z.coerce.number(),
  createdat: z.string().datetime(),
});
export type AddUsername = z.infer<typeof usernames>;
