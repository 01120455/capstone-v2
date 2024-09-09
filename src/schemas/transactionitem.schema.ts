import { z } from "zod";

const transactionItemSchema = z.object({
  transactionitemid: z.number(),
  transactionid: z.number(),
  Item: z.object({
    itemid: z.number().optional(),
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    type: z
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
  unitofmeasurement: z
    .string()
    .min(1, "Unit of Measurement is required")
    .max(100, "Unit of Measurement is too long"),
  measurementvalue: z.coerce
    .number()
    .min(0, "Measurement value cannot be negative"),
  unitprice: z.coerce
    .number()
    .multipleOf(0.01)
    .min(0, "Price per unit cannot be negative"),
});

export type TransactionItemOnly = z.infer<typeof transactionItemSchema>;

export default transactionItemSchema;
