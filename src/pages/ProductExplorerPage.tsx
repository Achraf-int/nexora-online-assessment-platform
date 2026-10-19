import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Layers,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  RotateCw,
  AlertCircle,
  Tag,
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { productService, ProductQueryParams } from '../services/productService';
import { DummyProduct } from '../types';

export const ProductExplorerPage: React.FC = () => {
  const [products, setProducts] = useState<DummyProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'rating'>('title');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Selected product for detailed modal
  const [selectedProduct, setSelectedProduct] = useState<DummyProduct | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Debounce search effect (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset to page 1 on search
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load categories once
  useEffect(() => {
    productService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.warn('Could not load categories:', err));
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const res = await productService.getProducts({
        search: debouncedSearch,
        category: category !== 'all' ? category : undefined,
        limit: itemsPerPage,
        skip,
        sortBy,
        order,
      });
      setProducts(res.products || []);
      setTotalProducts(res.total || 0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to the Products API. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, category, currentPage, itemsPerPage, sortBy, order]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

  const handleOpenProduct = (prod: DummyProduct) => {
    setSelectedProduct(prod);
    setActiveImageIndex(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Architecture Callout */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                External REST API Integration
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-400">Live DummyJSON Provider</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Product API Explorer
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Demonstrates real-time REST API consumption, debounced search, category filtering,
              paginated responses, client-side caching, and responsive UI optimization.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fetchProducts()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh API</span>
            </button>
          </div>
        </div>

        {/* Note on Android RecyclerView Equivalence */}
        <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Architecture Note:</span> The original assignment mentions
            Android’s <code className="font-mono bg-teal-100/60 dark:bg-teal-900/60 px-1 py-0.5 rounded text-[11px]">RecyclerView</code>.
            In this modern web client, we implement an equivalent efficient, reusable, responsive list
            component with controlled pagination and memoized DOM nodes. This component is completely decoupled
            from the exam workflow.
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Debounced Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by title (debounced API call)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb as any);
                setOrder(ord as any);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Highest First</option>
            </select>
          </div>
        </div>

        {/* Count Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Found <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">{totalProducts}</span> total catalog items
          </span>
          <span className="font-mono tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 animate-pulse shadow-xs"
            >
              <div className="w-full h-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        /* Error State with Retry Button */
        <div className="bg-white dark:bg-[#111827] border border-rose-200 dark:border-rose-900/60 rounded-xl p-10 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              API Connection Interrupted
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={() => fetchProducts()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            No products match your query
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try searching for a different keyword or resetting your category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('all');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleOpenProduct(prod)}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:border-teal-400 dark:hover:border-teal-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Product Thumbnail Container with Fallback */}
                <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={prod.thumbnail || prod.images?.[0]}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-xs shadow-xs uppercase tracking-wider">
                    {prod.category}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-medium">{prod.brand || 'Generic'}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-mono font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="tabular-nums">{prod.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {prod.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Price & Action Bottom Strip */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-3">
                <div className="pt-3">
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                      ${prod.price.toFixed(2)}
                    </span>
                    {prod.discountPercentage > 0 && (
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold tabular-nums">
                        -{Math.round(prod.discountPercentage)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:underline flex items-center gap-1">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && !errorMessage && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {selectedProduct.category} · {selectedProduct.brand || 'Brand Direct'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedProduct.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="w-full h-64 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-4 overflow-hidden">
                <img
                  src={
                    selectedProduct.images?.[activeImageIndex] ||
                    selectedProduct.thumbnail ||
                    selectedProduct.images?.[0]
                  }
                  alt={selectedProduct.title}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-lg border overflow-hidden shrink-0 p-1 bg-slate-50 dark:bg-slate-900 ${
                        activeImageIndex === idx
                          ? 'border-teal-500 ring-2 ring-teal-400'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${selectedProduct.title} thumb ${idx}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Stock Grid */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">UNIT PRICE</span>
                <span className="font-mono font-bold text-base text-slate-900 dark:text-white tabular-nums">
                  ${selectedProduct.price.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">RATING</span>
                <div className="flex items-center gap-1 font-mono font-bold text-amber-500 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{selectedProduct.rating.toFixed(2)} / 5</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INVENTORY</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {selectedProduct.stock} units
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Description</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Specifications / Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedProduct.warrantyInformation && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{selectedProduct.warrantyInformation}</span>
                </div>
              )}
              {selectedProduct.shippingInformation && (
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{selectedProduct.shippingInformation}</span>
                </div>
              )}
            </div>

            {/* Modal Close Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
