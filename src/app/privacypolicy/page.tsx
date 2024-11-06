"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyCard() {
  const [activeTab, setActiveTab] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information-we-collect", title: "Information We Collect" },
    { id: "how-we-use", title: "How We Use Your Information" },
    { id: "data-sharing", title: "Data Sharing and Disclosure" },
    { id: "data-security", title: "Data Security" },
    { id: "data-retention", title: "Data Retention" },
    { id: "your-rights", title: "Your Rights" },
    { id: "cookies", title: "Cookies" },
    { id: "changes", title: "Changes to Privacy Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-customColors-eveningSeaGreen">
            Privacy Policy for 3R Shane Mill IMS
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
                  We respect your privacy and are committed to protecting your
                  personal and business data. This Privacy Policy explains how
                  we collect, use, store, and protect your information when you
                  use our Service.
                </p>
              </TabsContent>
              <TabsContent value="information-we-collect">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Information We Collect
                </h2>
                <p>
                  We collect the following types of information to provide and
                  improve our Service:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>
                    <strong>Personal Information:</strong> When your admin
                    create your account, we may collect your name, email
                    address, and other details.
                  </li>
                  <li>
                    <strong>Business Information:</strong> Information related
                    to your company&apos;s operations, including inventory data,
                    purchase orders, sales transactions, and product
                    information.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Data related to your use of the
                    Service, such as login information.
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="how-we-use">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  How We Use Your Information
                </h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Provide and improve the functionality of the Service.</li>
                  <li>
                    Generate reports and analytics to assist with
                    decision-making.
                  </li>
                  <li>
                    Communicate with you about your account and updates to the
                    Service.
                  </li>
                  <li>Comply with legal obligations.</li>
                </ul>
              </TabsContent>
              <TabsContent value="data-sharing">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Data Sharing and Disclosure
                </h2>
                <p>
                  We do not sell, rent, or share your personal or business
                  information with third parties, except in the following
                  circumstances:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> We may share data with
                    trusted third-party service providers who assist us in
                    operating the Service, cloud hosting providers, or
                    performing other business functions.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose your
                    information if required by law or to comply with legal
                    obligations, such as in response to a subpoena or court
                    order.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In the event of a
                    merger, acquisition, or sale of assets, your information may
                    be transferred as part of the transaction.
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="data-security">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Data Security
                </h2>
                <p>
                  We implement reasonable security measures to protect your data
                  from unauthorized access, alteration, disclosure, or
                  destruction. However, no data transmission or storage system
                  can be guaranteed 100% secure.
                </p>
              </TabsContent>
              <TabsContent value="data-retention">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Data Retention
                </h2>
                <p>
                  We retain your information for as long as necessary to fulfill
                  the purposes outlined in this Privacy Policy or as required by
                  law. You can request the deletion of your data by contacting
                  us at 3rshaneims@gmail.com.
                </p>
              </TabsContent>
              <TabsContent value="your-rights">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Your Rights
                </h2>
                <p>
                  Depending on your jurisdiction, you may have the right to
                  access, correct, or delete your personal information. You can
                  also object to or restrict certain data processing activities.
                  Please contact us at 3rshaneims@gmail.com to exercise these
                  rights.
                </p>
              </TabsContent>
              <TabsContent value="cookies">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Cookies
                </h2>
                <p>
                  Our website may use cookies to enhance your user experience.
                  Cookies are small text files stored on your device that help
                  us recognize you and provide personalized features. You can
                  control cookie settings through your browser, but disabling
                  cookies may affect your experience with the Service.
                </p>
              </TabsContent>
              <TabsContent value="changes">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Changes to Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page with an updated. We
                  encourage you to review this Privacy Policy periodically to
                  stay informed about how we protect your information.
                </p>
              </TabsContent>
              <TabsContent value="contact">
                <h2 className="text-xl font-semibold mb-4 text-customColors-eveningSeaGreen">
                  Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy or how we
                  handle your data, please contact us at:
                </p>
                <address className="mt-2 not-italic">
                  <strong>3R Shane Mill IMS</strong>
                  <br />
                  Email: 3rshaneims@gmail.com
                  <br />
                </address>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
