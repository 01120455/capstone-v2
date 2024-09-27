import { date, z } from "zod";

export const entitySchema = z.object({
  entityid: z.number().optional(),
  name: z.string(),
  contactnumber: z.string().optional(),
  lastmodifiedat: z.date().optional(),
  user: z
    .object({
      userid: z.number(),
      firstname: z.string(),
      middlename: z.string().optional(),
      lastname: z.string(),
    })
    .optional(),
});

const transactionTableSchema = z.object({
  transactionid: z.number(),
  Entity: z.object({
    entityid: z.number(),
    name: z.string(),
    contactnumber: z.string().optional(),
  }),
  createdat: date(),
  type: z.enum(["purchase", "sale"], {
    invalid_type_error: "Invalid Type Received",
  }),
  status: z.enum(["pending", "paid", "cancelled"], {
    invalid_type_error: "Invalid Status Received",
  }),
  walkin: z.boolean(),
  frommilling: z.boolean(),
  taxpercentage: z.coerce.number().optional(),
  taxamount: z.number().multipleOf(0.01).optional(),
  totalamount: z.number().multipleOf(0.01).optional(),
  User: z.object({
    userid: z.number().optional(),
    firstname: z.string(),
    middlename: z.string().optional(),
    lastname: z.string(),
  }),
  lastmodifiedat: date().optional(),
  InvoiceNumber: z.object({
    invoicenumberid: z.number().optional(),
    invoicenumber: z.string().optional(),
  }),
  TransactionItem: z.array(
    z.object({
      transactionitemid: z.number(),
      transactionid: z.number(),
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
      measurementvalue: z.coerce
        .number()
        .min(0, "Measurement value cannot be negative"),
      unitprice: z.coerce
        .number()
        .multipleOf(0.01)
        .min(0, "Price per unit cannot be negative"),
      totalamount: z.coerce.number().min(0, "Total amount cannot be negative"),
    })
  ),
});

export type Entity = z.infer<typeof entitySchema>;
export type EntityTransaction = z.infer<typeof transactionTableSchema>;

export default entitySchema;
