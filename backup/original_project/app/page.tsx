import { SectionService } from '@/lib/services/sections/section-service'
import DynamicSection from '@/components/sections/DynamicSection'
import { cookies } from 'next/headers'

async function getUserId() {
  // 쿠키에서 사용자 ID 가져오기 (실제 구현 필요)
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  // TODO: JWT 디코드하여 userId 추출
  return null
}

export default async function HomePage() {
  // 활성화된 섹션 가져오기
  const sections = await SectionService.getActiveSections()
  const userId = await getUserId()

  // 각 섹션별 데이터 로드
  const sectionsWithData = await Promise.all(
    sections.map(async (section) => {
      const data = await SectionService.getSectionData(section, userId || undefined)
      return { section, data }
    })
  )

  return (
    <div className="min-h-screen bg-white">
      {/* 동적 섹션 렌더링 */}
      <div className="flex flex-col">
        {sectionsWithData.map(({ section, data }) => (
          <DynamicSection 
            key={section.id} 
            section={section} 
            data={data}
          />
        ))}
      </div>
    </div>
  )
}