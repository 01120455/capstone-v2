import { z } from "zod";

export const user = z.object({
  userid: z.coerce.number().optional(),
  imagepath: z.string().optional(),
  firstname: z.string(),
  middlename: z.string().optional(),
  lastname: z.string(),
  role: z.string(),
  status: z
    .enum(["active", "inactive"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("active"),
  email: z.string().email(),
  password: z.string().optional(),
  image: z.any().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type AddUser = z.infer<typeof user>;
export type Login = z.infer<typeof loginSchema>;
