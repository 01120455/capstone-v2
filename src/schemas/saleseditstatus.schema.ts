import { z } from "zod";

const salesTransactionEditSchema = z.object({
  transactionid: z.number(),
  status: z.enum(["pending", "paid", "cancelled"], {
    invalid_type_error: "Invalid Status Received",
  }),
  DocumentNumber: z.object({
    documentnumberid: z.number().optional(),
    documentnumber: z.string().optional(),
  }),
});

export type EditSales = z.infer<typeof salesTransactionEditSchema>;

export default salesTransactionEditSchema;
