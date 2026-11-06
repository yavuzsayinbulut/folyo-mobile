import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { background, containerBackground, cornerRadius, font, foregroundStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import { EMPTY_VISITS, type VisitsWidgetProps } from "./types";

/** iOS ana ekran widget'i (SwiftUI). Yalitilmis calisir: yalniz props ve environment kullanir. */
const VisitsWidget = (props: VisitsWidgetProps, environment: WidgetEnvironment) => {
  "widget";
  const dark = environment.colorScheme === "dark";
  return (
    <VStack alignment="leading" spacing={6} modifiers={[containerBackground(dark ? "#1f1f1d" : "#ffffff", "widget")]}>
      <Text modifiers={[font({ size: 12, weight: "semibold" }), foregroundStyle(dark ? "#afa9ec" : "#534ab7")]}>
        folyo.app/{props.username}
      </Text>
      <Text modifiers={[font({ size: 30, weight: "bold" }), foregroundStyle(dark ? "#f1efe8" : "#1f1e1c")]}>{props.visitors}</Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle(dark ? "#b4b2a9" : "#5f5e5a")]}>{props.delta}</Text>
      <Spacer />
      <HStack alignment="bottom" spacing={3}>
        {props.bars.map((height, i) => (
          <VStack key={i} modifiers={[frame({ width: 10, height }), background(dark ? "#8b84e6" : "#534ab7"), cornerRadius(2)]}>
            <Spacer />
          </VStack>
        ))}
      </HStack>
      {environment.widgetFamily === "systemMedium" && props.message ? (
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dark ? "#b4b2a9" : "#5f5e5a")]}>{props.message}</Text>
      ) : null}
    </VStack>
  );
};

export default createWidget("VisitsWidget", VisitsWidget, EMPTY_VISITS);
