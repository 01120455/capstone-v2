import { create } from "lodash";
import { z } from "zod";

export const item = z.object({
  itemid: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z
    .enum(["bigas", "palay", "resico"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("palay"),
  stock: z.coerce.number().min(0, "Quantity cannot be negative"),
  unitofmeasurement: z.string().min(1, "Unit of Measurement is required").max(100, "Unit of Measurement is too long"),
  unitprice: z.coerce.number().multipleOf(0.01).min(0, "Quantity cannot be negative"),
  reorderlevel: z.coerce.number().min(0, "Reorder level cannot be negative"),
  criticallevel: z.coerce.number().min(0, "Critical level cannot be negative"),
  imagepath: z.string().optional(),
  image: z.any().optional(),
});

export const viewItem = z.object({
  itemid: z.number(),
  name: z.string(),
  type: z.enum(["bigas", "palay", "resico"],),
  stock: z.number(),
  unitofmeasurement: z.string(),
  unitprice: z.number(),
  reorderlevel: z.number(),
  criticallevel: z.number(),
  itemimage: z.array(
    z.object({
      imagepath: z.string().optional(),
    })
  ),
  createdat: z.string().optional(),
  updatedat: z.string().optional(),
});

export type AddItem = z.infer<typeof item>;

export type ViewItem = z.infer<typeof viewItem>;

export default item;
