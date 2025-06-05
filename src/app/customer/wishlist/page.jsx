// app/customer/wishlist/page.jsx

import WishlistPage from '@/components/customerComponents/wishlist/WishlistPage';

export const metadata = {
  title: 'My Wishlist - Tasee',
  description: 'View and manage your favorite items in your wishlist',
};

export default function CustomerWishlistPage() {
  return <WishlistPage />;
}