import { date, z } from "zod";

export const password = z.object({
  passwordid: z.coerce.number(),
  password: z.string(),
});
export type AddPassword = z.infer<typeof password>;
