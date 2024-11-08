import { z } from "zod";

const transactionItemSchema = z.object({
  transactionitemid: z.number(),
  transactionid: z.number(),
  Item: z.object({
    itemid: z.number().optional(),
    itemname: z
      .string()
      .min(1, { message: "Item Name is required" })
      .max(100, "Name is too long"),
    itemtype: z
      .enum(["bigas", "palay", "resico"], {
        invalid_type_error: "Invalid Type Received",
      })
      .default("palay"),
    sackweight: z
      .enum(["bag25kg", "cavan50kg"], {
        invalid_type_error: "Invalid Type Received",
      })
      .default("bag25kg"),
  }),
  sackweight: z
    .enum(["bag25kg", "cavan50kg"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("bag25kg"),
  unitofmeasurement: z
    .string()
    .min(1, "Unit of Measurement is required")
    .max(100, "Unit of Measurement is too long"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  unitprice: z.coerce
    .number()
    .multipleOf(0.01)
    .min(0, "Price per unit cannot be negative"),
});

export type TransactionItemOnly = z.infer<typeof transactionItemSchema>;

export default transactionItemSchema;
