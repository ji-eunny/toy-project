import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pet } from '../types/pet'
import { optimizeImageUrl } from '../utils/imageUtils'
import { MdClose } from 'react-icons/md'

interface PetCardProps {
  pet: Pet
  onDelete?: (petId: string) => void
}

const PetCard = ({ pet, onDelete }: PetCardProps) => {
  const [imageError, setImageError] = useState(false)
  const navigate = useNavigate()

  return (
    <div
      onClick={() => {
        if (pet.status !== '보호중') return
        // 클릭 시 개별 캐시 저장 → DetailPage 즉시 로드 보장
        try {
          localStorage.setItem(`pet_cache_${pet.id}`, JSON.stringify(pet))
        } catch {
          // localStorage 용량 초과 시 무시
        }
        navigate(`/pet/${pet.id}`)
      }}
      className={`bg-white rounded-2xl overflow-hidden w-full h-full flex flex-col border border-gray-100 ${
        pet.status === '보호중'
          ? 'cursor-pointer transition-all duration-300'
          : 'opacity-60 cursor-default'
      }`}
    >
      {/* 이미지 */}
      <div
        className={`relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center ${
          pet.status !== '보호중' ? 'grayscale' : ''
        }`}
      >
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(pet.id)
            }}
            className="absolute top-3 right-3 p-2 bg-gray-500 hover:bg-gray-600 rounded-full text-white transition z-10"
            title="삭제"
          >
            <MdClose className="text-xl" />
          </button>
        )}
        {pet.image && !imageError ? (
          <img
            src={optimizeImageUrl(pet.image, 400, 320)}
            alt={pet.name}
            className="w-full h-full object-cover hover:scale-105 transition"
            loading="lazy"
            width={400}
            height={320}
            onError={() => {
              setImageError(true)
            }}
          />
        ) : null}
        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-2">🐾</p>
              <p className="text-gray-600 text-sm font-medium">이미지 없음</p>
            </div>
          </div>
        ) : null}
        {!pet.image && !imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-2">🐾</p>
              <p className="text-gray-600 text-sm font-medium">이미지 없음</p>
            </div>
          </div>
        ) : null}

        {/* 상태 배지 */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-lg font-semibold text-xs ${
            pet.status === '보호중' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {pet.status}
        </div>
      </div>

      {/* 정보 섹션 */}
      <div className="p-4 flex flex-col flex-1 items-center justify-center">
        {/* 견종 */}
        <div className="text-center mb-3">
          <p className="text-gray-400 text-xs font-semibold mb-1">견종</p>
          <p className="text-dark font-bold text-lg">{pet.breed}</p>
        </div>

        {/* 나이, 성별 */}
        <div className="flex gap-8 justify-center mb-3 text-center">
          <div>
            <p className="text-gray-400 text-xs font-semibold mb-1">나이</p>
            <p className="text-dark font-bold text-sm">{pet.age}</p>
          </div>
          <div className="border-l border-gray-200"></div>
          <div>
            <p className="text-gray-400 text-xs font-semibold mb-1">성별</p>
            <p className="text-dark font-bold text-sm">{pet.gender}</p>
          </div>
        </div>

        {/* 보호소 */}
        <div className="text-center">
          <p className="text-gray-400 text-xs font-semibold mb-1">보호소</p>
          <p className="text-dark font-bold text-xs truncate px-2 max-w-xs">{pet.shelterName}</p>
        </div>
      </div>
    </div>
  )
}

export default PetCard
