import { z } from "zod";

export const item = z.object({
  itemid: z.coerce.number().optional(),
  name: z.string(),
  type: z
    .enum(["bigas", "palay", "resico"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("palay"),
  quantity: z.coerce.number(),
  unitprice: z.coerce.number().multipleOf(0.01),
  imageurl: z.string().optional(),
});

export type AddItem = z.infer<typeof item>;

export default item;
