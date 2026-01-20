export interface Coordinates {
  t: number; // top %
  l: number; // left %
  w?: number; // width %
  h?: number; // height %
}

export interface Hunter {
  id: number;
  hitbox: Coordinates;
  muzzle: Coordinates;
  angle: number;
  bannerHeadline: string;
  bannerColor: string;
  textColor: string;
  burstColor: string;
  burstShadow: string;
  burstScale: string;
  useSpecificPath: boolean;
  isLink: boolean;
}

export interface FishContent {
  title: string;
  body: string;
  tickerItems: string[]; // Emojis or text for the ticker
  highlightTerms: string[];
}

export interface FishData {
  id: string;
  position: Coordinates; // Hitbox on the mosaic
  focus?: { x: number, y: number }; // Focus point % for the cutout (image relative)
  clipPath?: string; // CSS Polygon string
  content: FishContent;
}

export interface AppState {
  imageSrc: string | null;
  videoSrc: string | null;
  isReady: boolean;
  showVideo: boolean;
  lockedHunterId: number | null;
  showDebug: boolean;
}