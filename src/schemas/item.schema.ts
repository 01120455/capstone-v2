import { create } from "lodash";
import { date, z } from "zod";

export const item = z.object({
  itemid: z.coerce.number().optional(),
  itemname: z
    .string({ required_error: "Name is required" })
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name is too long" }),
  itemtype: z
    .enum(["bigas", "palay", "resico"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("bigas"),
  sackweight: z.enum(["bag5kg", "bag10kg", "bag25kg", "cavan50kg"], {
    invalid_type_error: "Invalid Type Received",
  }),
  status: z
    .enum(["active", "inactive"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("active"),
  unitofmeasurement: z.enum(["quantity", "weight"], {
    invalid_type_error: "Invalid Type Received",
  }),
  stock: z.coerce
    .number()
    .multipleOf(0.01)
    .min(0, "Quantity cannot be negative"),
  unitprice: z.coerce
    .number()
    .multipleOf(0.01)
    .min(0, "Quantity cannot be negative"),
  imagepath: z.string().optional(),
  image: z.any().optional(),
});

export const viewItem = z.object({
  itemid: z.number(),
  itemname: z.string(),
  itemtype: z.enum(["bigas", "palay", "resico"]),
  sackweight: z.enum(["bag5kg", "bag10kg", "bag25kg", "cavan50kg"]),
  status: z.enum(["active", "inactive"]),
  unitofmeasurement: z.enum(["quantity", "weight"]),
  stock: z.number().multipleOf(0.01),
  unitprice: z.number().multipleOf(0.01),
  User: z.object({
    userid: z.number(),
    firstname: z.string(),
    middlename: z.string().optional(),
    lastname: z.string(),
  }),
  lastmodifiedat: z.date().optional(),
  imagepath: z.string().nullable().optional(),
});

export type AddItem = z.infer<typeof item>;

export type ViewItem = z.infer<typeof viewItem>;

export default item;
