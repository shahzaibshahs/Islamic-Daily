export enum AppFeature {
  Ask = 'ASK',
  Dua = 'DUA',
  Quran = 'QURAN',
}

export interface Dua {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  tip: string;
}
