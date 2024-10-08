// pages/customers.js
import React from "react";
import { z } from "zod";
import entitySchema, { Entity } from "@/schemas/entity.schema";

export const getServerSideProps = async () => {
  try {
    const response = await fetch("/api/customer"); // Use your actual API URL
    const text = await response.text();
    console.log("Raw Response Text:", text);

    const data = JSON.parse(text);

    // Validate and parse data using Zod
    const parsedData = data
      .map((item: any) => {
        // Validate each item
        const validationResult = entitySchema.safeParse(item);
        if (!validationResult.success) {
          console.error("Validation error for item:", validationResult.error);
          return null; // or handle the error according to your needs
        }
        // Return the validated item
        return {
          ...validationResult.data,
          createdat: validationResult.data.createdat
            ? new Date(validationResult.data.createdat)
            : null,
          lastmodifiedat: validationResult.data.lastmodifiedat
            ? new Date(validationResult.data.lastmodifiedat)
            : null,
        };
      })
      .filter(Boolean); // Filter out any null values from validation errors

    console.log("Parsed Data with Date Conversion:", parsedData);

    return {
      props: {
        customers: parsedData, // Pass validated data as props
      },
    };
  } catch (error) {
    console.error("Error fetching customers:", error);

    return {
      props: {
        customers: [], // Handle errors accordingly
      },
    };
  }
};

const CustomersPage = ({ customers }) => {
  return (
    <div>
      <h2>Customers</h2>
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>
            {customer.name} -{" "}
            {customer.createdat ? customer.createdat.toString() : "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomersPage;
