import { useState, useEffect } from 'react'
import { MdPerson, MdEmail } from 'react-icons/md'
import Header from '../components/Header'
import PetCarousel from '../components/PetCarousel'
import { Pet } from '../types/pet'
import { useAuth } from '../contexts/AuthContext'
import { getFavorites, removeFavorite } from '../services/favoriteService'
import { getRecentlyViewed, removeRecentlyViewed } from '../services/recentlyViewedService'

const MyPage = () => {
  const { user } = useAuth()
  const [favoritePetIds, setFavoritePetIds] = useState<string[]>([])
  const [recentPetIds, setRecentPetIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [favs, recents] = await Promise.all([getFavorites(), getRecentlyViewed(20)])
        setFavoritePetIds(favs)
        setRecentPetIds(recents)
      } catch (error) {
        console.error('마이페이지 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const allPets: Pet[] = JSON.parse(localStorage.getItem('allPets') || '[]')

  const resolvePet = (id: string): Pet | undefined => {
    // 1차: 현재 세션의 allPets에서 찾기
    const fromAll = allPets.find((p) => p.id === id)
    if (fromAll) return fromAll

    // 2차: 상세 페이지 방문 시 저장된 개별 캐시에서 찾기
    try {
      const cached = localStorage.getItem(`pet_cache_${id}`)
      if (cached) return JSON.parse(cached) as Pet
    } catch {
      // 캐시 파싱 실패 시 무시
    }
    return undefined
  }

  const favoritePets = favoritePetIds.map(resolvePet).filter((p): p is Pet => !!p)
  const recentPets = recentPetIds.map(resolvePet).filter((p): p is Pet => !!p)

  const handleRemoveFavorite = async (petId: string) => {
    try {
      await removeFavorite(petId)
      setFavoritePetIds(favoritePetIds.filter((id) => id !== petId))
    } catch (error) {
      console.error('찜 제거 실패:', error)
    }
  }

  const handleRemoveRecentlyViewed = async (petId: string) => {
    try {
      await removeRecentlyViewed(petId)
      setRecentPetIds(recentPetIds.filter((id) => id !== petId))
    } catch (error) {
      console.error('최근 본 동물 제거 실패:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 내 정보 섹션 */}
          <div className="bg-white rounded-3xl border border-gray-100 mb-8 p-6 sm:p-8">
            <div className="flex items-center gap-5 mb-6">
              {/* 아바타 */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-2xl sm:text-3xl">🐾</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-0.5">내 정보</p>
                <p className="text-dark font-bold text-xl">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 flex-1">
                <MdPerson className="text-gray-400 text-xl shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs font-semibold mb-0.5">이름</p>
                  <p className="text-dark font-semibold text-sm">
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 flex-1">
                <MdEmail className="text-gray-400 text-xl shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs font-semibold mb-0.5">이메일</p>
                  <p className="text-dark font-semibold text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 찜한 동물 섹션 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-dark">찜한 동물</h2>
              <span className="bg-primary/10 text-primary text-lg font-bold px-3 py-0.5 rounded-full">
                {favoritePets.length}
              </span>
            </div>
            {favoritePets.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <p className="text-gray-600 text-lg">아직 찜한 동물이 없습니다.</p>
              </div>
            ) : (
              <PetCarousel pets={favoritePets} onDelete={handleRemoveFavorite} />
            )}
          </div>

          {/* 최근 본 동물 섹션 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-dark">최근 본 동물</h2>
              <span className="bg-primary/10 text-primary text-lg font-bold px-3 py-0.5 rounded-full">
                {recentPets.length}
              </span>
            </div>
            {recentPets.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <p className="text-gray-600 text-lg">최근 본 동물이 없습니다.</p>
              </div>
            ) : (
              <PetCarousel pets={recentPets} onDelete={handleRemoveRecentlyViewed} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default MyPage
