import { useRef, useEffect, useState } from 'react'
import { getRegions } from '../services/petService'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

interface RegionSelectorProps {
  selectedRegion: string | undefined
  onRegionChange: (region: string | undefined) => void
}

const RegionSelector = ({ selectedRegion, onRegionChange }: RegionSelectorProps) => {
  const regions = getRegions()
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedButtonRef = useRef<HTMLButtonElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // 스크롤 상태 확인
  const checkScrollButtons = () => {
    if (!containerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // 선택된 지역이 바뀌면 해당 버튼을 컨테이너 가운데로 스크롤
  useEffect(() => {
    const container = containerRef.current
    const button = selectedButtonRef.current
    if (!container || !button) return

    const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2
    container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
  }, [selectedRegion])

  // 초기 로드 및 스크롤 이벤트 감지
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    checkScrollButtons()
    container.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)

    return () => {
      container.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [])

  const handleScroll = (direction: 'prev' | 'next') => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({
      left: direction === 'next' ? 220 : -220,
      behavior: 'smooth',
    })
  }

  return (
    <div className="mb-10  rounded-2xl pc:p-6 border-gray-100">

      <div className="flex items-center gap-3">
        {/* 왼쪽 화살표 */}
        <button
          onClick={() => handleScroll('prev')}
          disabled={!canScrollLeft}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition ${
            canScrollLeft
              ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
              : 'bg-gray-100 pointer-events-none'
          }`}
        >
          <MdChevronLeft className={`text-xl ${canScrollLeft ? 'text-dark' : 'text-gray-400'}`} />
        </button>

        {/* 스크롤 가능한 지역 버튼 컨테이너 (스크롤바 숨김) */}
        <div
          ref={containerRef}
          className="flex-1 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* 전체 버튼 */}
          <button
            ref={selectedRegion === undefined ? selectedButtonRef : null}
            onClick={() => onRegionChange(undefined)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              selectedRegion === undefined
                ? 'bg-gray-500 text-white font-bold'
                : 'bg-gray-200 text-dark hover:bg-gray-300 cursor-pointer'
            }`}
          >
            전체
          </button>

          {/* 지역별 버튼 */}
          {regions.map((region) => (
            <button
              key={region}
              ref={region === selectedRegion ? selectedButtonRef : null}
              onClick={() => onRegionChange(region)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-gray-500 text-white font-bold'
                  : 'bg-gray-200 text-dark hover:bg-gray-300 cursor-pointer'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* 오른쪽 화살표 */}
        <button
          onClick={() => handleScroll('next')}
          disabled={!canScrollRight}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition ${
            canScrollRight
              ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
              : 'bg-gray-100 pointer-events-none'
          }`}
        >
          <MdChevronRight className={`text-xl ${canScrollRight ? 'text-dark' : 'text-gray-400'}`} />
        </button>
      </div>
    </div>
  )
}

export default RegionSelector
