import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Component() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium">
          Invoice #12345
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="grid gap-6 md:gap-8">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              Customer Information
            </h2>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              Payment Options
            </h2>
            <div className="grid gap-4">
              <RadioGroup
                defaultValue="cash"
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="cash"
                    id="cash"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-100 bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-gray-900 [&:has([data-state=checked])]:border-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:peer-data-[state=checked]:border-gray-50 dark:[&:has([data-state=checked])]:border-gray-50"
                  >
                    <BankNote className="mb-3 h-6 w-6" />
                    Cash
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="credit-card"
                    id="credit-card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="credit-card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-gray-100 bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-gray-900 [&:has([data-state=checked])]:border-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:peer-data-[state=checked]:border-gray-50 dark:[&:has([data-state=checked])]:border-gray-50"
                  >
                    <CreditCardIcon className="mb-3 h-6 w-6" />
                    Credit Card
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:gap-8 bg-gray-100 p-6 rounded-md dark:bg-gray-800">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              Order Summary
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Wireless Headphones
                  </TableCell>
                  <TableCell>1</TableCell>
                  <TableCell className="text-right">$99.99</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Bluetooth Speaker
                  </TableCell>
                  <TableCell>2</TableCell>
                  <TableCell className="text-right">$59.99</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Laptop Sleeve</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell className="text-right">$29.99</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-500 dark:text-gray-400">Subtotal</div>
              <div>$189.97</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-gray-500 dark:text-gray-400">Shipping</div>
              <div>$9.99</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-gray-500 dark:text-gray-400">Tax</div>
              <div>$16.04</div>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <div>Total</div>
              <div>$215.00</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-8 md:mt-12 gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Place Order</Button>
      </div>
    </div>
  );
}

function CreditCardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function BankNote(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="20" height="14" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
