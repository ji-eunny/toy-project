export const translateAuthError = (error: any): string => {
  const message = error?.message || ''

  const errorMap: { [key: string]: string } = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'Email not confirmed': '이메일 인증이 필요합니다.',
    'User already registered': '이미 가입된 이메일입니다.',
    'Weak password': '비밀번호가 너무 약합니다.',
    'over_email_signup_rate_limit': '가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    'invalid_credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  }

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return value
    }
  }

  return message || '인증 오류가 발생했습니다.'
}
