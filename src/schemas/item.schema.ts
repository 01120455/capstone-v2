import { create } from "lodash";
import { date, z } from "zod";

export const item = z.object({
  itemid: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z
    .enum(["bigas", "palay", "resico"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("palay"),
  sackweight: z.enum(["bag25kg", "cavan50kg"], {
    invalid_type_error: "Invalid Type Received",
  }),
  unitofmeasurement: z.enum(["quantity", "weight"], {
    invalid_type_error: "Invalid Type Received",
  }),
  measurementvalue: z.coerce.number().multipleOf(0.01).min(0, "Quantity cannot be negative"),
  unitprice: z.coerce.number().multipleOf(0.01).min(0, "Quantity cannot be negative"),
  reorderlevel: z.coerce.number().min(0, "Reorder level cannot be negative"),
  criticallevel: z.coerce.number().min(0, "Critical level cannot be negative"),
  lastmodifiedby: z.coerce.number().optional(),
  lastmodifeiedat: date().optional(),
  imagepath: z.string().optional(),
  image: z.any().optional(),
});

export const viewItem = z.object({
  itemid: z.number(),
  name: z.string(),
  type: z.enum(["bigas", "palay", "resico"],),
  sackweight: z.enum(["bag25kg", "cavan50kg"]),
  unitofmeasurement: z.enum(["quantity", "weight"]),
  measurementvalue: z.number().multipleOf(0.01),
  unitprice: z.number().multipleOf(0.01),
  reorderlevel: z.number(),
  criticallevel: z.number(),
  lastmodifiedby: z.number().optional(),
  lastmodifeiedat: z.date().optional(),
  itemimage: z.array(
    z.object({
      imagepath: z.string().optional(),
    })
  ),
});

export type AddItem = z.infer<typeof item>;

export type ViewItem = z.infer<typeof viewItem>;

export default item;
