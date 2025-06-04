// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/authcontext";
import { CartProvider } from "@/contexts/cartContext";
import { AddressProvider } from "@/contexts/addressContext"; // Correct import
import { CurrencyProvider } from "@/contexts/currencyContext";
import { ToastContainer } from "react-toastify";
import ConditionalLayout from "../components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tasee - Premium Women's Fashion",
  description: "Discover the latest trends in women's clothing and accessories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <ToastContainer> */}
        <AuthProvider>
          <CartProvider>
            <CurrencyProvider>
              <AddressProvider>
                <ConditionalLayout>
                    {children}
                </ConditionalLayout>
                <ToastContainer/>
              </AddressProvider>
            </CurrencyProvider>
          </CartProvider>
        </AuthProvider>
        {/* </ToastContainer> */}
      </body>
    </html>
  );
}
