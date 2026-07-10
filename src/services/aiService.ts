// Groq API를 이용한 펫 성격 분석 서비스

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Groq API에 펫 정보를 보내 성격 분석 받기
 */
export const analyzePetPersonality = async (petInfo: {
  breed: string
  age: string
  gender: string
  specialFeatures: string
  particularMatters: string
  personality: string
}): Promise<string> => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('Groq API 키가 설정되지 않았습니다. https://console.groq.com/keys에서 API 키를 발급받으세요.')
  }

  const prompt = `당신은 동물 성격 분석 전문가입니다. 주어진 정보에서 유추할 수 있는 내용만 사용해서 이 동물을 소개하세요.

품종: ${petInfo.breed}
나이: ${petInfo.age}
성별: ${petInfo.gender}
성격: ${petInfo.personality}
특징: ${petInfo.specialFeatures}
주의사항: ${petInfo.particularMatters}

작성 가이드:
- 한글로만 작성하세요
- 존댓말(~입니다, ~습니다, ~있습니다)을 사용하세요
- 2-3문장으로 간단하게 설명하세요
- 주어진 정보에서 논리적으로 유추할 수 있는 내용만 포함하세요
- 성별, 나이, 품종 특성을 고려해서 자연스럽게 연결하세요
- 정보가 불충분하면 간단하게 작성하세요
- 문장이 부자연스럽다면 단어를 추가해 자연스럽게 문장을 완성하세요

예시는
특이사항:
겁이 많지만 사람 손길을 거부하지 않음.
산책을 좋아하며 짖음이 적음.

AI 응답

🐶 사람을 잘 따르며 차분한 성격입니다.
산책을 좋아하고 짖음이 적어 아파트 생활에도 잘 적응할 가능성이 있습니다.
처음에는 낯을 가릴 수 있지만 적응하면 좋은 반려견이 될 수 있습니다.

응답만 작성하세요.`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Groq API 오류: ${error.error?.message || '알 수 없는 오류'}`)
  }

  const data = await response.json()
  let content = data.choices[0].message.content

  // 한글이 아닌 문자 제거 (한글, 공백, 구두점만 유지)
  content = content.replace(/[^가-힣\s.,!?;:'"—-]/g, '')

  return content
}
