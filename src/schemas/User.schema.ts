import { z } from "zod";

export const user = z.object({
  userid: z.coerce.number().optional(),
  firstname: z.string(),
  middlename: z.string(),
  lastname: z.string(),
  role: z.string(),
  status: z
    .enum(["active", "inactive"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("active"),
  username: z.string(),
  password: z.string(),
});

export type AddUser = z.infer<typeof user>;

export default user;
