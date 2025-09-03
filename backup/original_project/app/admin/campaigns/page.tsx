'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Copy,
  Pause,
  Play
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import CampaignCreateModal from '@/components/admin/CampaignCreateModal'
import CampaignDetailPanel from '@/components/admin/CampaignDetailPanel'

const campaigns = [
  {
    id: '1',
    name: '봄맞이 세일',
    type: 'discount',
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    discount: '20%',
    targetAudience: '전체 고객',
    budget: '₩5,000,000',
    spent: '₩2,345,000',
    conversions: 234,
    revenue: '₩12,345,000',
    roi: '426%',
    image: '/placeholder.svg'
  },
  {
    id: '2',
    name: '신규 고객 환영',
    type: 'welcome',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    discount: '10%',
    targetAudience: '신규 가입자',
    budget: '₩3,000,000',
    spent: '₩1,567,000',
    conversions: 567,
    revenue: '₩8,901,000',
    roi: '468%',
    image: '/placeholder.svg'
  },
  {
    id: '3',
    name: '여름 특가전',
    type: 'seasonal',
    status: 'scheduled',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    discount: '30%',
    targetAudience: 'VIP 고객',
    budget: '₩10,000,000',
    spent: '₩0',
    conversions: 0,
    revenue: '₩0',
    roi: '0%',
    image: '/placeholder.svg'
  },
  {
    id: '4',
    name: '블랙 프라이데이',
    type: 'flash',
    status: 'completed',
    startDate: '2023-11-24',
    endDate: '2023-11-27',
    discount: '50%',
    targetAudience: '전체 고객',
    budget: '₩20,000,000',
    spent: '₩18,500,000',
    conversions: 1234,
    revenue: '₩45,678,000',
    roi: '147%',
    image: '/placeholder.svg'
  },
  {
    id: '5',
    name: '재구매 촉진',
    type: 'retention',
    status: 'paused',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    discount: '15%',
    targetAudience: '기존 고객',
    budget: '₩2,000,000',
    spent: '₩890,000',
    conversions: 89,
    revenue: '₩3,456,000',
    roi: '288%',
    image: '/placeholder.svg'
  }
]

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<unknown>(null)

  const handleAction = (action: string, campaign: unknown) => {
    switch(action) {
      case 'view':
        setSelectedCampaign(campaign)
        break
      case 'edit':
        toast.info(`${campaign.name} 수정 페이지로 이동`)
        break
      case 'duplicate':
        toast.success(`${campaign.name} 복제 완료`)
        break
      case 'pause':
        toast.success(`${campaign.name} 일시 중지`)
        break
      case 'resume':
        toast.success(`${campaign.name} 재개`)
        break
      case 'delete':
        toast.success(`${campaign.name} 삭제 완료`)
        break
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">진행중</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">예정</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">완료</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">일시중지</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeLabels: unknown = {
      discount: '할인',
      welcome: '환영',
      seasonal: '시즌',
      flash: '플래시',
      retention: '재구매'
    }
    return typeLabels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">캠페인 관리</h2>
          <p className="text-muted-foreground">마케팅 캠페인을 생성하고 관리합니다.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 캠페인 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              활성 캠페인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">현재 진행 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              총 전환
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">모든 캠페인</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              총 매출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{(campaigns.reduce((sum, c) => {
                const revenue = parseInt(c.revenue.replace(/[^0-9]/g, ''))
                return sum + revenue
              }, 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">캠페인 기여</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              평균 ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(campaigns.reduce((sum, c) => {
                const roi = parseInt(c.roi.replace('%', ''))
                return sum + roi
              }, 0) / campaigns.length)}%
            </div>
            <p className="text-xs text-muted-foreground">투자 대비 수익</p>
          </CardContent>
        </Card>
      </div>

      {/* 캠페인 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>캠페인 목록</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="캠페인 검색..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>캠페인</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>기간</TableHead>
                <TableHead>할인</TableHead>
                <TableHead>예산</TableHead>
                <TableHead>전환</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={campaign.image}
                          alt={campaign.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">{campaign.targetAudience}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeBadge(campaign.type)}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{campaign.startDate}</p>
                      <p className="text-muted-foreground">~ {campaign.endDate}</p>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.discount}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{campaign.spent}</p>
                      <p className="text-muted-foreground">/ {campaign.budget}</p>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.conversions.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={parseInt(campaign.roi) > 100 ? 'text-green-600 font-medium' : ''}>
                      {campaign.roi}
                    </span>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleAction('view', campaign)}>
                          <Eye className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('edit', campaign)}>
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('duplicate', campaign)}>
                          <Copy className="mr-2 h-4 w-4" />
                          복제
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleAction('pause', campaign)}>
                            <Pause className="mr-2 h-4 w-4" />
                            일시 중지
                          </DropdownMenuItem>
                        ) : campaign.status === 'paused' ? (
                          <DropdownMenuItem onClick={() => handleAction('resume', campaign)}>
                            <Play className="mr-2 h-4 w-4" />
                            재개
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem 
                          onClick={() => handleAction('delete', campaign)}
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

      {/* 캠페인 생성 모달 */}
      {isCreateModalOpen && (
        <CampaignCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* 캠페인 상세 패널 */}
      {selectedCampaign && (
        <CampaignDetailPanel
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  )
}