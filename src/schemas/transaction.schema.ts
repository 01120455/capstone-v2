import { date, z } from "zod";

const is11Digits = (val: string) => /^\d{10}$/.test(val);

const transactionSchema = z.object({
  transactionid: z.number().optional(),
  createdat: date().optional(),
  transactiontype: z.enum(["purchase", "sales"], {
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
    documentnumberid: z.number().optional(),
    documentnumber: z.string().optional(),
  }),
  TransactionItem: z
    .array(
      z.object({
        transactionitemid: z.number().optional(),
        Item: z.object({
          itemid: z.number().optional(),
          itemname: z
            .string()
            .min(1, "Item Name is required")
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
    itemname: z
      .string()
      .min(1, "Item Name is required")
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
  totalamount: z.coerce.number().min(0, "Total amount cannot be negative"),
  recentdelete: z.boolean().default(false).optional(),
});

const transactionTableSchema = z.object({
  transactionid: z.number(),
  createdat: date(),
  transactiontype: z.enum(["purchase", "sales"], {
    invalid_type_error: "Invalid Type Received",
  }),
  status: z.enum(["pending", "paid", "cancelled"], {
    invalid_type_error: "Invalid Status Received",
  }),
  walkin: z.boolean(),
  frommilling: z.boolean(),
  totalamount: z.number().multipleOf(0.01).optional(),
  createdbyuser: z
    .object({
      userid: z.number().optional(),
      firstname: z.string(),
      middlename: z.string().optional(),
      lastname: z.string(),
    })
    .optional(),
  lastmodifiedbyuser: z
    .object({
      userid: z.number().optional(),
      firstname: z.string(),
      middlename: z.string().optional(),
      lastname: z.string(),
    })
    .optional(),
  lastmodifiedat: date().optional(),
  DocumentNumber: z.object({
    documentnumberid: z.number().optional(),
    documentnumber: z.string().optional(),
  }),
  TransactionItem: z.array(TransactionItem),
});

const transactionOnlySchema = z.object({
  transactionid: z.number(),
  createdat: date(),
  transactiontype: z.enum(["purchase", "sales"], {
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
    documentnumberid: z.number().optional(),
    documentnumber: z.string().optional(),
  }),
});

export type Transaction = z.infer<typeof transactionSchema>;

export type TransactionItem = z.infer<typeof TransactionItem>;

export type TransactionTable = z.infer<typeof transactionTableSchema>;

export type TransactionOnly = z.infer<typeof transactionOnlySchema>;

export default transactionSchema;
