/**
 * 이미지 URL 최적화
 * 크기와 포맷을 지정해서 성능 개선
 */
export const optimizeImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return url

  // 상대 경로는 그대로 반환 (서버에서 처리)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url
  }

  // URL 객체 생성 (쿼리 파라미터 추가용)
  try {
    const urlObj = new URL(url)

    // 이미 최적화된 URL이면 그대로 반환
    if (urlObj.searchParams.has('w') || urlObj.searchParams.has('width')) {
      return url
    }

    // 크기 파라미터 추가 (일반적인 이미지 서비스)
    if (width) {
      urlObj.searchParams.append('w', width.toString())
    }
    if (height) {
      urlObj.searchParams.append('h', height.toString())
    }

    // 품질 설정 (80% - 충분한 품질 유지하면서 크기 줄임)
    urlObj.searchParams.append('q', '80')

    return urlObj.toString()
  } catch {
    // URL 형식이 아니면 그대로 반환
    return url
  }
}

/**
 * 이미지 크기 계산 (aspect ratio 유지)
 */
export const calculateImageDimensions = (
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 1
): { width: number; height: number } => {
  const width = containerWidth
  const height = containerWidth / aspectRatio

  if (height > containerHeight) {
    return {
      width: containerHeight * aspectRatio,
      height: containerHeight,
    }
  }

  return { width, height }
}

/**
 * 이미지 사전 로드
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}
