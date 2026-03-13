export type PublishStatus = "draft" | "published" | "archived";

export type EntityType =
  | "building"
  | "architect"
  | "city"
  | "shop"
  | "event";

export interface ImageMeta {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  credit?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface DateRange {
  start: string;
  end?: string;
}

export interface Tag {
  label: string;
  slug: string;
}
