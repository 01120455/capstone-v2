import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { console } from "inspector";

const prisma = new PrismaClient();

enum ItemType {
    bigas = "bigas",
    palay = "palay",
    resico = "resico",
  }
  
  enum SackWeight {
    bag25kg = "bag25kg",
    cavan50kg = "cavan50kg",
  }
  
  enum UnitOfMeasurement {
    quantity = "quantity",
    weight = "weight",
  }

  // export const POST = async (req: NextRequest) => {
  //   try {
  //     // Extract the transaction ID from the URL
  //     const { pathname } = new URL(req.url);
  //     const transactionid = parseInt(pathname.split("/").pop() as string, 10);
  
  //     if (isNaN(transactionid)) {
  //       return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
  //     }
  
  //     const session = await getIronSession(req, NextResponse.next(), sessionOptions);
  //     const userid = session.user.userid;
  
  //     const formData = await req.formData();
  
  //     // Extract and validate form data
  //     const name = formData.get("Item[name]") as string;
  //     const typeString = formData.get("Item[type]") as string;
  //     const sackweightString = formData.get("Item[sackweight]") as string;
  //     const unitpriceString = formData.get("unitprice") as string;
  //     const unitofmeasurementString = formData.get("unitofmeasurement") as string;
  //     const measurementvalueString = formData.get("measurementvalue") as string;
  
  //     if (!name || !Object.values(ItemType).includes(typeString as ItemType)) {
  //       return NextResponse.json({ error: "Invalid item details" }, { status: 400 });
  //     }
  
  //     const unitofmeasurement = unitofmeasurementString as UnitOfMeasurement;
  //     const measurementvalue = parseFloat(measurementvalueString);
  //     const unitprice = parseFloat(unitpriceString);
  
  //     if (isNaN(unitprice) || isNaN(measurementvalue)) {
  //       console.error("Invalid number fields", { unitprice, measurementvalue });
  //       return NextResponse.json({ error: "Number fields must be valid numbers" }, { status: 400 });
  //     }
  
  //     if (!unitofmeasurement) {
  //       return NextResponse.json({ error: "Unit of measurement is required" }, { status: 400 });
  //     }
  
  //     // Check or create item
  //     const existingItem = await prisma.item.findFirst({
  //       where: { name, type: typeString as ItemType, unitofmeasurement },
  //     });
  
  //     let itemId;
  //     if (existingItem) {
  //       itemId = existingItem.itemid;
  //       const newStock = (existingItem.stock ?? 0) + measurementvalue;
  
  //       await prisma.item.update({
  //         where: { itemid: itemId },
  //         data: { stock: newStock },
  //       });
  //     } else {
  //       const newItem = await prisma.item.create({
  //         data: {
  //           name,
  //           type: typeString as ItemType,
  //           sackweight: sackweightString as SackWeight,
  //           unitofmeasurement,
  //           stock: measurementvalue,
  //           lastmodifiedby: userid,
  //         },
  //       });
  //       itemId = newItem.itemid;
  //     }
  
  //     // Calculate total amount for purchase item
  //     const amount = measurementvalue * unitprice;
  //     if (isNaN(amount)) {
  //       console.error("Calculated amount is NaN", { measurementvalue, unitprice });
  //       return NextResponse.json({ error: "Calculated amount is invalid" }, { status: 400 });
  //     }
  
  //     await prisma.transactionItem.create({
  //       data: {
  //         transactionid,
  //         itemid: itemId,
  //         unitofmeasurement,
  //         measurementvalue,
  //         unitprice,
  //         totalamount: amount,
  //         lastmodifiedby: userid,
  //       },
  //     });
  
  //     // Update purchase with new totals
  //     const purchaseData = await prisma.transaction.findFirst({
  //       where: { transactionid },
  //       select: { taxpercentage: true, taxamount: true, totalamount: true },
  //     });
  
  //     if (!purchaseData) {
  //       return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  //     }
  
  //     const taxPercentage = purchaseData.taxpercentage ?? 0;
  //     const taxAmount = purchaseData.taxamount ?? 0;
  //     const totalAmount = purchaseData.totalamount ?? 0;
  //     const totalAmountAddTaxAmount = totalAmount + taxAmount;
  //     const newTotalAmount = totalAmountAddTaxAmount + amount;
  //     const newTaxAmount = newTotalAmount * (taxPercentage / 100);
  //     const totalAmountMinusTax = newTotalAmount - newTaxAmount;
  
  //     await prisma.transaction.update({
  //       where: { transactionid },
  //       data: {
  //         totalamount: totalAmountMinusTax,
  //         taxamount: newTaxAmount,
  //         lastmodifiedby: userid,
  //       },
  //     });
  
  //     return NextResponse.json({ message: "Purchase item processed successfully" });
  //   } catch (error) {
  //     console.error("Error processing request:", error);
  //     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  //   }
  // };

  export const POST = async (req: NextRequest) => {
    try {
      // Extract transaction ID from the URL
      const { pathname } = new URL(req.url);
      const transactionid = parseInt(pathname.split("/").pop() as string, 10);
  
      if (isNaN(transactionid)) {
        return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
      }
  
      const session = await getIronSession(req, NextResponse.next(), sessionOptions);
      const userid = session.user.userid;
  
      const formData = await req.formData();
  
      // Extract and validate form data
      const name = formData.get("Item[name]") as string;
      const typeString = formData.get("Item[type]") as string;
      const sackweightString = formData.get("Item[sackweight]") as string;
      const unitpriceString = formData.get("unitprice") as string;
      const unitofmeasurementString = formData.get("unitofmeasurement") as string;
      const measurementvalueString = formData.get("measurementvalue") as string;
  
      if (!name || !Object.values(ItemType).includes(typeString as ItemType)) {
        return NextResponse.json({ error: "Invalid item details" }, { status: 400 });
      }
  
      const unitofmeasurement = unitofmeasurementString as UnitOfMeasurement;
      const measurementvalue = parseFloat(measurementvalueString);
      const unitprice = parseFloat(unitpriceString);
  
      if (isNaN(unitprice) || isNaN(measurementvalue)) {
        console.error("Invalid number fields", { unitprice, measurementvalue });
        return NextResponse.json({ error: "Number fields must be valid numbers" }, { status: 400 });
      }
  
      if (!unitofmeasurement) {
        return NextResponse.json({ error: "Unit of measurement is required" }, { status: 400 });
      }
  
      // Calculate total amount for purchase item
      const amount = measurementvalue * unitprice;
      if (isNaN(amount)) {
        console.error("Calculated amount is NaN", { measurementvalue, unitprice });
        return NextResponse.json({ error: "Calculated amount is invalid" }, { status: 400 });
      }
  
      const [existingItem, newTransactionItem, purchaseData] = await prisma.$transaction(async (prisma) => {
        // Check or create item
        const existingItem = await prisma.item.findFirst({
          where: { name, type: typeString as ItemType, unitofmeasurement },
        });
  
        let itemId;
        if (existingItem) {
          itemId = existingItem.itemid;
          const newStock = (existingItem.stock ?? 0) + measurementvalue;
  
          await prisma.item.update({
            where: { itemid: itemId },
            data: { stock: newStock },
          });
        } else {
          const newItem = await prisma.item.create({
            data: {
              name,
              type: typeString as ItemType,
              sackweight: sackweightString as SackWeight,
              unitofmeasurement,
              stock: measurementvalue,
              lastmodifiedby: userid,
            },
          });
          itemId = newItem.itemid;
        }
  
        // Create transaction item
        const newTransactionItem = await prisma.transactionItem.create({
          data: {
            transactionid,
            itemid: itemId,
            unitofmeasurement,
            measurementvalue,
            unitprice,
            totalamount: amount,
            lastmodifiedby: userid,
          },
        });
  
        // Fetch purchase data for updating totals
        const purchaseData = await prisma.transaction.findFirst({
          where: { transactionid },
          select: { taxpercentage: true, taxamount: true, totalamount: true },
        });
  
        return [existingItem, newTransactionItem, purchaseData];
      });
  
      if (!purchaseData) {
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
      }
  
      const taxPercentage = purchaseData.taxpercentage ?? 0;
      const taxAmount = purchaseData.taxamount ?? 0;
      const totalAmount = purchaseData.totalamount ?? 0;
      const totalAmountAddTaxAmount = totalAmount + taxAmount;
      const newTotalAmount = totalAmountAddTaxAmount + amount;
      const newTaxAmount = newTotalAmount * (taxPercentage / 100);
      const totalAmountMinusTax = newTotalAmount - newTaxAmount;
  
      await prisma.transaction.update({
        where: { transactionid },
        data: {
          totalamount: totalAmountMinusTax,
          taxamount: newTaxAmount,
          lastmodifiedby: userid,
        },
      });
  
      return NextResponse.json({ message: "Purchase item processed successfully" });
    } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
  };
  
  export const PUT = async (req: NextRequest) => {
    try {
      // Extract the transaction ID from the URL
      const { pathname } = new URL(req.url);
      const transactionitemid = parseInt(pathname.split("/").pop() as string, 10);
  
      if (isNaN(transactionitemid)) {
        return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
      }
  
      const session = await getIronSession(req, NextResponse.next(), sessionOptions);
      const userid = session.user.userid;
  
      const formData = await req.formData();
  
      // Extract and validate form data
      const name = formData.get("Item[name]") as string;
      const typeString = formData.get("Item[type]") as string;
      const sackweightString = formData.get("Item[sackweight]") as string;
      const unitpriceString = formData.get("unitprice") as string;
      const unitofmeasurementString = formData.get("unitofmeasurement") as string;
      const measurementvalueString = formData.get("measurementvalue") as string;
      const transactionidString = formData.get("transactionid") as string;
      const transactionid = parseInt(transactionidString, 10);
  
      if (!name || !Object.values(ItemType).includes(typeString as ItemType)) {
        return NextResponse.json({ error: "Invalid item details" }, { status: 400 });
      }
  
      const unitofmeasurement = unitofmeasurementString as UnitOfMeasurement;
      const measurementvalue = parseFloat(measurementvalueString);
      const unitprice = parseFloat(unitpriceString);
  
      if (isNaN(unitprice) || isNaN(measurementvalue)) {
        console.error("Invalid number fields", { unitprice, measurementvalue });
        return NextResponse.json({ error: "Number fields must be valid numbers" }, { status: 400 });
      }
  
      if (!unitofmeasurement) {
        return NextResponse.json({ error: "Unit of measurement is required" }, { status: 400 });
      }
  
      // Check or create item
      const existingItem = await prisma.item.findFirst({
        where: { name, type: typeString as ItemType, unitofmeasurement },
      });
  
      let itemId;
      if (existingItem) {
        itemId = existingItem.itemid;
        const newStock = (existingItem.stock ?? 0) + measurementvalue;
  
        await prisma.item.update({
          where: { itemid: itemId },
          data: { stock: newStock },
        });
      } else {
        const newItem = await prisma.item.create({
          data: {
            name,
            type: typeString as ItemType,
            sackweight: sackweightString as SackWeight,
            unitofmeasurement,
            stock: measurementvalue,
            lastmodifiedby: userid,
          },
        });
        itemId = newItem.itemid;
      }
  
      // Calculate total amount for purchase item
      const amount = measurementvalue * unitprice;
      if (isNaN(amount)) {
        console.error("Calculated amount is NaN", { measurementvalue, unitprice });
        return NextResponse.json({ error: "Calculated amount is invalid" }, { status: 400 });
      }
  
      await prisma.transactionItem.update({
        where: { transactionitemid },
        data: {
          transactionid,
          itemid: itemId,
          unitofmeasurement,
          measurementvalue,
          unitprice,
          totalamount: amount,
          lastmodifiedby: userid,
        },
      });
  
      // Update purchase with new totals
      const purchaseData = await prisma.transaction.findFirst({
        where: { transactionid: transactionid },
        select: { taxpercentage: true, taxamount: true, totalamount: true },
      });
  
      if (!purchaseData) {
        return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
      }
  
      const taxPercentage = purchaseData.taxpercentage ?? 0;
      console.log("taxPercentage", taxPercentage);
      const taxAmount = purchaseData.taxamount ?? 0;
      console.log("taxAmount", taxAmount);
      const totalAmount = purchaseData.totalamount ?? 0;
      console.log("totalAmount", totalAmount);
      const totalAmountAddTaxAmount = totalAmount + taxAmount;
      console.log("totalAmountAddTaxAmount", totalAmountAddTaxAmount);
      const newTotalAmount = totalAmountAddTaxAmount + amount;
      console.log("newTotalAmount", newTotalAmount);
      const newTaxAmount = newTotalAmount * (taxPercentage / 100);
      console.log("newTaxAmount", newTaxAmount);
      const totalAmountMinusTax = newTotalAmount - newTaxAmount;
      console.log("totalAmountMinusTax", totalAmountMinusTax);
  
      await prisma.transaction.update({
        where: { transactionid },
        data: {
          totalamount: totalAmountMinusTax,
          taxamount: newTaxAmount,
          lastmodifiedby: userid,
        },
      });
  
      return NextResponse.json({ message: "Purchase item processed successfully" });
    } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
  

  // export const POST = async (req: NextRequest) => {
  //   try {
  //     const session = await getIronSession(req, NextResponse.next(), sessionOptions);
  //     const userid = session.user.userid;
  
  //     const formData = await req.formData();
  
  //     // Extract and validate form data
  //     const name = formData.get("TransactionItem[item][name]") as string;
  //     const typeString = formData.get("TransactionItem[item][type]") as string;
  //     const sackweightString = formData.get("TransactionItem[item][sackweight]") as string;
  //     const unitpriceString = formData.get("TransactionItem[unitprice]") as string;
  //     const unitofmeasurementString = formData.get("TransactionItem[unitofmeasurement]") as string;
  //     const measurementvalueString = formData.get("TransactionItem[measurementvalue]") as string;
  //     const transactionidString = formData.get("TransactionItem[transactionid]") as string;
  
  //     if (!name || !Object.values(ItemType).includes(typeString as ItemType)) {
  //       return NextResponse.json({ error: "Invalid item details" }, { status: 400 });
  //     }
  
  //     const unitofmeasurement = unitofmeasurementString as UnitOfMeasurement;
  //     const measurementvalue = parseFloat(measurementvalueString);
  //     const unitprice = parseFloat(unitpriceString);
  //     const transactionid = parseInt(transactionidString, 10);
  
  //     if (isNaN(unitprice) || isNaN(measurementvalue)) {
  //       console.error("Invalid number fields", { unitprice, measurementvalue });
  //       return NextResponse.json({ error: "Number fields must be valid numbers" }, { status: 400 });
  //     }
  
  //     if (!unitofmeasurement) {
  //       return NextResponse.json({ error: "Unit of measurement is required" }, { status: 400 });
  //     }
  
  //     // Check or create item
  //     const existingItem = await prisma.item.findFirst({
  //       where: { name, type: typeString as ItemType, unitofmeasurement },
  //     });
  
  //     let itemId;
  //     if (existingItem) {
  //       itemId = existingItem.itemid;
  //       const newStock = (existingItem.stock ?? 0) + measurementvalue;
  
  //       await prisma.item.update({
  //         where: { itemid: itemId },
  //         data: { stock: newStock },
  //       });
  //     } else {
  //       const newItem = await prisma.item.create({
  //         data: {
  //           name,
  //           type: typeString as ItemType,
  //           sackweight: sackweightString as SackWeight,
  //           unitofmeasurement,
  //           stock: measurementvalue,
  //           lastmodifiedby: userid,
  //         },
  //       });
  //       itemId = newItem.itemid;
  //     }
  
  //     // Calculate total amount for purchase item
  //     const amount = measurementvalue * unitprice;
  //     if (isNaN(amount)) {
  //       console.error("Calculated amount is NaN", { measurementvalue, unitprice });
  //       return NextResponse.json({ error: "Calculated amount is invalid" }, { status: 400 });
  //     }
  
  //     await prisma.transactionItem.create({
  //       data: {
  //         transactionid,
  //         itemid: itemId,
  //         unitofmeasurement,
  //         measurementvalue,
  //         unitprice,
  //         totalamount: amount,
  //         lastmodifiedby: userid,
  //       },
  //     });
  
  //     // Update purchase with new totals
  //     const purchaseData = await prisma.transaction.findFirst({
  //       where: { transactionid },
  //       select: { taxpercentage: true, taxamount: true, totalamount: true },
  //     });
  
  //     if (!purchaseData) {
  //       return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  //     }
  
  //     const taxPercentage = purchaseData.taxpercentage ?? 0;
  //     const taxAmount = purchaseData.taxamount ?? 0;
  //     const totalAmount = purchaseData.totalamount ?? 0;
  //     const totalAmountAddTaxAmount = totalAmount + taxAmount;
  //     const newTotalAmount = totalAmountAddTaxAmount + amount;
  //     const newTaxAmount = newTotalAmount * (taxPercentage / 100);
  //     const totalAmountMinusTax = newTotalAmount - newTaxAmount;
  
  //     await prisma.transaction.update({
  //       where: { transactionid },
  //       data: {
  //         totalamount: totalAmountMinusTax,
  //         taxamount: newTaxAmount,
  //         lastmodifiedby: userid,
  //       },
  //     });
  
  //     return NextResponse.json({ message: "Purchase item processed successfully" });
  //   } catch (error) {
  //     console.error("Error processing request:", error);
  //     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  //   }
  // };