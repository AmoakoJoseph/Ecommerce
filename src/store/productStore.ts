import { create } from 'zustand';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  category: string;
  setSearchTerm: (term: string) => void;
  setCategory: (category: string) => void;
  filteredProducts: () => Product[];
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 129.99,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
    category: 'Electronics',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking',
    price: 199.99,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
    category: 'Electronics',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Laptop Stand',
    description: 'Ergonomic laptop stand for better posture',
    price: 49.99,
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80',
    category: 'Accessories',
    created_at: new Date().toISOString()
  }
];

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  loading: false,
  error: null,
  searchTerm: '',
  category: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCategory: (category: string) => set({ category }),
  filteredProducts: () => {
    const { products, searchTerm, category } = get();
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !category || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }
}));