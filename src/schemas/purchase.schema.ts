import { date, z } from "zod";

const is11Digits = (val: string) => /^\d{11}$/.test(val);

export const purchase = z.object({
  purchaseid: z.coerce.number().optional(),
  status: z.enum(["pending", "paid", "cancelled"], {
    invalid_type_error: "Invalid Status Received",
  }),
  totalamount: z.coerce.number(),
  purchaseitemid: z.coerce.number().optional(),
  noofsack: z.coerce.number().min(0, "No of Sack cannot be negative"),
  totalweight: z.coerce.number().min(0, "Total weight cannot be negative"),
  priceperunit: z.coerce.number().min(0, "Price per unit cannot be negative"),
  supplierid: z.coerce.number().optional(),
  suppliername: z
    .string()
    .min(1, "Supplier name is required")
    .max(100, "Supplier name is too long"),
  contactnumber: z.coerce
    .number()
    .transform((val) => val.toString())
    .refine(is11Digits, {
      message: "Contact number must be exactly 11 digits",
    }),
  itemid: z.coerce.number().optional(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z
    .enum(["bigas", "palay", "resico"], {
      invalid_type_error: "Invalid Type Received",
    })
    .default("palay"),
  unitofmeasurement: z
    .string()
    .min(1, "Unit of Measurement is required")
    .max(100, "Unit of Measurement is too long"),
});

export const viewPurchase = z.object({
  purchaseid: z.number(),
  status: z.enum(["pending", "paid", "cancelled"]),
  totalamount: z.number(),
  noofsack: z.number(),
  totalweight: z.number(),
  priceperunit: z.number(),
  supplierid: z.number(),
  suppliername: z.string(),
  contactnumber: z.string(),
  itemid: z.number(),
  name: z.string(),
  type: z.enum(["bigas", "palay", "resico"]),
  unitofmeasurement: z.string(),
  createdat: date().optional(),
  updatedat: date().optional(),
});

export const itemSchema = z.object({
  name: z.string(),
  type: z.enum(["bigas", "palay", "resico"]),
  unitofmeasurement: z.string(),
});

export const supplierSchema = z.object({
  supplierid: z.number().optional(),
  suppliername: z.string(),
  contactnumber: z.string(),
});

export const purchaseItemSchema = z.object({
  Item: itemSchema,
  itemid: z.number().optional(),
  noofsack: z.number(),
  priceperunit: z.number(),
  totalweight: z.number(),
});

export const userSchema = z.object({
  userid: z.number(),
  firstname: z.string(),
  lastname: z.string(),
});

export const tablePurchase = z.object({
  purchaseid: z.number(),
  status: z.enum(["pending", "paid", "cancelled"]),
  totalamount: z.number(),
  date: z.string().optional(),
  updatedat: z.string().optional(),
  PurchaseItems: z.array(purchaseItemSchema),
  Supplier: supplierSchema,
  User: userSchema,

});

export type AddPurchase = z.infer<typeof purchase>;

export type ViewPurchase = z.infer<typeof viewPurchase>;

export type TablePurchase = z.infer<typeof tablePurchase>;

export default purchase;

