import { Pet } from '../types/pet'
import { getBreedName } from '../data/breedMap'

// 경기도 공개 API
const SHELTER_API = 'https://openapi.gg.go.kr/OrganicAnimalProtectionFacilit'
const ANIMAL_API = 'https://openapi.gg.go.kr/AbdmAnimalProtect'
const API_KEY = import.meta.env.VITE_ANIMAL_API_KEY || ''

// 경기도 시군구 매핑
const REGION_MAP: Record<string, string> = {
  '수원': '수원시',
  '성남': '성남시',
  '의정부': '의정부시',
  '광주': '광주시',
  '평택': '평택시',
  '동두천': '동두천시',
  '안산': '안산시',
  '고양': '고양시',
  '과천': '과천시',
  '구리': '구리시',
  '남양주': '남양주시',
  '오산': '오산시',
  '시흥': '시흥시',
  '군포': '군포시',
  '의왕': '의왕시',
  '하남': '하남시',
  '용인': '용인시',
  '파주': '파주시',
  '이천': '이천시',
  '안성': '안성시',
  '김포': '김포시',
  '화성': '화성시',
  '광명': '광명시',
  '여주': '여주시',
  '가평': '가평군',
  '양평': '양평군',
  '포천': '포천시',
  '연천': '연천군',
}

/**
 * Step 1: 보호시설 정보 조회
 */
const fetchShelters = async (region?: string): Promise<any[]> => {
  try {
    const params = new URLSearchParams({
      KEY: API_KEY,
      TYPE: 'json',
      pIndex: '1',
      pSize: '1000',
    })

    const url = `${SHELTER_API}?${params.toString()}`

    const response = await fetch(url)
    const data = await response.json()

    if (!data.OrganicAnimalProtectionFacilit || !Array.isArray(data.OrganicAnimalProtectionFacilit)) {
      console.error('보호시설 API 응답 없음:', data)
      return []
    }

    // 응답 구조: [0] = 메타, [1] = { row: [...] }
    const facilityData = data.OrganicAnimalProtectionFacilit[1]

    if (!facilityData || !facilityData.row || !Array.isArray(facilityData.row)) {
      console.error('보호시설 데이터 없음:', facilityData)
      return []
    }

    let shelters = facilityData.row

    // 지역 필터
    if (region && REGION_MAP[region]) {
      const regionName = REGION_MAP[region]
      shelters = shelters.filter((s: any) => s.SIGUN_NM === regionName)
    }

    console.log(`보호시설 ${shelters.length}개 조회됨`)
    return shelters
  } catch (error) {
    console.error('보호시설 조회 실패:', error)
    return []
  }
}

/**
 * Step 2: 동물 정보 조회 (시군 코드별)
 */
const fetchAnimalsByRegion = async (sigunCd: string, shelterInfo: any): Promise<Pet[]> => {
  try {
    const params = new URLSearchParams({
      KEY: API_KEY,
      TYPE: 'json',
      pIndex: '1',
      pSize: '300',
      SIGUN_CD: sigunCd,
    })

    const url = `${ANIMAL_API}?${params.toString()}`

    const response = await fetch(url)
    const data = await response.json()

    if (!data.AbdmAnimalProtect || !Array.isArray(data.AbdmAnimalProtect)) {
      console.error('AbdmAnimalProtect 응답 없음:', data)
      return []
    }

    // 응답 구조: [0] = 메타, [1] = { row: [...] }
    const animalData = data.AbdmAnimalProtect[1]

    if (!animalData || !animalData.row || !Array.isArray(animalData.row)) {
      console.error('동물 데이터 없음:', animalData)
      return []
    }

    const animalsData = animalData.row
    console.log(`${sigunCd} 지역 동물 ${animalsData.length}마리 받음`)
    return animalsData.map((animal: any) => convertToPet(animal, shelterInfo))
  } catch (error) {
    console.error('동물 조회 실패:', error)
    return []
  }
}

/**
 * API 데이터를 Pet으로 변환
 */
