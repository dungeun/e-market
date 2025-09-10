'use client';

import React from 'react';

import { useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface VideoShowcaseProps {
  config: {
    title?: string
    videos?: {
      id: number
      videoUrl: string
      thumbnail: string
      productId?: string | null
      title: string
    }[]
    autoplay?: boolean
    muted?: boolean
    layout?: string
  }
}

const VideoShowcase = React.memo(function VideoShowcase({ config }: VideoShowcaseProps) {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [mutedStates, setMutedStates] = useState<{ [key: number]: boolean }>({})

  const togglePlay = (videoId: number) => {
    setPlayingVideo(playingVideo === videoId ? null : videoId)
  }

  const toggleMute = (videoId: number) => {
    setMutedStates(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }))
  }

  if (!config?.videos || config?.videos.length === 0) return null

  return (
    <section className="py-12 px-4 bg-black">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        {config?.title && (
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            {config?.title}
          </h2>
        )}

        {/* 비디오 그리드 */}
        <div className={`grid gap-6 ${
          config?.layout === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {config?.videos.map((video) => (
            <div key={video.id} className="relative group">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {/* 썸네일 */}
                <img
                  src={video.thumbnail || '/placeholder.svg'}
                  alt={video.title}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    playingVideo === video.id ? 'opacity-0' : 'opacity-100'
                  }`}
                />

                {/* 비디오 */}
                {playingVideo === video.id && video.videoUrl && (
                  <video
                    src={video.videoUrl}
                    autoPlay
                    muted={mutedStates[video.id] ?? config?.muted}
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* 컨트롤 오버레이 */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => togglePlay(video.id)}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
                    >
                      {playingVideo === video.id ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </div>

                  {/* 음소거 버튼 */}
                  <button
                    onClick={() => toggleMute(video.id)}
                    className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                  >
                    {mutedStates[video.id] ?? config?.muted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* 비디오 제목 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-semibold">{video.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    )
});

export default VideoShowcase;