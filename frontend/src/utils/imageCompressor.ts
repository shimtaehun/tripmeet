import * as ImageManipulator from 'expo-image-manipulator';

const MAX_SIZE_BYTES = 500 * 1024;  // 500KB
const MAX_DIMENSION = 1280;         // 최대 가로/세로 px

/**
 * 이미지를 500KB 이하, 최대 1280px로 압축한다.
 * 모든 이미지 업로드 진입점에서 반드시 이 함수를 거쳐야 한다. (context.md 원칙 4)
 *
 * @param uri 원본 이미지 URI
 * @returns 압축된 이미지의 { uri, base64, size }
 */
export async function compressImage(uri: string): Promise<{
  uri: string;
  base64: string;
  mimeType: string;
}> {
  let quality = 0.8;
  let result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );

  // 500KB 초과 시 품질을 낮추며 재시도 (최대 3회)
  let attempts = 0;
  while (result.base64 && result.base64.length * 0.75 > MAX_SIZE_BYTES && attempts < 3) {
    quality -= 0.2;
    result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_DIMENSION } }],
      { compress: Math.max(quality, 0.2), format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );
    attempts++;
  }

  return {
    uri: result.uri,
    base64: result.base64 ?? '',
    mimeType: 'image/jpeg',
  };
}
