import { useState, useRef, useEffect } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import PetCard from './PetCard'
import { Pet } from '../types/pet'

interface PetCarouselProps {
  pets: Pet[]
  onDelete?: (petId: string) => void
}

const GAP_PX = 16

const getItemsPerView = (width: number) => {
  if (width < 640) return 1
  if (width < 1024) return 2
  return 3
}

const PetCarousel = ({ pets, onDelete }: PetCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const containerRef = useRef<HTMLDivElement>(null)

  const maxIndex = Math.max(0, pets.length - itemsPerView)
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < maxIndex

  // 컨테이너 실제 너비를 측정해서 카드 너비 및 itemsPerView를 픽셀로 계산
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return
      const containerW = containerRef.current.offsetWidth
      const items = getItemsPerView(containerW)
      setItemsPerView(items)
      setCardWidth((containerW - GAP_PX * (items - 1)) / items)
    }

    measure()

    const resizeObserver = new ResizeObserver(measure)
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // pets나 itemsPerView가 바뀌면 인덱스 리셋
  useEffect(() => {
    setCurrentIndex(0)
  }, [pets, itemsPerView])

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const translateX = currentIndex * (cardWidth + GAP_PX)

  if (pets.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-12 text-center">
        <p className="text-gray-600 text-lg">데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {/* 왼쪽 화살표 */}
      <button
        onClick={handlePrev}
        disabled={!canScrollLeft}
        className={`shrink-0 p-2 rounded-full transition ${
          canScrollLeft
            ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
            : 'bg-gray-100 pointer-events-none'
        }`}
      >
        <MdChevronLeft
          className={`text-2xl ${canScrollLeft ? 'text-dark' : 'text-gray-400'}`}
        />
      </button>

      {/* 카드 컨테이너 */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <div
          className="flex items-stretch transition-transform duration-300"
          style={{
            gap: `${GAP_PX}px`,
            transform: `translateX(-${translateX}px)`,
          }}
        >
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="shrink-0 flex flex-col"
              style={{ width: cardWidth > 0 ? `${cardWidth}px` : `calc((100% - ${GAP_PX * (itemsPerView - 1)}px) / ${itemsPerView})` }}
            >
              <PetCard pet={pet} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 화살표 */}
      <button
        onClick={handleNext}
        disabled={!canScrollRight}
        className={`shrink-0 p-2 rounded-full transition ${
          canScrollRight
            ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
            : 'bg-gray-100 pointer-events-none'
        }`}
      >
        <MdChevronRight
          className={`text-2xl ${canScrollRight ? 'text-dark' : 'text-gray-400'}`}
        />
      </button>
    </div>
  )
}

export default PetCarousel
