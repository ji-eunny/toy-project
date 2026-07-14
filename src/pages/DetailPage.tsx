import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { Pet } from '../types/pet'
import {
  MdArrowBack,
  MdFavoriteBorder,
  MdFavorite,
  MdShare,
  MdChevronLeft,
  MdChevronRight,
  MdLocationOn,
  MdPerson,
  MdPhone,
  MdHome,
  MdNote,
} from 'react-icons/md'
import { toggleFavorite, getFavorites } from '../services/favoriteService'
import { recordView } from '../services/recentlyViewedService'
import { analyzePetPersonality } from '../services/aiService'
import { optimizeImageUrl } from '../utils/imageUtils'
import { findPetInAllCaches } from '../utils/petCache'
import { fetchPets } from '../services/petService'

const DetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pet, setPet] = useState<Pet | null>(null)
  const [petLoading, setPetLoading] = useState(true)
  const [isFavoritedPet, setIsFavoritedPet] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState<string>('')
  const [copyToast, setCopyToast] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (!id) {
      setPetLoading(false)
      return
    }

    setPetLoading(true)

    const loadPet = async () => {
      try {
        // 1차: 모든 캐시(지역별 + 개별)에서 검색
        let found: Pet | undefined = findPetInAllCaches(id)

        // 2차: 캐시 미스 시 ID에서 SIGUN_CD 추출 후 API 조회
        if (!found) {
          const sigunCd = id.split('-')[0]
          if (sigunCd) {
            const pets = await fetchPets(1, 300, undefined)
            found = pets.find((p) => p.id === id)
          }
        }

        if (found) {
          setPet(found)
          // 개별 pet 캐시 갱신 (MyPage 조회에서 사용)
          localStorage.setItem(`pet_cache_${found.id}`, JSON.stringify(found))
          const favorites = await getFavorites()
          setIsFavoritedPet(favorites.includes(found.id))
          recordView(found.id).catch((err) => console.error('최근 본 동물 기록 실패:', err))
        }
      } catch (e) {
        console.error('동물 정보 조회 실패:', e)
      } finally {
        setPetLoading(false)
      }
    }

    loadPet()
  }, [id])

  const handleShare = async () => {
    const url = window.location.href
    const title = pet ? `${pet.breed} - 입양을 기다리고 있어요!` : 'Petmily'
    const text = pet
      ? `${pet.breed} (${pet.age}, ${pet.gender}) | ${pet.shelterName}`
      : ''

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // 사용자가 취소한 경우 무시
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2000)
    }
  }

  const handleAnalyzeClick = async () => {
    if (!pet) return

    try {
      setLoadingAI(true)
      setAiError('')
      const analysis = await analyzePetPersonality({
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        specialFeatures: pet.specialFeatures,
        particularMatters: pet.particularMatters,
        personality: pet.personality,
      })
      setAiAnalysis(analysis)
    } catch (error) {
      const message = error instanceof Error ? error.message : '분석에 실패했습니다.'
      setAiError(message)
    } finally {
      setLoadingAI(false)
    }
  }

  if (petLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">동물 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">동물 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }


  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* 링크 복사 토스트 */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg transition-all duration-300 ${
          copyToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        링크가 복사되었습니다!
      </div>

      <main className="flex-1 px-6 pc:py-12 py-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-dark hover:text-primary transition"
            >
              <MdArrowBack className="text-2xl" />
              <span className="font-semibold">목록으로 돌아가기</span>
            </button>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  if (pet) {
                    try {
                      const newFavorite = await toggleFavorite(pet.id, isFavoritedPet)
                      setIsFavoritedPet(newFavorite)
                    } catch (error) {
                      console.error('찜 토글 실패:', error)
                    }
                  }
                }}
                className="p-3 hover:bg-gray-100 rounded-full transition"
              >
                {isFavoritedPet ? (
                  <MdFavorite className="text-2xl text-red-500" />
                ) : (
                  <MdFavoriteBorder className="text-2xl text-dark" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-3 hover:bg-gray-100 rounded-full transition"
              >
                <MdShare className="text-2xl text-dark" />
              </button>
            </div>
          </div>

          {/* 컨텐츠 */}
          <div className="bg-transparent md:bg-white rounded-3xl shadow-none md:shadow-lg md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* 이미지 섹션 */}
              <div>
                <div className="relative h-80 bg-gray-200 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                  {pet.images && pet.images.length > 0 && pet.images[currentImageIndex] && !imageError ? (
                    <img
                      src={optimizeImageUrl(pet.images[currentImageIndex], 600, 480)}
                      alt={pet.breed}
                      className="w-full h-full object-cover"
                      width={600}
                      height={480}
                      onError={() => {
                        setImageError(true)
                      }}
                    />
                  ) : (
                    <p className="text-gray-400 text-lg font-semibold">No Image</p>
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
                  {pet.images && pet.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? pet.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition"
                      >
                        <MdChevronLeft className="text-2xl text-dark" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === pet.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition"
                      >
                        <MdChevronRight className="text-2xl text-dark" />
                      </button>
                    </>
                  )}
                </div>

                {/* 썸네일 */}
                {pet.images && pet.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {pet.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentImageIndex(idx)
                          setImageError(false)
                        }}
                        className={`h-20 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                          currentImageIndex === idx ? 'border-primary' : 'border-gray-300'
                        }`}
                      >
                        <img
                          src={optimizeImageUrl(img, 80, 80)}
                          alt=""
                          className="w-full h-full object-cover"
                          width={80}
                          height={80}
                        />
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

                {/* 기본 정보 - 배지 형식 */}
                <div className="flex flex-wrap gap-2">
                  <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-bold">
                    {pet.gender}
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                    {pet.age}
                  </div>
                  <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                    {pet.weight}
                  </div>
                  <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
                    {pet.color}
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3">
                    <MdPerson className="text-xl text-gray-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-semibold">중성화</p>
                      <p className="text-dark font-semibold">{pet.neutered}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MdLocationOn className="text-xl text-gray-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-semibold">발견장소</p>
                      <p className="text-dark font-semibold">{pet.discoveryLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MdNote className="text-xl text-gray-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-semibold">특징정보</p>
                      <p className="text-dark font-semibold">{pet.specialFeatures}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MdNote className="text-xl text-gray-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-semibold">특이사항</p>
                      <p className="text-dark font-semibold">{pet.particularMatters}</p>
                    </div>
                  </div>


                  <div className="flex items-center gap-3">
                    <MdHome className="text-xl text-gray-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-semibold">보호소</p>
                      <p className="text-dark font-semibold">{pet.shelterName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MdPhone className="text-xl text-gray-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-semibold">연락처</p>
                      <p className="text-dark font-semibold">{pet.shelterPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MdLocationOn className="text-xl text-gray-400 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-500 text-xs font-semibold">보호소주소</p>
                      <p className="text-dark font-semibold">{pet.shelterAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 성격 - AI 분석 */}
            <div className="bg-white border border-gray-200 shadow-sm md:bg-gray-50 md:border-0 md:shadow-none rounded-2xl md:p-6 p-4 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-dark">성격</h3>
                <button
                  onClick={handleAnalyzeClick}
                  disabled={loadingAI}
                  className="text-xs px-3 py-1 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition hover:cursor-pointer underline"
                >
                  {loadingAI ? '분석 중...' : 'AI 성격 분석'}
                </button>
              </div>
              {!aiAnalysis && <p>특징, 특이사항 등에 따른 AI 성격 분석을 받아보세요!</p>}

              {loadingAI ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                  <p className="text-gray-600">분석 중...</p>
                </div>
              ) : aiError ? (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold mb-1">분석 오류</p>
                  <p className="text-sm">{aiError}</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-3">
                  <div className="">
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">🐶</div>
                      <div className="flex-1">
                        <p className="text-dark text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="">
                  <p className="text-sm">{pet.personality}</p>
                </div>
              )}
            </div>

            {/* 보호소 정보 */}
            <div className="bg-white border border-gray-200 shadow-sm md:bg-gray-50 md:border-0 md:shadow-none rounded-2xl md:p-6 p-4 mb-8">
              <h3 className="text-lg font-bold text-dark mb-4">보호소 정보</h3>
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default DetailPage
