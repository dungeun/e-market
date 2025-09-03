'use client'

import { useState } from 'react'
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

const reviews = [
  {
    id: 'REV-001',
    product: '무선 이어폰 Pro',
    productId: 'PRD-001',
    customer: '김철수',
    customerId: 'CUST-001',
    rating: 5,
    title: '정말 만족스러운 제품입니다',
    content: '음질이 정말 좋고 노이즈 캔슬링 기능도 훌륭합니다. 배터리 수명도 길어서 하루 종일 사용해도 문제없네요.',
    images: [],
    helpful: 23,
    status: 'approved',
    verified: true,
    date: '2024-01-14',
    reply: null
  },
  {
    id: 'REV-002',
    product: '스마트 워치 Series 5',
    productId: 'PRD-002',
    customer: '이영희',
    customerId: 'CUST-002',
    rating: 4,
    title: '대체로 만족합니다',
    content: '기능은 다양하고 좋은데 배터리가 생각보다 빨리 닳아요. 그래도 운동할 때 유용하게 쓰고 있습니다.',
    images: ['/placeholder.svg'],
    helpful: 15,
    status: 'approved',
    verified: true,
    date: '2024-01-13',
    reply: '소중한 리뷰 감사합니다. 배터리 관련 피드백은 다음 제품 개선에 반영하겠습니다.'
  },
  {
    id: 'REV-003',
    product: '노트북 스탠드',
    productId: 'PRD-003',
    customer: '박민수',
    customerId: 'CUST-003',
    rating: 2,
    title: '기대에 못 미치네요',
    content: '플라스틱 재질이 약해서 무거운 노트북은 올려놓기 불안합니다. 가격 대비 품질이 아쉬워요.',
    images: [],
    helpful: 8,
    status: 'pending',
    verified: false,
    date: '2024-01-12',
    reply: null
  },
  {
    id: 'REV-004',
    product: 'USB-C 허브',
    productId: 'PRD-004',
    customer: '정수진',
    customerId: 'CUST-004',
    rating: 5,
    title: '필수 아이템!',
    content: '맥북 사용자라면 꼭 필요한 제품입니다. 포트도 다양하고 발열도 없어서 좋아요.',
    images: [],
    helpful: 34,
    status: 'approved',
    verified: true,
    date: '2024-01-11',
    reply: null
  },
  {
    id: 'REV-005',
    product: '블루투스 키보드',
    productId: 'PRD-005',
    customer: '최동현',
    customerId: 'CUST-005',
    rating: 1,
    title: '불량 제품인 것 같습니다',
    content: '연결이 자꾸 끊기고 키 입력도 제대로 안 됩니다. 환불 요청합니다.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    helpful: 2,
    status: 'flagged',
    verified: true,
    date: '2024-01-10',
    reply: null
  }
]

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [replyText, setReplyText] = useState('')

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
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

  const handleReviewAction = (action: string, review: any) => {
    switch(action) {
      case 'view':
        setSelectedReview(review)
        break
      case 'approve':
        toast.success(`리뷰 ${review.id} 승인됨`)
        break
      case 'reject':
        toast.error(`리뷰 ${review.id} 거부됨`)
        break
      case 'reply':
        setSelectedReview(review)
        break
      case 'delete':
        toast.error(`리뷰 ${review.id} 삭제됨`)
        break
      case 'flag':
        toast.warning(`리뷰 ${review.id} 신고 처리됨`)
        break
    }
  }

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      toast.success('답변이 등록되었습니다.')
      setReplyText('')
      setSelectedReview(null)
    }
  }

  const stats = {
    total: reviews.length,
    average: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    flagged: reviews.filter(r => r.status === 'flagged').length,
    verified: reviews.filter(r => r.verified).length
  }

  const ratingDistribution = [
    { rating: 5, count: reviews.filter(r => r.rating === 5).length },
    { rating: 4, count: reviews.filter(r => r.rating === 4).length },
    { rating: 3, count: reviews.filter(r => r.rating === 3).length },
    { rating: 2, count: reviews.filter(r => r.rating === 2).length },
    { rating: 1, count: reviews.filter(r => r.rating === 1).length }
  ]

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
              {stats.average}
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
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
              {reviews.map((review) => (
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
                  <TableCell className="text-sm">{review.product}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{review.customer}</span>
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
                  <AvatarFallback>{selectedReview.customer[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{selectedReview.customer}</p>
                    {selectedReview.verified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        인증 구매
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-muted-foreground">{selectedReview.date}</span>
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
                      상품: {selectedReview.product}
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