import { date, z } from "zod";

export const customer = z.object({
  name: z.string(),
  firstname: z.string(),
  middlename: z.string(),
  lastname: z.string(),
});
export type AddCustomer = z.infer<typeof customer>;
