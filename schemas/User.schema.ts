import { date, z } from "zod";

export const user = z.object({
  userid: z.coerce.number(),
  usernameid: z.coerce.number(),
  firstname: z.string(),
  middlename: z.string(),
  lastname: z.string(),
  role: z.string(),
  status: z
    .enum(["Active", "Inactive"], {
      invalid_type_error: "Invalid Type Recieved",
    })
    .default("Active"),
});
export type AddUser = z.infer<typeof user>;
