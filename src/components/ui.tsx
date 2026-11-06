import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Platform } from "@/lib/platforms";
import { useColors, useTone } from "@/lib/theme";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const c = useColors();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.screen, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  const c = useColors();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: "700", color: c.ink, letterSpacing: -0.4 }}>{children}</Text>
      {subtitle ? <Text style={{ marginTop: 4, fontSize: 14, color: c.ink3 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function Panel({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return <View style={[styles.panel, { backgroundColor: c.surface, borderColor: c.line }, style]}>{children}</View>;
}

export function Label({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={{ fontSize: 13, color: c.ink2, marginBottom: 6 }}>{children}</Text>;
}

export function Body({ children, muted, danger, style }: { children: ReactNode; muted?: boolean; danger?: boolean; style?: object }) {
  const c = useColors();
  return <Text style={[{ fontSize: 15, color: danger ? c.danger : muted ? c.ink3 : c.ink, lineHeight: 21 }, style]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  busy,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  busy?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const c = useColors();
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? c.accent : "transparent",
          borderColor: primary ? c.accent : c.lineStrong,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={primary ? c.onAccent : c.ink} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          <Text style={{ fontSize: 16, fontWeight: "600", color: primary ? c.onAccent : c.ink }}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const c = useColors();
  const { label, style, ...rest } = props;
  return (
    <View style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      <TextInput
        placeholderTextColor={c.ink3}
        autoCapitalize="none"
        {...rest}
        style={[styles.input, { color: c.ink, backgroundColor: c.bg, borderColor: c.lineStrong }, style]}
      />
    </View>
  );
}

export function PlatformBadge({ platform, size = 36 }: { platform: Platform; size?: number }) {
  const tone = useTone(platform.tone);
  const Icon = platform.icon;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: tone.bg, alignItems: "center", justifyContent: "center" }}>
      <Icon size={size * 0.55} color={tone.ink} />
    </View>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const c = useColors();
  return (
    <View style={[styles.segmented, { borderColor: c.lineStrong }]} accessibilityRole="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && { backgroundColor: c.accent }]}
          >
            <Text style={{ fontSize: 14, fontWeight: active ? "600" : "400", color: active ? c.onAccent : c.ink2 }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 40, gap: 0 },
  panel: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, padding: 16, marginBottom: 14 },
  button: { height: 48, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  input: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 16 },
  segmented: { flexDirection: "row", borderWidth: 1, borderRadius: 12, padding: 2, alignSelf: "flex-start" },
  segment: { height: 34, paddingHorizontal: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
