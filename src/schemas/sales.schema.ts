import { date, z } from "zod";

const salesTransactionSchema = z.object({
  transactionid: z.number().optional(),
  createdat: date().optional(),
  type: z.enum(["purchase", "sales"], {
    invalid_type_error: "Invalid Type Received",
  }),
  status: z.enum(["pending", "paid", "cancelled"], {
    invalid_type_error: "Invalid Status Received",
  }),
  walkin: z.boolean(),
  frommilling: z.boolean(),
  totalamount: z.number().multipleOf(0.01).optional(),
  lastmodifiedat: date().optional(),
  DocumentNumber: z.object({
    documentnumberid: z.number(),
    documentnumber: z
      .string({ required_error: "Invoice Number is required" })
      .min(1, "Invoice Number is required")
      .max(100, "Invoice Number is too long"),
  }),
  TransactionItem: z
    .array(
      z.object({
        transactionitemid: z.number().optional(),
        Item: z.object({
          itemid: z.number().optional(),
          name: z
            .string()
            .min(1, "Name is required")
            .max(100, "Name is too long"),
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
        stock: z.coerce.number().min(0, "Measurement value cannot be negative"),
        unitprice: z.coerce
          .number()
          .multipleOf(0.01)
          .min(0, "Price per unit cannot be negative"),
        totalamount: z.coerce
          .number()
          .min(0, "Total amount cannot be negative")
          .optional(),
      })
    )
    .optional(),
});

export type AddSales = z.infer<typeof salesTransactionSchema>;

export default salesTransactionSchema;
