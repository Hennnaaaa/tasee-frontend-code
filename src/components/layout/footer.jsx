import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-serif mb-4">tasee</h3>
            <p className="text-gray-400">Your destination for premium women's fashion</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/new-arrivals" className="text-gray-400 hover:text-white">New Arrivals</Link></li>
              <li><Link href="/dresses" className="text-gray-400 hover:text-white">Dresses</Link></li>
              <li><Link href="/sale" className="text-gray-400 hover:text-white">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
            <ul className="space-y-2">
              <li><Link href="/size-guide" className="text-gray-400 hover:text-white">Size Guide</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white">Shipping & Returns</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white">Pinterest</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">&copy; 2024 Tasee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;