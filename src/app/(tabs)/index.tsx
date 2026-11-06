import { IconArrowDown, IconArrowUp, IconExternalLink, IconEye, IconEyeOff, IconPlus, IconTrash, IconX } from "@tabler/icons-react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Button, Field, Panel, PlatformBadge, Title } from "@/components/ui";
import { ApiError, useApi } from "@/lib/api";
import { absolute, WEB_URL } from "@/lib/config";
import { confirm } from "@/lib/confirm";
import { describeCard } from "@/lib/platforms";
import { useColors } from "@/lib/theme";
import type { Card, CardSize, MediaItem, Profile } from "@/lib/types";
import { useMeAndCards } from "@/lib/useMe";

const SIZES: CardSize[] = ["SMALL", "WIDE", "LARGE"];
const SIZE_LABEL: Record<CardSize, string> = { SMALL: "1×1", WIDE: "2×1", LARGE: "2×2" };

export default function PageTab() {
  const c = useColors();
  const api = useApi();
  const { me, setMe, cards, setCards, error, reload } = useMeAndCards();
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setActionError(null);
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "İşlem yapılamadı");
      await reload();
    }
  }

  const replace = (updated: Card) => setCards((list) => list?.map((card) => (card.id === updated.id ? updated : card)) ?? null);

  /** Yeni sira hemen gosterilir; tum liste tek istekte yazilir, hata olursa sunucudaki sira geri yuklenir. */
  const move = (index: number, delta: number) =>
    run(async () => {
      if (!cards) return;
      const next = [...cards];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      setCards(next);
      setCards(await api<Card[]>("/api/me/cards/order", { method: "PUT", body: { cardIds: next.map((card) => card.id) } }));
    });

  const patch = (card: Card, body: Partial<Pick<Card, "size" | "visible">>) =>
    run(async () => replace(await api<Card>(`/api/me/cards/${card.id}`, { method: "PATCH", body })));

  const remove = (card: Card) =>
    run(async () => {
      const { title } = describeCard(card);
      if (!(await confirm("Kartı sil", `"${title}" kartı sayfandan kaldırılacak.`, "Sil"))) return;
      await api(`/api/me/cards/${card.id}`, { method: "DELETE" });
      setCards((list) => list?.filter((item) => item.id !== card.id) ?? null);
    });

  if (!me || !cards) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        {error ? <Body danger>{error}</Body> : <ActivityIndicator color={c.accent} />}
      </SafeAreaView>
    );
  }

  if (!me.profile) {
    return <ClaimProfile defaultName={me.user.name} onClaimed={(profile) => setMe({ ...me, profile })} />;
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await reload();
              setRefreshing(false);
            }}
          />
        }
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Title subtitle={`folyo.app/${me.profile.username}`}>{me.profile.displayName}</Title>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Sayfanı tarayıcıda aç"
            onPress={() => WebBrowser.openBrowserAsync(`${WEB_URL}/${me.profile!.username}`)}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8 }}
          >
            <Text style={{ color: c.accent, fontWeight: "600" }}>Gör</Text>
            <IconExternalLink size={16} color={c.accent} />
          </Pressable>
        </View>

        {actionError ? <Body danger style={{ marginBottom: 10 }}>{actionError}</Body> : null}

        <Panel style={{ padding: 0 }}>
          {cards.length === 0 ? (
            <Body muted style={{ padding: 16 }}>Henüz kart yok. İlk kartını ekle.</Body>
          ) : (
            cards.map((card, index) => (
              <CardRow
                key={card.id}
                card={card}
                last={index === cards.length - 1}
                canUp={index > 0}
                canDown={index < cards.length - 1}
                onUp={() => move(index, -1)}
                onDown={() => move(index, 1)}
                onResize={() => patch(card, { size: SIZES[(SIZES.indexOf(card.size) + 1) % SIZES.length] })}
                onToggle={() => patch(card, { visible: !card.visible })}
                onDelete={() => remove(card)}
                onMediaChange={(media) => replace({ ...card, media })}
              />
            ))
          )}
        </Panel>

        <Button label="Kart ekle" icon={<IconPlus size={18} color={c.onAccent} />} onPress={() => router.push("/add-card")} />
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButton({ label, onPress, disabled, children }: { label: string; onPress: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => ({ width: 34, height: 34, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.25 : pressed ? 0.6 : 1 })}
    >
      {children}
    </Pressable>
  );
}

