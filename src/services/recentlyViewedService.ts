import { supabase } from './supabaseClient'

export const recordView = async (petId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  try {
    const now = new Date().toISOString()
    // upsert를 사용해서 중복 저장 방지
    const { error } = await supabase.from('recently_viewed').upsert(
      {
        user_id: user.id,
        pet_id: petId,
        viewed_at: now,
      },
      {
        onConflict: 'user_id,pet_id',
      }
    )

    if (error) {
      console.error('최근 본 동물 기록 실패:', error)
    }
  } catch (err) {
    console.error('최근 본 동물 기록 중 오류:', err)
  }
}

export const getRecentlyViewed = async (limit = 20): Promise<string[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('recently_viewed')
    .select('pet_id')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('최근 본 동물 목록 조회 실패:', error)
    return []
  }

  return data?.map((rv) => rv.pet_id) || []
}

export const removeRecentlyViewed = async (petId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase
    .from('recently_viewed')
    .delete()
    .eq('user_id', user.id)
    .eq('pet_id', petId)

  if (error) {
    console.error('최근 본 동물 제거 실패:', error)
    throw error
  }
}
