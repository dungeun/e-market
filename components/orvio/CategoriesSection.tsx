'use client';

import React from 'react';

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  productCount: number
  image: string
  link: string
}

interface CategoriesProps {
  categories?: Category[]
}

const OrvioCategoriesSection = React.memo(function OrvioCategoriesSection({ categories }: CategoriesProps) {
  const defaultCategories: Category[] = [
    {
      id: '1',
      name: 'Earphones',
      productCount: 8,
      image: '/placeholder.svg',
      link: '/category/earphones'
    },
    {
      id: '2',
      name: 'Extreme Gaming',
      productCount: 12,
      image: '/placeholder.svg',
      link: '/category/gaming'
    },
    {
      id: '3',
      name: 'Smartwatches',
      productCount: 15,
      image: '/placeholder.svg',
      link: '/category/smartwatches'
    },
    {
      id: '4',
      name: 'Smart Home',
      productCount: 10,
      image: '/placeholder.svg',
      link: '/category/smart-home'
    },
    {
      id: '5',
      name: 'Cameras',
      productCount: 7,
      image: '/placeholder.svg',
      link: '/category/cameras'
    },
    {
      id: '6',
      name: 'Laptops',
      productCount: 20,
      image: '/placeholder.svg',
      link: '/category/laptops'
    },
    {
      id: '7',
      name: 'Tablets',
      productCount: 9,
      image: '/placeholder.svg',
      link: '/category/tablets'
    },
    {
      id: '8',
      name: 'Accessories',
      productCount: 25,
      image: '/placeholder.svg',
      link: '/category/accessories'
    }
  ]

  const displayCategories = categories || defaultCategories

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 text-sm font-semibold rounded-full mb-4">
              Choose categories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Capture every details
            </h2>
          </div>
          <Link
            href="/categories"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 text-gray-700 font-medium hover:text-purple-600 transition-colors group"
          >
            <span>View More</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayCategories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Category Header */}
                <div className="p-6 pb-0">
                  <h5 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h5>
                  <span className="text-sm text-gray-500">
                    {category.productCount} Products
                  </span>
                </div>

                {/* Category Image */}
                <div className="relative h-48 p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-t-3xl mt-4"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Image
                      src={category.image || '/placeholder.svg'}
                      alt={category.name}
                      width={160}
                      height={160}
                      className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Category Footer */}
                <div className="p-6 pt-0">
                  <div className="flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
                    <span>View Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="relative mt-12">
          <div className="absolute -top-20 -right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </div>
    </section>
  )
});

export default OrvioCategoriesSection;