export type ID = string;

export interface Brand {
  id: ID;
  name: string;
  slug: string;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  parentId?: ID | null;
}

export interface Collection {
  id: ID;
  name: string;
  slug: string;
}

export interface Review {
  id: ID;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface ProductVariant {
  color: string;
  colorHex: string;
  sizes: { size: string; stock: number }[];
  image?: string;
}

export interface Product {
  id: ID;
  name: string;
  slug: string;
  description: string;
  materials: string;
  care: string;
  shipping: string;
  returns: string;
  price: number;
  salePrice?: number | null;
  brand: string;
  category: string;
  collections: string[];
  tags: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  material: string;
  isNew: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  isFeatured: boolean;
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  productId: ID;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
}
