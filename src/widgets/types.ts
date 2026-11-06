/** Widget'a uygulamadan gecen veri. Widget kodu ayri bir calisma ortaminda calisir; hesaplama burada yapilir. */
export type VisitsWidgetProps = {
  username: string;
  visitors: string;
  delta: string;
  /** Son 7 gunun cubuk yukseklikleri (piksel, 2-36). */
  bars: number[];
  message: string;
};

export const EMPTY_VISITS: VisitsWidgetProps = {
  username: "folyo",
  visitors: "–",
  delta: "Uygulamayı açınca güncellenir",
  bars: [2, 2, 2, 2, 2, 2, 2],
  message: "",
};
