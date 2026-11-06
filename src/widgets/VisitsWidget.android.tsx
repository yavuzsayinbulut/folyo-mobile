import { Box, Column, Row, Spacer, Text } from "@expo/ui/jetpack-compose";
import { background, cornerRadius, fillMaxSize, fillMaxWidth, height, paddingAll, width } from "@expo/ui/jetpack-compose/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import { EMPTY_VISITS, type VisitsWidgetProps } from "./types";

/** Android ana ekran widget'i (Jetpack Compose alt kumesi). Yalitilmis calisir: yalniz props ve environment kullanir. */
const VisitsWidget = (props: VisitsWidgetProps, environment: WidgetEnvironment) => {
  "widget";
  const dark = environment.colorScheme === "dark";
  return (
    <Column modifiers={[fillMaxSize(), background(dark ? "#1f1f1d" : "#ffffff"), cornerRadius(20), paddingAll(14)]}>
      <Text color={dark ? "#afa9ec" : "#534ab7"} style={{ fontSize: 12, fontWeight: "bold" }}>
        {"folyo.app/" + props.username}
      </Text>
      <Text color={dark ? "#f1efe8" : "#1f1e1c"} style={{ fontSize: 28, fontWeight: "bold" }}>
        {props.visitors}
      </Text>
      <Text color={dark ? "#b4b2a9" : "#5f5e5a"} style={{ fontSize: 11 }}>
        {props.delta}
      </Text>
      <Spacer modifiers={[height(8)]} />
      <Row verticalAlignment="bottom" horizontalArrangement={{ spacedBy: 4 }} modifiers={[fillMaxWidth(), height(36)]}>
        {props.bars.map((barHeight, i) => (
          <Box key={i} modifiers={[width(12), height(barHeight), background(dark ? "#8b84e6" : "#534ab7"), cornerRadius(3)]} />
        ))}
      </Row>
      {props.message ? (
        <Text color={dark ? "#b4b2a9" : "#5f5e5a"} style={{ fontSize: 11 }}>
          {props.message}
        </Text>
      ) : null}
    </Column>
  );
};

export default createWidget("VisitsWidget", VisitsWidget, EMPTY_VISITS);
