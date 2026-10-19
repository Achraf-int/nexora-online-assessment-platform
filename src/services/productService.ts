import { DummyProduct, DummyProductsResponse } from '../types';

const BASE_URL = 'https://dummyjson.com/products';

// Simple in-memory cache for API performance optimization
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export interface ProductQueryParams {
  search?: string;
  category?: string;
  limit?: number;
  skip?: number;
  sortBy?: 'title' | 'price' | 'rating';
  order?: 'asc' | 'desc';
}

export const productService = {
  async getProducts(params: ProductQueryParams = {}): Promise<DummyProductsResponse> {
    const { search = '', category = '', limit = 12, skip = 0, sortBy, order = 'asc' } = params;

    let endpoint = `${BASE_URL}?limit=${limit}&skip=${skip}`;
    if (search.trim()) {
      endpoint = `${BASE_URL}/search?q=${encodeURIComponent(search.trim())}&limit=${limit}&skip=${skip}`;
    } else if (category && category !== 'all') {
      endpoint = `${BASE_URL}/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
    }

    if (sortBy) {
      endpoint += `&sortBy=${sortBy}&order=${order}`;
    }

    const cacheKey = endpoint;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: DummyProductsResponse = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  },

  async getCategories(): Promise<Array<{ slug: string; name: string; url: string }>> {
    const cacheKey = `${BASE_URL}/categories`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS * 5) {
      return cached.data;
    }

    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    // Normalize if array of strings or array of objects
    const normalized = Array.isArray(data)
      ? data.map((item) => {
          if (typeof item === 'string') {
            return { slug: item, name: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' '), url: '' };
          }
          return item;
        })
      : [];

    cache.set(cacheKey, { data: normalized, timestamp: Date.now() });
    return normalized;
  },

  async getProductById(id: number | string): Promise<DummyProduct> {
    const cacheKey = `${BASE_URL}/${id}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product details: ${response.status}`);
    }

    const data: DummyProduct = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  },
};
