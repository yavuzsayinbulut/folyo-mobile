/** Mobil uygulama Spring API'ye dogrudan, Bearer token ile gider; giris icin web sayfasini kullanir. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3100";

/** Sunucunun dondurdugu "/api/public/media/..." gibi goreli adresleri tam adrese cevirir. */
export function absolute(path: string): string {
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}
