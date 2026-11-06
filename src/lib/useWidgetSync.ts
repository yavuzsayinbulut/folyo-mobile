import { useEffect } from "react";
import { AppState } from "react-native";
import VisitsWidget from "@/widgets/VisitsWidget";
import type { VisitsWidgetProps } from "@/widgets/types";
import { useApi } from "./api";

type WidgetSummary = {
  username: string;
  displayName: string;
  weekVisitors: number;
  previousWeekVisitors: number;
  last7Days: number[];
  latestMessage: { authorName: string; body: string } | null;
};

/** Sunucu ozetini widget'in gosterecegi hazir degerlere cevirir (widget kendi icinde hesap yapamaz). */
export function toWidgetProps(summary: WidgetSummary): VisitsWidgetProps {
  const max = Math.max(1, ...summary.last7Days);
  const change =
    summary.previousWeekVisitors === 0
      ? "son 7 gün"
      : `son 7 gün · ${summary.weekVisitors >= summary.previousWeekVisitors ? "↑" : "↓"} %${Math.abs(
          Math.round(((summary.weekVisitors - summary.previousWeekVisitors) / summary.previousWeekVisitors) * 100),
        )}`;
  const message = summary.latestMessage ? `${summary.latestMessage.authorName}: ${summary.latestMessage.body}` : "";
  return {
    username: summary.username,
    visitors: `${summary.weekVisitors} ziyaretçi`,
    delta: change,
    bars: summary.last7Days.map((v) => Math.max(2, Math.round((v / max) * 36))),
    message: message.length > 60 ? `${message.slice(0, 59)}…` : message,
  };
}

/** Uygulama acildiginda ve on plana her geldiginde ana ekran widget'ini tazeler. */
export function useWidgetSync() {
  const api = useApi();

  useEffect(() => {
    const refresh = () =>
      api<WidgetSummary>("/api/me/widget")
        .then((summary) => VisitsWidget.updateSnapshot(toWidgetProps(summary)))
        .catch(() => undefined);
    refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, [api]);
}