const convertToPet = (animal: any, shelterInfo: any): Pet => {
  // 썸네일 이미지 (기본 이미지)
  const imageUrl = animal.THUMB_IMAGE_COURS || animal.IMAGE_COURS || ''

  // 여러 사진 수집 (THUMB_IMAGE_COURS와 IMAGE_COURS에서)
  const images: string[] = []
  if (animal.THUMB_IMAGE_COURS) images.push(animal.THUMB_IMAGE_COURS)
  if (animal.IMAGE_COURS && animal.IMAGE_COURS !== animal.THUMB_IMAGE_COURS) {
    images.push(animal.IMAGE_COURS)
  }

  const breedName = getBreedName(animal.SPECIES_NM)

  // 안정적인 ID 생성: 이미지 URL이 가장 안정적 (같은 강아지면 같은 이미지)
  const petId = imageUrl
    ? `${animal.SIGUN_CD}-${imageUrl.split('/').pop()}`
    : `${animal.SIGUN_CD}-${animal.NOTC_NO || animal.ABDM_IDNTIFY_NO || animal.ANIMAL_NM || 'unknown'}`

  return {
    id: petId,
    name: `${breedName} ${animal.AGE_INFO || ''}`.trim(),
    breed: breedName,
    age: animal.AGE_INFO || '나이 미상',
    personality: '',
    image: imageUrl,
    images: images.length > 0 ? images : [''],
    gender: convertGender(animal.SEX_NM),
    adoptability: generateAdoptability(),
    location: animal.SIGUN_NM || '위치 미상',
    shelterName: shelterInfo?.entrps_nm || animal.SHTER_NM || '보호소 미상',
    shelterPhone: shelterInfo?.entrps_telno || animal.SHTER_TELNO || '연락처 없음',
    shelterAddress: shelterInfo?.refine_road_nm_addr || animal.REFINE_ROADNM_ADDR || '주소 없음',
    receivedDate: animal.RECEPT_DE || '',
    noticeNo: animal.ABDM_IDNTIFY_NO || '',
    status: animal.STATE_NM || '보호중',
    color: animal.COLOR_NM || '미상',
    weight: animal.BDWGH_INFO || '미상',
    neutered: animal.NEUT_YN === 'Y' ? '중성화함' : animal.NEUT_YN === 'N' ? '중성화안함' : '미상',
    noticeStartDate: animal.PBLNC_BEGIN_DE || '',
    noticeEndDate: animal.PBLNC_END_DE || '',
    discoveryLocation: animal.DISCVRY_PLC_INFO || '미상',
    specialFeatures: animal.SFETR_INFO || '특이사항 없음',
    particularMatters: animal.PARTCLR_MATR || '특이사항 없음',
  }
}

/**
 * 성별 변환
 */
const convertGender = (sexCode: string): string => {
  switch (sexCode?.toUpperCase()) {
    case 'M':
      return '수컷 (M)'
    case 'F':
      return '암컷 (F)'
    case 'Q':
      return '암수없음 (Q)'
    case 'Y':
      return '예 (Y)'
    case 'N':
      return '아니오 (N)'
    case 'U':
      return '알수없음 (U)'
    default:
      return '미상'
  }
}


/**
 * 입양 추천도 생성
 */
const generateAdoptability = (): string => {
  const tips = [
    '초보 반려인에게 적합합니다',
    '활동적인 가정에 추천합니다',
    '아파트 거주자에게 적합합니다',
    '가족 입양에 최고입니다',
    '노년층 반려인에게 추천합니다',
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

/**
 * 배열을 청크로 나누는 헬퍼
 */
const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * 지역별 유기동물 조회 (보호시설 → 동물 정보 두 단계 API 호출)
 * 병렬 요청으로 성능 개선 (최대 5개 동시 요청)
 */
export const fetchPets = async (
  _pageNo: number = 1,
  _pageSize: number = 10,
  region?: string
): Promise<Pet[]> => {
  try {
    // Step 1: 보호시설 정보 조회
    const shelters = await fetchShelters(region)

    if (shelters.length === 0) {
      return []
    }

    // 중복되는 시군 코드는 한 번만 조회
    const shelterMap = new Map<string, any>()
    for (const shelter of shelters) {
      shelterMap.set(shelter.SIGUN_CD, shelter)
    }

    const entries = Array.from(shelterMap.entries())

    // 5개씩 묶어서 병렬 요청 (API 과부하 방지)
    const CONCURRENCY = 5
    const chunks = chunkArray(entries, CONCURRENCY)
    let allAnimals: Pet[] = []

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(([sigunCd, shelterInfo]) => fetchAnimalsByRegion(sigunCd, shelterInfo))
      )
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allAnimals = allAnimals.concat(result.value)
        }
      }
    }

    return allAnimals
  } catch (error) {
    return []
  }
}

/**
 * 지역별 유기동물 조회
 */
export const fetchPetsByRegion = async (region: string): Promise<Pet[]> => {
  return fetchPets(1, 30, region)
}

/**
 * 지역 목록 조회
 */
export const getRegions = (): string[] => {
  return Object.keys(REGION_MAP)
}
