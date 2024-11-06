"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@/components/icons/Icons";

export default function Component() {
  const [activeTab, setActiveTab] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "eligibility", title: "Eligibility" },
    { id: "account", title: "Account Creation" },
    { id: "license", title: "License Grant" },
    { id: "use", title: "Use of Service" },
    { id: "security", title: "Data Security" },
    { id: "analytics", title: "Analytics" },
    { id: "payment", title: "Payment and Fees" },
    { id: "termination", title: "Termination" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "indemnification", title: "Indemnification" },
    { id: "changes", title: "Changes to Terms" },
    { id: "law", title: "Governing Law" },
  ];

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-customColors-eveningSeaGreen">
            Terms of Service for 3R Shane Mill IMS
          </CardTitle>
          <Link href="/" passHref>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex"
          >
            <TabsList className="w-1/3 flex-col h-[600px] overflow-auto">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="w-full justify-start text-left px-4 py-2"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollArea className="w-2/3 h-[600px] p-4">
              <TabsContent value="introduction">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Introduction
                </h2>
                <p>
                  By accessing or using the web-based application 3R Shane Mill
                  IMS provided by Bain Hansly Cruz, you agree to comply with and
                  be bound by these Terms of Service. If you do not agree to
                  these Terms, you must not access or use the Service.
                </p>
                <p className="mt-4">
                  These Terms apply to the use of the 3R Shane Mill IMS
                  application, which is designed to manage the inventory,
                  procurement, and sales operations of 3R Shane Rice Mill,
                  including:
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    Inventory Management: Track and manage stock levels, perform
                    audits, and monitor stock movements.
                  </li>
                  <li>
                    Purchase Order Management: Manage procurement processes for
                    paddy rice and related by-products.
                  </li>
                  <li>
                    Sales Management: Manage point-of-sale (POS) transactions,
                    view sales history, and generate sales reports.
                  </li>
                  <li>
                    Analytics: Gain insights and data-driven reports on
                    inventory, purchase orders, and sales for business
                    decision-making.
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="eligibility">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Eligibility
                </h2>
                <p>By using the Service, you represent and warrant that:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>You are at least 18 years of age.</li>
                  <li>
                    You are legally capable of entering into and abiding by
                    these Terms.
                  </li>
                  <li>
                    The Service is intended solely for the business operations
                    of 3R Shane Rice Mill, and access is granted only to
                    authorized users within the organization.
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="account">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Account Creation and Responsibilities
                </h2>
                <p>
                  To access the Service, you are required to request an account
                  creation to your admin. You agree to:
                </p>
                <ul className="list-disc list-inside mt-2">
                  <li>
                    Provide accurate, current, and complete information during
                    account creation.
                  </li>
                  <li>
                    Maintain the confidentiality of your account login details,
                    including username and password.
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account or other security breaches.
                  </li>
                  <li>
                    Be solely responsible for all activities under your account.
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="license">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  License Grant
                </h2>
                <p>
                  Subject to your compliance with these Terms, we grant you a
                  limited, non-exclusive, non-transferable license to access and
                  use the Service for your internal business purposes.
                </p>
              </TabsContent>
              <TabsContent value="use">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Use of the Service
                </h2>
                <p>
                  You agree to use the Service only for lawful purposes and in
                  accordance with these Terms. Prohibited activities include,
                  but are not limited to:
                </p>
                <ul className="list-disc list-inside mt-2 text-customColors-eveningSeaGreen">
                  <li>
                    Using the Service to engage in any fraudulent, illegal, or
                    harmful activity.
                  </li>
                  <li>
                    Attempting to interfere with or disrupt the functionality of
                    the Service.
                  </li>
                  <li>
                    Reverse engineering or attempting to extract the source code
                    of the Service.
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="security">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Data Security and Privacy
                </h2>
                <p>
                  We take reasonable precautions to protect your data. However,
                  you acknowledge that no data transmission over the internet is
                  completely secure. You are responsible for ensuring that your
                  use of the Service complies with applicable data protection
                  laws.
                </p>
              </TabsContent>
              <TabsContent value="analytics">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Analytics and Reporting
                </h2>
                <p>
                  The Service provides analytics tools to help you monitor and
                  optimize your inventory, purchase orders, and sales
                  performance. These reports are based on the data you input
                  into the Service. We make no guarantees regarding the accuracy
                  or completeness of the reports generated by the Service.
                </p>
              </TabsContent>
              <TabsContent value="payment">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Payment and Fees
                </h2>
                <p>
                  Access to certain features of the Service may require payment.
                  If applicable, fees will be outlined in your subscription
                  agreement. All payments are non-refundable, unless otherwise
                  stated in your agreement.
                </p>
              </TabsContent>
              <TabsContent value="termination">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Termination
                </h2>
                <p>
                  We may suspend or terminate your access to the Service at any
                  time, with or without cause, if we believe that you have
                  violated these Terms or for any other reason, at our sole
                  discretion. Upon termination, all rights granted to you will
                  immediately cease, and you must cease using the Service.
                </p>
              </TabsContent>
              <TabsContent value="liability">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by applicable law, 3R Shane
                  Mill IMS and its affiliates will not be liable for any
                  indirect, incidental, special, or consequential damages,
                  including loss of profits, arising out of or in connection
                  with the use of the Service.
                </p>
              </TabsContent>
              <TabsContent value="indemnification">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Indemnification
                </h2>
                <p>
                  You agree to indemnify and hold harmless 3R Shane Mill IMS and
                  its affiliates, officers, employees, and agents from any
                  claims, losses, or damages arising from your use of the
                  Service or your breach of these Terms.
                </p>
              </TabsContent>
              <TabsContent value="changes">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Changes to Terms
                </h2>
                <p>
                  We may modify these Terms at any time. Any changes will be
                  effective when posted on our website or within the Service. It
                  is your responsibility to review these Terms periodically for
                  updates.
                </p>
              </TabsContent>
              <TabsContent value="law">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Governing Law
                </h2>
                <p>
                  These Terms are governed by and construed in accordance with
                  the laws of [Your Jurisdiction]. Any disputes arising from or
                  related to these Terms will be resolved in the courts of [Your
                  Jurisdiction].
                </p>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
