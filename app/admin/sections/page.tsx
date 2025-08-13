'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { 
  HomeSection, 
  SectionType,
  createDefaultSectionConfig 
} from '@/lib/config/home-sections'
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings, 
  Trash2, 
  Plus,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/sections')
      const data = await response.json()
      setSections(data)
    } catch (error) {
      toast.error('섹션 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // 순서 업데이트
    const updatedSections = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))

    setSections(updatedSections)
  }

  const toggleSectionEnabled = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !section.enabled })
      })

      if (response.ok) {
        setSections(sections.map(s => 
          s.id === sectionId 
            ? { ...s, enabled: !s.enabled }
            : s
        ))
        toast.success('섹션 상태 업데이트 완료')
      }
    } catch (error) {
      toast.error('섹션 상태 변경 실패')
    }
  }

  const saveOrder = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/sections/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sectionIds: sections.map(s => s.id) 
        })
      })

      if (response.ok) {
        toast.success('섹션 순서 저장 완료')
      }
    } catch (error) {
      toast.error('순서 저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSections(sections.filter(s => s.id !== sectionId))
        toast.success('섹션 삭제 완료')
      }
    } catch (error) {
      toast.error('섹션 삭제 실패')
    }
  }

  const addNewSection = () => {
    const newSection: HomeSection = {
      id: `new-${Date.now()}`,
      name: '새 섹션',
      type: SectionType.FEATURED_PRODUCTS,
      enabled: false,
      order: sections.length + 1,
      config: createDefaultSectionConfig(SectionType.FEATURED_PRODUCTS)
    }
    setSections([...sections, newSection])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">섹션 로딩중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">홈페이지 섹션 관리</h1>
            <p className="text-gray-600 mt-2">
              드래그 앤 드롭으로 섹션 순서를 변경하고 표시 여부를 설정하세요
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={addNewSection} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              섹션 추가
            </Button>
            <Button onClick={saveOrder} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? '저장중...' : '순서 저장'}
            </Button>
          </div>
        </div>

        {/* 섹션 리스트 */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {sections.map((section, index) => (
                  <Draggable 
                    key={section.id} 
                    draggableId={section.id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-lg shadow-sm border ${
                          snapshot.isDragging ? 'shadow-lg border-blue-500' : 'border-gray-200'
                        } ${!section.enabled ? 'opacity-60' : ''}`}
                      >
                        <div className="p-4 flex items-center justify-between">
                          {/* 드래그 핸들 */}
                          <div 
                            {...provided.dragHandleProps}
                            className="cursor-move"
                          >
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>

                          {/* 섹션 정보 */}
                          <div className="flex-1 ml-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                              <h3 className="font-semibold text-gray-900">
                                {section.name}
                              </h3>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {section.type}
                              </span>
                            </div>
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSectionEnabled(section.id)}
                              className={`p-2 rounded hover:bg-gray-100 ${
                                section.enabled ? 'text-green-600' : 'text-gray-400'
                              }`}
                              title={section.enabled ? '표시됨' : '숨김'}
                            >
                              {section.enabled ? (
                                <Eye className="w-5 h-5" />
                              ) : (
                                <EyeOff className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={() => setEditingSection(section.id)}
                              className="p-2 rounded hover:bg-gray-100 text-gray-600"
                              title="설정"
                            >
                              <Settings className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => deleteSection(section.id)}
                              className="p-2 rounded hover:bg-gray-100 text-red-600"
                              title="삭제"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* 설정 패널 (확장 가능) */}
                        {editingSection === section.id && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  섹션 이름
                                </label>
                                <input
                                  type="text"
                                  value={section.name}
                                  onChange={(e) => {
                                    setSections(sections.map(s =>
                                      s.id === section.id
                                        ? { ...s, name: e.target.value }
                                        : s
                                    ))
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  섹션 타입
                                </label>
                                <select
                                  value={section.type}
                                  onChange={(e) => {
                                    const newType = e.target.value as SectionType
                                    setSections(sections.map(s =>
                                      s.id === section.id
                                        ? { 
                                            ...s, 
                                            type: newType,
                                            config: createDefaultSectionConfig(newType)
                                          }
                                        : s
                                    ))
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {Object.values(SectionType).map(type => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSection(null)}
                                >
                                  취소
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/admin/sections/${section.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(section)
                                      })

                                      if (response.ok) {
                                        toast.success('섹션 설정 저장 완료')
                                        setEditingSection(null)
                                      }
                                    } catch (error) {
                                      toast.error('섹션 설정 저장 실패')
                                    }
                                  }}
                                >
                                  저장
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* 미리보기 링크 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 변경사항을 저장한 후{' '}
            <a 
              href="/" 
              target="_blank" 
              className="font-semibold underline hover:text-blue-900"
            >
              홈페이지 미리보기
            </a>
            에서 확인하세요
          </p>
        </div>
      </div>
    </div>
  )
}