export function decodeBase64ToImageSrc(tokenUri: string): string {
  return JSON.parse(atob(tokenUri.split(',')[1])).image
}
