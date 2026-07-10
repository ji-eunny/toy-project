import { supabase } from './supabaseClient'

export const getFavorites = async (): Promise<string[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('favorites')
    .select('pet_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('찜 목록 조회 실패:', error)
    return []
  }

  return data?.map((fav) => fav.pet_id) || []
}

export const addFavorite = async (petId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    pet_id: petId,
  })

  if (error) {
    if (error.code === '23505') {
      console.log('이미 찜한 동물입니다.')
      return
    }
    console.error('찜 추가 실패:', error)
    throw error
  }
}

export const removeFavorite = async (petId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('pet_id', petId)

  if (error) {
    console.error('찜 제거 실패:', error)
    throw error
  }
}

export const toggleFavorite = async (
  petId: string,
  currentlyFavorited: boolean
): Promise<boolean> => {
  if (currentlyFavorited) {
    await removeFavorite(petId)
    return false
  } else {
    await addFavorite(petId)
    return true
  }
}