function CardRow(props: {
  card: Card;
  last: boolean;
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
  onResize: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onMediaChange: (media: MediaItem[]) => void;
}) {
  const c = useColors();
  const { card } = props;
  const { platform, title, subtitle } = describeCard(card);
  const VisibilityIcon = card.visible ? IconEye : IconEyeOff;

  return (
    <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: props.last ? 0 : 0.5, borderBottomColor: c.line }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, opacity: card.visible ? 1 : 0.5 }}>
        <PlatformBadge platform={platform} size={34} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{title}</Text>
          <Text numberOfLines={1} style={{ fontSize: 12, color: c.ink3 }}>{subtitle}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Boyut ${SIZE_LABEL[card.size]}, değiştir`}
          onPress={props.onResize}
          style={{ paddingHorizontal: 9, height: 26, borderRadius: 13, backgroundColor: c.accentSoft, justifyContent: "center" }}
        >
          <Text style={{ fontSize: 12, color: c.accentInk }}>{SIZE_LABEL[card.size]}</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 4 }}>
        <IconButton label="Yukarı taşı" onPress={props.onUp} disabled={!props.canUp}>
          <IconArrowUp size={18} color={c.ink2} />
        </IconButton>
        <IconButton label="Aşağı taşı" onPress={props.onDown} disabled={!props.canDown}>
          <IconArrowDown size={18} color={c.ink2} />
        </IconButton>
        <IconButton label={card.visible ? "Gizle" : "Göster"} onPress={props.onToggle}>
          <VisibilityIcon size={18} color={c.ink2} />
        </IconButton>
        <IconButton label="Sil" onPress={props.onDelete}>
          <IconTrash size={18} color={c.ink2} />
        </IconButton>
      </View>
      {card.type === "GALLERY" ? <GalleryEditor card={card} onChange={props.onMediaChange} /> : null}
    </View>
  );
}

/** Fotograflar galeriden secilir ve sirayla yuklenir; sunucu boyutlandirir ve konum dahil tum metadata'yi siler. */
function GalleryEditor({ card, onChange }: { card: Card; onChange: (media: MediaItem[]) => void }) {
  const c = useColors();
  const api = useApi();
  const [status, setStatus] = useState<string | null>(null);
  const media = card.media ?? [];

  async function pick() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, quality: 0.9 });
    if (result.canceled) return;
    let current = media;
    for (const [i, asset] of result.assets.entries()) {
      setStatus(`Yükleniyor ${i + 1}/${result.assets.length}`);
      const form = new FormData();
      if (Platform.OS === "web" && asset.file) {
        form.append("file", asset.file);
      } else {
        // React Native FormData dosyayi { uri, name, type } nesnesiyle alir.
        form.append("file", { uri: asset.uri, name: asset.fileName ?? "photo.jpg", type: asset.mimeType ?? "image/jpeg" } as unknown as Blob);
      }
      try {
        const item = await api<MediaItem>(`/api/me/cards/${card.id}/media`, { method: "POST", form });
        current = [...current, item];
        onChange(current);
      } catch (e) {
        setStatus(e instanceof ApiError ? e.message : "Yüklenemedi");
        return;
      }
    }
    setStatus(null);
  }

  async function remove(item: MediaItem) {
    if (!(await confirm("Fotoğrafı sil", "Bu fotoğraf galeriden kaldırılacak.", "Sil"))) return;
    await api(`/api/me/media/${item.id}`, { method: "DELETE" });
    onChange(media.filter((m) => m.id !== item.id));
  }

  return (
    <View style={{ marginTop: 6, marginLeft: 44 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {media.map((item) => (
          <View key={item.id}>
            <Image source={{ uri: absolute(item.url) }} style={{ width: 58, height: 58, borderRadius: 10, backgroundColor: c.surface2 }} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fotoğrafı sil"
              onPress={() => remove(item)}
              hitSlop={6}
              style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}
            >
              <IconX size={12} color="#fff" />
            </Pressable>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fotoğraf ekle"
          onPress={pick}
          style={{ width: 58, height: 58, borderRadius: 10, borderWidth: 1, borderStyle: "dashed", borderColor: c.lineStrong, alignItems: "center", justifyContent: "center" }}
        >
          <IconPlus size={20} color={c.ink3} />
        </Pressable>
      </View>
      {status ? <Text style={{ marginTop: 4, fontSize: 12, color: c.ink3 }}>{status}</Text> : null}
    </View>
  );
}

function ClaimProfile({ defaultName, onClaimed }: { defaultName: string; onClaimed: (profile: Profile) => void }) {
  const c = useColors();
  const api = useApi();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!username.trim()) return setError("Bir kullanıcı adı yaz");
    setBusy(true);
    setError(null);
    try {
      onClaimed(await api<Profile>("/api/me/profile", { method: "POST", body: { username, displayName } }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Sayfa açılamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
      <Title subtitle="Adresini seç, sonra kartlarını ekle.">Sayfanı aç</Title>
      <Field label="Adresin (folyo.app/…)" value={username} onChangeText={setUsername} placeholder="adin" />
      <Field label="Görünen ad" value={displayName} onChangeText={setDisplayName} maxLength={60} autoCapitalize="words" />
      {error ? <Body danger style={{ marginBottom: 10 }}>{error}</Body> : null}
      <Button label="Sayfamı oluştur" onPress={submit} busy={busy} />
    </SafeAreaView>
  );
}
