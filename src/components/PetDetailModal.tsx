import { useState } from 'react'
import { Pet } from '../types/pet'
import { MdClose, MdArrowBack, MdChevronLeft, MdChevronRight } from 'react-icons/md'

interface PetDetailModalProps {
  pet: Pet
  isOpen: boolean
  onClose: () => void
}

const PetDetailModal = ({ pet, isOpen, onClose }: PetDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen) return null

  const images = [pet.image].filter((img) => img)

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <MdArrowBack className="text-2xl text-dark" />
            </button>
            <h2 className="text-xl font-bold text-dark">상세정보</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <MdClose className="text-2xl text-dark" />
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* 이미지 섹션 */}
              <div>
                <div className="relative h-80 bg-gray-200 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                  {pet.image && images.length > 0 ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">사진 없음</p>
                  )}

                  {/* 상태 배지 */}
                  <div
                    className={`absolute top-4 left-4 px-4 py-2 rounded-full font-bold text-white text-sm ${
                      pet.status === '보호중' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {pet.status}
                  </div>

                  {/* 화살표 */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition"
                      >
                        <MdChevronLeft className="text-2xl text-dark" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition"
                      >
                        <MdChevronRight className="text-2xl text-dark" />
                      </button>
                    </>
                  )}
                </div>

                {/* 썸네일 */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                          currentImageIndex === idx ? 'border-primary' : 'border-gray-300'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 정보 섹션 */}
              <div className="space-y-6">
                {/* 이름 */}
                <div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">품종</p>
                  <h1 className="text-4xl font-bold text-dark">{pet.breed}</h1>
                </div>

                {/* 기본 정보 */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold mb-1">여기(f)</p>
                    <p className="text-dark font-bold">{pet.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold mb-1">성별</p>
                    <p className="text-dark font-bold">{pet.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold mb-1">무게</p>
                    <p className="text-dark font-bold">미상</p>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500">📍</span>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">발견장소</p>
                      <p className="text-dark font-semibold">{pet.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-gray-500">🆔</span>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">공고번호</p>
                      <p className="text-dark font-semibold">{pet.noticeNo}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-gray-500">🏥</span>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">보호소</p>
                      <p className="text-dark font-semibold">{pet.shelterName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-gray-500">📞</span>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">연락처</p>
                      <p className="text-dark font-semibold">{pet.shelterPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-gray-500">📅</span>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold">공고기간</p>
                      <p className="text-dark font-semibold">{pet.receivedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI 설명 섹션 */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <h3 className="text-lg font-bold text-dark">AI 성격 요약</h3>
              </div>
              <p className="text-dark text-sm leading-relaxed">{pet.personality}</p>
            </div>

            {/* 채택 관심도 섹션 */}
            <div className="bg-yellow-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⭐</span>
                <h3 className="text-lg font-bold text-dark">입양 추천 지수</h3>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-3xl">
                    ⭐
                  </span>
                ))}
              </div>
              <button className="w-full mt-4 px-6 py-3 bg-white border-2 border-dark text-dark rounded-full font-bold hover:bg-gray-50 transition">
                ❤️ 입양 추천 다시 보기
              </button>
            </div>

            {/* 보호소 정보 */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-dark mb-4">🏥 보호소 정보</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">보호소명</p>
                  <p className="text-dark font-semibold">{pet.shelterName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">주소</p>
                  <p className="text-dark font-semibold">{pet.shelterAddress}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">연락처</p>
                  <p className="text-dark font-semibold">{pet.shelterPhone}</p>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 mt-8">
              <button className="flex-1 px-6 py-4 bg-white border-2 border-dark text-dark rounded-full font-bold hover:bg-gray-50 transition">
                ❤️ 찜하기
              </button>
              <button className="flex-1 px-6 py-4 bg-primary text-white rounded-full font-bold hover:opacity-90 transition">
                💬 입양 문의하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PetDetailModal
