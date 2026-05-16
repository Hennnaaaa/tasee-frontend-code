'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { GET_NAVIGATION_CATEGORIES } from '@/utils/routes/productManagementRoutes';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(GET_NAVIGATION_CATEGORIES)
      .then(res => { if (res.data.success) setCategories(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <footer className="bg-stone-950 text-white">

      {/* Main footer grid */}
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5">
              <Image
                src="/tasee_30x_white.png"
                alt="Tasee"
                width={120}
                height={32}
                quality={100}
                priority
                className="h-8 w-auto object-contain"
                style={{ filter: 'contrast(1.1) brightness(1.05)' }}
              />
            </div>
            <p className="text-stone-500 text-xs leading-relaxed tracking-wide max-w-xs mb-7">
              Premium women's fashion crafted with intention. Timeless elegance for the modern woman.
            </p>
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/taseeofficial?igsh=MW9ubHFpODRvZ251bw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              {/* Email */}
              <a
                href="mailto:info@xn--taee-m5a.com"
                className="text-stone-600 hover:text-white transition-colors duration-200"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Shop / Categories ── */}
          <div>
            <h3 className="text-[10px] tracking-[0.45em] uppercase text-stone-400 font-semibold mb-5">
              Shop
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-3 bg-stone-800 rounded animate-pulse" style={{ width: `${50 + i * 10}%` }} />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {/* All Products */}
                <Link
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/catalog`}
                  className="block text-xs text-stone-400 hover:text-white tracking-wide transition-colors duration-200 py-0.5 mb-4"
                >
                  All Products →
                </Link>

                {/* Parent → Subcategory groups */}
                {categories.map(cat => (
                  <div key={cat.id} className="mb-4">
                    {/* Parent — non-clickable label */}
                    <p className="text-[10px] tracking-[0.4em] uppercase text-stone-600 font-semibold mb-2 cursor-default select-none">
                      {cat.name}
                    </p>
                    {/* Subcategories — clickable */}
                    {cat.subcategories?.length > 0 ? (
                      <ul className="space-y-1 pl-2 border-l border-stone-800">
                        {cat.subcategories.map(sub => (
                          <li key={sub.id}>
                            <Link
                              href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/category/${cat.slug}/${sub.slug}`}
                              className="block text-xs text-stone-500 hover:text-white tracking-wide transition-colors duration-200 py-0.5"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Account ── */}
          <div>
            <h3 className="text-[10px] tracking-[0.45em] uppercase text-stone-400 font-semibold mb-5">
              Account
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'My Account', href: '/customer/profile' },
                { label: 'My Orders', href: '/customer/orders' },
                { label: 'Wishlist', href: '/customer/wishlist' },
                { label: 'Shopping Cart', href: '/customer/cart' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}${href}`}
                    className="text-xs text-stone-500 hover:text-white tracking-wide transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="text-[10px] tracking-[0.45em] uppercase text-stone-400 font-semibold mb-5">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@xn--taee-m5a.com"
                  className="flex items-start gap-2.5 text-xs text-stone-500 hover:text-white tracking-wide transition-colors duration-200 group"
                >
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-700 group-hover:text-stone-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@xn--taee-m5a.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-stone-500 tracking-wide">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pakistan
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-stone-900 max-w-screen-xl mx-auto px-6 sm:px-10 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-700 text-[11px] tracking-wide">
            &copy; {currentYear} Tasee. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/privacy-policy`} className="text-stone-700 hover:text-white text-[11px] tracking-wide transition-colors duration-200">
              Privacy
            </Link>
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/terms-conditions`} className="text-stone-700 hover:text-white text-[11px] tracking-wide transition-colors duration-200">
              Terms
            </Link>
            <a href="mailto:info@xn--taee-m5a.com" className="text-stone-700 hover:text-white text-[11px] tracking-wide transition-colors duration-200">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
