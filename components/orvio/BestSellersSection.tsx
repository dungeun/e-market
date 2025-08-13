'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  rating: number
  isNew?: boolean
  colors?: string[]
  category: string
}

interface BestSellersProps {
  products?: Product[]
}

export default function OrvioBestSellersSection({ products }: BestSellersProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

  const categories = ['all', 'mobile', 'tablet', 'laptop', 'watch', 'headphone']

  const defaultProducts: Product[] = [
    {
      id: '1',
      name: 'Smartphone 15 Black',
      price: 149.99,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 5,
      isNew: false,
      colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
      category: 'mobile'
    },
    {
      id: '2',
      name: 'iPhone 16 & iPhone 16 Plus',
      price: 249.99,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 5,
      isNew: true,
      colors: ['#000000', '#FFFFFF', '#FFD700', '#C0C0C0'],
      category: 'mobile'
    },
    {
      id: '3',
      name: 'iPad Pro 2024',
      price: 899.99,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 4.5,
      isNew: false,
      colors: ['#000000', '#FFFFFF'],
      category: 'tablet'
    },
    {
      id: '4',
      name: 'MacBook Air M3',
      price: 1299.99,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 5,
      isNew: true,
      colors: ['#C0C0C0', '#FFD700', '#000000'],
      category: 'laptop'
    },
    {
      id: '5',
      name: 'Apple Watch Series 9',
      price: 399.99,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 4.5,
      isNew: false,
      colors: ['#000000', '#FFFFFF', '#FF0000'],
      category: 'watch'
    },
    {
      id: '6',
      name: 'AirPods Pro 2',
      price: 249.99,
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      rating: 5,
      isNew: false,
      colors: ['#FFFFFF'],
      category: 'headphone'
    }
  ]

  const displayProducts = products || defaultProducts
  const filteredProducts = selectedCategory === 'all' 
    ? displayProducts 
    : displayProducts.filter(p => p.category === selectedCategory)

  const handleImageHover = (productId: string) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % 3
    }))
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 text-sm font-semibold rounded-full mb-4">
            The Best Sellers
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover what everyone's talking about.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of top-rated products loved by customers worldwide
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Product Badge */}
                {product.isNew && (
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-full">
                    NEW
                  </span>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:shadow-lg transition-shadow">
                    <ShoppingCart className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:shadow-lg transition-shadow">
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:shadow-lg transition-shadow">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {/* Product Image */}
                <div 
                  className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
                  onMouseMove={() => handleImageHover(product.id)}
                >
                  <Image
                    src={product.images?.[currentImageIndex[product.id] || 0] || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-3">
                    ${product.price}
                  </p>

                  {/* Color Options */}
                  {product.colors && (
                    <div className="flex gap-2 mb-3">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                          style={{ backgroundColor: color }}
                          aria-label={`Color ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      ({product.rating})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            View All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}