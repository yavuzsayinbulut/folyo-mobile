import { useState } from "react";
import { Text, View } from "react-native";
import { Body, Button, Screen } from "@/components/ui";
import { useSession } from "@/lib/session";
import { useColors } from "@/lib/theme";

export default function Login() {
  const c = useColors();
  const { signIn } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const result = await signIn();
      if (result === "failed") setError("Giriş tamamlanamadı, tekrar dene.");
    } catch {
      setError("Sunucuya ulaşılamadı. Bağlantını kontrol et.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: "center", gap: 14 }}>
        <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: c.onAccent, fontSize: 30, fontWeight: "700" }}>f</Text>
        </View>
        <Text style={{ fontSize: 34, fontWeight: "700", color: c.ink, letterSpacing: -0.6, lineHeight: 38 }}>
          Sayfan,{"\n"}cebinde.
        </Text>
        <Body muted>Kartlarını düzenle, kimin baktığını gör, profilini QR ile paylaş.</Body>
      </View>
      <View style={{ gap: 10 }}>
        <Button label="Giriş yap" onPress={start} busy={busy} />
        <Body muted style={{ fontSize: 13, textAlign: "center" }}>
          Giriş, web hesabınla tarayıcıda yapılır; şifren uygulamaya girmez.
        </Body>
        {error ? <Body danger style={{ textAlign: "center" }}>{error}</Body> : null}
      </View>
    </Screen>
  );
}
