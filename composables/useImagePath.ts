/**
 * 이미지 경로에 baseURL을 동적으로 추가하는 composable
 * GitHub Pages 등 서브 디렉토리 배포 시 이미지 경로 문제 해결
 */
export const useImagePath = () => {
  const config = useRuntimeConfig()
  const baseURL = config.app.baseURL || '/'

  /**
   * 이미지 경로에 baseURL 추가
   * @param path - 원본 이미지 경로 (예: /images/photo.jpg)
   * @returns baseURL이 적용된 경로 (예: /trip-guide/images/photo.jpg)
   */
  const getImagePath = (path: string | null | undefined): string => {
    if (!path) return ''

    // 이미 http/https로 시작하는 외부 URL은 그대로 반환
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // baseURL이 '/'인 경우 그대로 반환
    if (baseURL === '/') {
      return path
    }

    // 경로가 /로 시작하면 baseURL과 결합
    if (path.startsWith('/')) {
      // baseURL 끝의 /와 path 시작의 / 중복 제거
      const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
      return `${cleanBase}${path}`
    }

    // 상대 경로인 경우 baseURL 추가
    const cleanBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
    return `${cleanBase}${path}`
  }

  return {
    getImagePath,
    baseURL
  }
}
