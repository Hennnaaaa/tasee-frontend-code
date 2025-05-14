import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProductCard = ({ product }) => {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 mb-4 relative">
          <img
            src={product.image || "/api/placeholder/300/450"}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {product.sale && (
            <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
          )}
          {product.isNew && (
            <Badge className="absolute top-2 left-2 bg-pink-600">New</Badge>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button size="sm" className="bg-white text-black hover:bg-gray-100">
              Quick View
            </Button>
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        <div className="mt-1 flex items-center">
          <p className="text-sm font-medium text-gray-900">${product.price}</p>
          {product.originalPrice && (
            <p className="ml-2 text-sm text-gray-500 line-through">
              ${product.originalPrice}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
