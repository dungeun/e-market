'use client'

import Image from 'next/image'
import { Instagram, Heart, MessageCircle } from 'lucide-react'

interface InstagramFeedProps {
  config: {
    title?: string
    username?: string
    limit?: number
    layout?: string
    hashtag?: string
  }
}

export default function InstagramFeed({ config }: InstagramFeedProps) {
  // 임시 인스타그램 피드 데이터
  const mockPosts = [
    {
      id: 1,
      image: '/images/instagram/1.jpg',
      likes: 324,
      comments: 12,
      caption: '새로운 컬렉션 출시!'
    },
    {
      id: 2,
      image: '/images/instagram/2.jpg',
      likes: 512,
      comments: 23,
      caption: '오늘의 스타일링'
    },
    {
      id: 3,
      image: '/images/instagram/3.jpg',
      likes: 287,
      comments: 8,
      caption: '베스트 아이템'
    },
    {
      id: 4,
      image: '/images/instagram/4.jpg',
      likes: 892,
      comments: 45,
      caption: '고객님 후기'
    },
    {
      id: 5,
      image: '/images/instagram/5.jpg',
      likes: 456,
      comments: 19,
      caption: '신상품 미리보기'
    },
    {
      id: 6,
      image: '/images/instagram/6.jpg',
      likes: 673,
      comments: 31,
      caption: '주말 특가'
    },
    {
      id: 7,
      image: '/images/instagram/7.jpg',
      likes: 234,
      comments: 7,
      caption: '스타일 팁'
    },
    {
      id: 8,
      image: '/images/instagram/8.jpg',
      likes: 789,
      comments: 28,
      caption: '이벤트 안내'
    }
  ]

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Instagram className="w-8 h-8 text-pink-600" />
            {config.title && (
              <h2 className="text-3xl font-bold text-gray-900">
                {config.title}
              </h2>
            )}
          </div>
          {config.username && (
            <a
              href={`https://instagram.com/${config.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              @{config.username}
            </a>
          )}
          {config.hashtag && (
            <p className="text-gray-600 mt-1">
              {config.hashtag}
            </p>
          )}
        </div>

        {/* 인스타그램 그리드 */}
        <div className={`grid gap-4 ${
          config.layout === 'grid' 
            ? 'grid-cols-2 md:grid-cols-4' 
            : 'grid-cols-2 md:grid-cols-4'
        }`}>
          {mockPosts.slice(0, config.limit || 8).map((post) => (
            <div key={post.id} className="group relative">
              <a
                href={`https://instagram.com/${config.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100" />
                
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-center">
                    <div className="flex gap-4 justify-center mb-2">
                      <div className="flex items-center gap-1">
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="font-semibold">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span className="font-semibold">{post.comments}</span>
                      </div>
                    </div>
                    <p className="text-sm px-4 line-clamp-2">
                      {post.caption}
                    </p>
                  </div>
                </div>

                {/* 인스타그램 아이콘 */}
                <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Instagram className="w-4 h-4 text-pink-600" />
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* 인스타그램 팔로우 버튼 */}
        <div className="text-center mt-8">
          <a
            href={`https://instagram.com/${config.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Instagram에서 팔로우하기
          </a>
        </div>
      </div>
    </section>
  )
}