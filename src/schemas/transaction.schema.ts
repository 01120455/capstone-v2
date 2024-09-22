import { date, z } from "zod";

const is11Digits = (val: string) => /^\d{10}$/.test(val);

const transactionSchema = z.object({
  transactionid: z.number().optional(),
  Entity: z.object({
    entityid: z.number().optional(),
    firstname: z
      .string()
      .min(1, "Entity name is required")
      .max(100, "Entity name is too long"),
    middlename: z
      .string()
      .min(1, "Entity name is required")
      .max(100, "Entity name is too long")
      .optional()
      .or(z.literal("")),
    lastname: z
      .string()
      .min(1, "Entity name is required")
      .max(100, "Entity name is too long"),
    contactnumber: z.coerce
      .number()
      .transform((val) => val.toString())
      .refine(is11Digits, {
        message: "Contact number must be exactly 11 digits",
      })
      .optional()
      .or(z.literal("")),
  }),
  createdat: date().optional(),
  type: z.enum(["purchase", "sales"], {
    invalid_type_error: "Invalid Type Received",
  }),
  status: z.enum(["pending", "paid", "cancelled"], {
    invalid_type_error: "Invalid Status Received",
  }),
  walkin: z.boolean(),
  frommilling: z.boolean(),
  taxpercentage: z.coerce.number().optional(),
  totalamount: z.number().multipleOf(0.01).optional(),
  lastmodifiedat: date().optional(),
  InvoiceNumber: z.object({
    invoicenumberid: z.number().optional(),
    invoicenumber: z.string().optional(),
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
        measurementvalue: z.coerce
          .number()
          .min(0, "Measurement value cannot be negative"),
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

const TransactionItem = z.object({
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
  totalamount: z.coerce.number().min(0, "Total amount cannot be negative"),
});

const transactionTableSchema = z.object({
  transactionid: z.number(),
  Entity: z.object({
    entityid: z.number(),
    firstname: z.string(),
    middlename: z.string().optional(),
    lastname: z.string(),
    contactnumber: z.string().optional(),
  }),
  createdat: date(),
  type: z.enum(["purchase", "sales"], {
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
  TransactionItem: z.array(TransactionItem),
});

const transactionOnlySchema = z.object({
  transactionid: z.number(),
  Entity: z.object({
    entityid: z.number(),
    firstname: z.string(),
    middlename: z.string().optional(),
    lastname: z.string(),
    contactnumber: z.string().optional(),
  }),
  createdat: date(),
  type: z.enum(["purchase", "sales"], {
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
  lastmodifiedat: date().optional(),
  InvoiceNumber: z.object({
    invoicenumberid: z.number().optional(),
    invoicenumber: z.string().optional(),
  }),
});

export type Transaction = z.infer<typeof transactionSchema>;

export type TransactionItem = z.infer<typeof TransactionItem>;

export type TransactionTable = z.infer<typeof transactionTableSchema>;

export type TransactionOnly = z.infer<typeof transactionOnlySchema>;

export default transactionSchema;
