"use client";
import Link from "next/link";
import Image from "next/image";
import { WheatIcon } from "@/components/icons/Icons";

export default function Component() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-customColors-lightPastelGreen">
      <header className="px-4 mt-4 lg:px-6 h-14 flex items-center">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <WheatIcon className="h-6 w-6 mr-2" />
          <span className="text-3xl font-bold text-customColors-eveningSeaGreen">
            3R Shane Rice Mill
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-xl font-medium border border-customColors-eveningSeaGreen px-3 py-1 rounded-sm bg-customColors-eveningSeaGreen text-gray-50 "
            prefetch={false}
          >
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-customColors-eveningSeaGreen">
                    3R Shane Rice Mill Inventory Management System
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Our Inventory Management System with POS integration and
                    Purchase Order module is designed to streamline the
                    operations of 3R Shane Rice Mill. Manage your inventory
                    efficiently, track sales, and handle purchases with ease.
                  </p>
                </div>
              </div>
              <Image
                src="/next.svg"
                alt="Hero"
                width={600}
                height={400}
                className="mx-auto aspect-square overflow-hidden rounded-xl object-fill sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Our System Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-customColors-eveningSeaGreen">
                  Streamline Your Operations
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our Inventory Management System is designed to help you
                  streamline your operations and grow your business. With
                  features like POS integration, purchase module, and inventory
                  tracking, you can manage your business more efficiently and
                  effectively.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Image
                src="/landingpageimage/inventory.png"
                alt=""
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-fill object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-customColors-eveningSeaGreen">
                    Inventory Management
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Our Inventory Management System allows you to track your
                    inventory in real-time, and manage stock levels to help you
                    make informed decisions about your business.
                  </p>
                </div>
                <Link
                  href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-customColors-eveningSeaGreen px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                  prefetch={false}
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Image
                src="/landingpageimage/sales.png"
                alt=""
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-fill object-center sm:w-full"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-customColors-eveningSeaGreen">
                    Point of Sale
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Our POS integration allows you to manage your sales and
                    inventory in one place. Track sales, and handle transactions
                    with ease.
                  </p>
                </div>
                <Link
                  href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-customColors-eveningSeaGreen px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                  prefetch={false}
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Image
                src="/landingpageimage/purchaseorderhistory.png"
                alt=""
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-fill object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-customColors-eveningSeaGreen">
                    Purchase Order
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Our purchase order feature simplifies the management and
                    tracking of your orders. You can easily monitor order
                    status, and ensure timely delivery.
                  </p>
                </div>
                <Link
                  href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-customColors-eveningSeaGreen px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                  prefetch={false}
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Image
                src="/next.svg"
                alt=""
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-fill object-center sm:w-full"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-customColors-eveningSeaGreen">
                    Dashboard analytics
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Our dashboard analytics feature provides an overview of your
                    business by integrating inventory, sales, and purchase order
                    data into a single, user-friendly interface. With insights,
                    you can monitor inventory levels, track sales performance,
                    and analyze sales and purchase trends all in one place.
                  </p>
                </div>
                <Link
                  href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-customColors-eveningSeaGreen px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                  prefetch={false}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="about-us" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tigh text-customColors-eveningSeaGreen">
                  About 3R Shane Rice Mill
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  3R Shane Rice Mill is a family-owned business that has been
                  producing high-quality rice for over 16 years. Our commitment
                  to delivering the best rice products to our customers has made
                  us a trusted name in the industry.
                </p>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  We take pride in our diverse selection of rice varieties, each
                  with its own unique flavor and texture. From our fragrant
                  Jasmine rice to our hearty Brown rice, we strive to provide
                  our customers with the best possible rice experience.
                </p>
              </div>
              <Image
                src="/next.svg"
                width={550}
                height={310}
                alt="Shane Rice Mill"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-fill object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; 2024 3R Shane Rice Mill. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
