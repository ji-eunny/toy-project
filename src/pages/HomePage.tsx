import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PetCard from '../components/PetCard'
import Header from '../components/Header'
import RegionSelector from '../components/RegionSelector'
import StatusSelect from '../components/StatusSelect'
import { fetchPets, fetchPetsStream } from '../services/petService'
import { Pet } from '../types/pet'
import { getFromCache, setToCache } from '../utils/petCache'

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allPets, setAllPets] = useState<Pet[]>([])
  const [displayCount, setDisplayCount] = useState(20)
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    searchParams.get('region') || undefined
  )
  const [statusFilter, setStatusFilter] = useState<'all' | 'protected' | 'ended'>(
    (searchParams.get('status') as 'all' | 'protected' | 'ended') || 'all'
  )
  const [loading, setLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // pets는 allPets + statusFilter + displayCount에서 직접 파생 (별도 상태 없음 → 필터 버그 원천 차단)
  const filteredPets = useMemo(() => {
    return allPets.filter((pet) => {
      if (statusFilter === 'protected') return pet.status === '보호중'
      if (statusFilter === 'ended') return pet.status !== '보호중'
      return true
    })
  }, [allPets, statusFilter])

  const displayedPets = useMemo(() => filteredPets.slice(0, displayCount), [filteredPets, displayCount])

  // URL QueryString 변경 감지
  useEffect(() => {
    const region = searchParams.get('region') || undefined
    const status = (searchParams.get('status') as 'all' | 'protected' | 'ended') || 'all'

    if (region !== selectedRegion) setSelectedRegion(region)
    if (status !== statusFilter) setStatusFilter(status)
  }, [searchParams])

  // 지역 변경 시 데이터 로드
  useEffect(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    const loadPets = async () => {
      // 캐시 확인 (전체: 영구 / 지역별: 30분)
      const cached = getFromCache(selectedRegion)
      if (cached) {
        if (signal.aborted) return
        setAllPets(cached)
        setDisplayCount(20)
        setLoading(false)
        setIsStreaming(false)
        return
      }

      setLoading(true)
      setIsStreaming(false)
      setDisplayCount(20)

      // 전체 조회: 스트리밍 방식 (배치마다 즉시 표시 + 항상 캐시 저장)
      if (!selectedRegion) {
        setLoading(false)
        setIsStreaming(true)

        await fetchPetsStream((batchedPets) => {
          // abort 여부와 무관하게 캐시 저장 → 중간 이탈해도 다음 방문 즉시 로드
          setToCache(batchedPets, undefined)
          if (signal.aborted) return
          setAllPets(batchedPets)
        }, signal)

        if (!signal.aborted) setIsStreaming(false)
        return
      }

      // 특정 지역
      const data = await fetchPets(1, 300, selectedRegion)
      if (signal.aborted) return

      setToCache(data, selectedRegion)
      setAllPets(data)
      setLoading(false)
    }

    loadPets()
  }, [selectedRegion])

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 20)
  }

  const handleRegionChange = (region: string | undefined) => {
    setSelectedRegion(region)
    setDisplayCount(20)
    if (region) {
      setSearchParams({ region, status: statusFilter })
    } else {
      setSearchParams({ status: statusFilter })
    }
  }

  const handleStatusFilter = (filter: 'all' | 'protected' | 'ended') => {
    setStatusFilter(filter)
    setDisplayCount(20)
    if (selectedRegion) {
      setSearchParams({ region: selectedRegion, status: filter })
    } else {
      setSearchParams({ status: filter })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* 지역 선택 및 필터 */}
          <div className="flex flex-col mb-8 items-end">
            <div className="w-full">
              <RegionSelector selectedRegion={selectedRegion} onRegionChange={handleRegionChange} />
            </div>
            <StatusSelect value={statusFilter} onChange={handleStatusFilter} />
          </div>

          {/* 초기 로딩 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">유기동물 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : displayedPets.length === 0 && !isStreaming ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">해당 지역의 유기동물 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="w-full">
              {/* 스트리밍 진행 배너 */}
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary shrink-0"></div>
                  <span>전체 지역 불러오는 중... ({allPets.length}마리)</span>
                </div>
              )}

              {/* 동물 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {displayedPets.map((pet) => (
                  <div key={pet.id} className="flex justify-center">
                    <PetCard pet={pet} />
                  </div>
                ))}
              </div>

              {/* 더보기 버튼 */}
              {!isStreaming && displayCount < filteredPets.length && (
                <div className="flex justify-center mt-4 mb-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-10 py-4 text-white bg-gray-500 rounded-full font-bold text-base hover:cursor-pointer"
                  >
                    더보기 ({displayCount} / {filteredPets.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default HomePage
