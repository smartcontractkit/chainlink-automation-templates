export function decodeBase64ToImageSrc(tokenUri: Array<string>): string {
  return JSON.parse(atob(tokenUri[0].split(',')[1])).image
}
