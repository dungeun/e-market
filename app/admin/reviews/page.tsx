'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  MoreVertical, 
  Eye,
  Filter,
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash,
  Reply,
  Flag,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Review {
  id: string
  product_id: string
  product_name: string
  user_id: string | null
  customer_name: string
  customer_email: string | null
  rating: number
  title: string
  content: string
  images: string[] | string
  helpful: number
  status: 'pending' | 'approved' | 'flagged' | 'rejected'
  verified: boolean
  reply: string | null
  reply_date: string | null
  created_at: string
  updated_at: string
}

interface ApiResponse {
  success: boolean
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    total: number
    approved: number
    pending: number
    flagged: number
    rejected: number
    verified: number
    avgRating: number
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    flagged: 0,
    rejected: 0,
    verified: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchReviews = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status !== 'all' && { status })
      })
      
      const response = await fetch(`/api/admin/reviews?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data: ApiResponse = await response.json()
      if (data.success) {
        setReviews(data.reviews)
        setStats(data.stats)
        setError(null)
      } else {
        throw new Error('API returned error')
      }
    } catch (err) {
      setError('리뷰를 불러오는데 실패했습니다.')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(currentPage, searchQuery, statusFilter)
  }, [currentPage, searchQuery, statusFilter])

  const updateReviewStatus = async (reviewId: string, status: string, reply?: string) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          status,
          ...(reply && { reply })
        })
      })
      
      if (response.ok) {
        await fetchReviews(currentPage, searchQuery, statusFilter)
        return true
      } else {
        throw new Error('Failed to update review')
      }
    } catch (err) {
      console.error('Error updating review:', err)
      return false
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchReviews(currentPage, searchQuery, statusFilter)
        return true
      } else {
        throw new Error('Failed to delete review')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      return false
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: unknown = {
      approved: { label: '승인됨', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: '검토중', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      flagged: { label: '신고됨', color: 'bg-red-100 text-red-800', icon: Flag },
      rejected: { label: '거부됨', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const handleReviewAction = async (action: string, review: Review) => {
    switch(action) {
      case 'view':
        setSelectedReview(review)
        break
      case 'approve':
        const approveSuccess = await updateReviewStatus(review.id, 'approved')
        if (approveSuccess) {
          toast.success(`리뷰 ${review.id} 승인됨`)
        } else {
          toast.error('리뷰 승인에 실패했습니다.')
        }
        break
      case 'reject':
        const rejectSuccess = await updateReviewStatus(review.id, 'rejected')
        if (rejectSuccess) {
          toast.error(`리뷰 ${review.id} 거부됨`)
        } else {
          toast.error('리뷰 거부에 실패했습니다.')
        }
        break
      case 'reply':
        setSelectedReview(review)
        break
      case 'delete':
        const deleteSuccess = await deleteReview(review.id)
        if (deleteSuccess) {
          toast.error(`리뷰 ${review.id} 삭제됨`)
        } else {
          toast.error('리뷰 삭제에 실패했습니다.')
        }
        break
      case 'flag':
        const flagSuccess = await updateReviewStatus(review.id, 'flagged')
        if (flagSuccess) {
          toast.warning(`리뷰 ${review.id} 신고 처리됨`)
        } else {
          toast.error('리뷰 신고 처리에 실패했습니다.')
        }
        break
    }
  }

  const handleReplySubmit = async () => {
    if (replyText.trim() && selectedReview) {
      const success = await updateReviewStatus(selectedReview.id, selectedReview.status, replyText.trim())
      if (success) {
        toast.success('답변이 등록되었습니다.')
        setReplyText('')
        setSelectedReview(null)
      } else {
        toast.error('답변 등록에 실패했습니다.')
      }
    }
  }

  // Convert images from JSON string to array if needed
  const normalizedReviews = reviews.map(review => ({
    ...review,
    images: typeof review.images === 'string' 
      ? JSON.parse(review.images) 
      : (Array.isArray(review.images) ? review.images : []),
    product: review.product_name,
    customer: review.customer_name,
    date: new Date(review.created_at).toLocaleDateString('ko-KR')
  }))

  const ratingDistribution = [
    { rating: 5, count: reviews.filter(r => r.rating === 5).length },
    { rating: 4, count: reviews.filter(r => r.rating === 4).length },
    { rating: 3, count: reviews.filter(r => r.rating === 3).length },
    { rating: 2, count: reviews.filter(r => r.rating === 2).length },
    { rating: 1, count: reviews.filter(r => r.rating === 1).length }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">로딩 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">리뷰 관리</h2>
          <p className="text-muted-foreground">고객 리뷰를 관리하고 답변합니다.</p>
        </div>
        <Button variant="outline" onClick={() => toast.info('리뷰 가이드라인 설정')}>
          가이드라인 설정
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 리뷰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">총 리뷰 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.avgRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">5점 만점</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">게시된 리뷰</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">검토중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">승인 대기</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">신고됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
            <p className="text-xs text-muted-foreground">확인 필요</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">인증 구매</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">구매 확인됨</p>
          </CardContent>
        </Card>
      </div>

      {/* 평점 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>평점 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium">{item.rating}점</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${(item.count / stats.total * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-10 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>리뷰 목록</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상품명, 고객명 검색..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">검토중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="flagged">신고됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>리뷰</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>평점</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>도움</TableHead>
                <TableHead>날짜</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {normalizedReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium text-sm">{review.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{review.content}</p>
                      {review.reply && (
                        <Badge variant="outline" className="mt-1">
                          <Reply className="mr-1 h-3 w-3" />
                          답변완료
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{review.product_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{review.customer_name}</span>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          인증
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell>{getStatusBadge(review.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="h-3 w-3" />
                      {review.helpful}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{review.date}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleReviewAction('view', review)}>
                          <Eye className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        {review.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleReviewAction('approve', review)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              승인
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReviewAction('reject', review)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              거부
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleReviewAction('reply', review)}>
                          <Reply className="mr-2 h-4 w-4" />
                          답변
                        </DropdownMenuItem>
                        {review.status !== 'flagged' && (
                          <DropdownMenuItem onClick={() => handleReviewAction('flag', review)}>
                            <Flag className="mr-2 h-4 w-4" />
                            신고 처리
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleReviewAction('delete', review)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* 페이지네이션 */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              전체 {stats.total}개 중 {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, stats.total)}개 표시
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <span className="text-sm">
                {currentPage} / {Math.ceil(stats.total / 10)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(stats.total / 10)}
              >
                다음
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 상세/답변 모달 */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedReview(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>리뷰 상세</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedReview(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{selectedReview.customer_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{selectedReview.customer_name}</p>
                    {selectedReview.verified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        인증 구매
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-muted-foreground">{new Date(selectedReview.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{selectedReview.title}</h3>
                  <p className="text-sm">{selectedReview.content}</p>
                  
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {selectedReview.images.map((img: string, index: number) => (
                        <div key={index} className="w-20 h-20 bg-gray-100 rounded" />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="mr-1 h-3 w-3" />
                      도움이 됨 ({selectedReview.helpful})
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      상품: {selectedReview.product_name}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReview.reply ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">판매자 답변</p>
                  <p className="text-sm">{selectedReview.reply}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">답변 작성</p>
                  <Textarea
                    placeholder="고객 리뷰에 대한 답변을 작성하세요..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleReplySubmit} className="w-full">
                    <Reply className="mr-2 h-4 w-4" />
                    답변 등록
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}