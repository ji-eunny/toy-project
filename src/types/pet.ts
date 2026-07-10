// 유기동물 데이터 타입
export interface Pet {
  id: string
  name: string
  breed: string
  age: string
  personality: string
  image: string
  images: string[] // 여러 사진
  gender: string
  adoptability: string
  location: string
  shelterName: string
  shelterPhone: string
  shelterAddress: string
  receivedDate: string
  noticeNo: string
  status: string // 보호중, 종료(안락사), 종료(입양) 등
  color: string // 색상
  weight: string // 체중
  neutered: string // 중성화 여부
  noticeStartDate: string // 공고 시작일
  noticeEndDate: string // 공고 종료일
  discoveryLocation: string // 발견장소 정보
  specialFeatures: string // 특징정보
  particularMatters: string // 특이사항
  isFavorite?: boolean // 찜 여부
}

// API 응답 타입
export interface PetApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
      api_version: string
    }
    body: {
      items: {
        item: PetApiItem[]
      }
      pageNo: number
      pageSize: number
      totalCount: number
    }
  }
}

export interface PetApiItem {
  desertionNo: string
  filename: string
  happenDt: string
  happenPlace: string
  kindCd: string
  colorCd: string
  age: string
  weight: string
  noticeNo: string
  noticeSdt: string
  noticeEdt: string
  popfile: string
  processState: string
  sexCd: string
  neuterYn: string
  careNm: string
  careTel: string
  careAddr: string
  orgNm: string
  chargeNm: string
  officetel: string
}

// 지역별 데이터를 위한 필터링 타입
export interface PetFilter {
  region?: string
  breed?: string
  gender?: string
  status?: string
}
