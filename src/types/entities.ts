import type {
  PublishStatus,
  ImageMeta,
  GeoLocation,
  Tag,
  DateRange,
} from "./common";

export interface Building {
  id: string;
  slug: string;
  name: string;
  nameKo?: string;
  architectId: string;
  cityId: string;
  year: number;
  description: string;
  address: string;
  location: GeoLocation;
  googleMapsUrl?: string;
  images: ImageMeta[];
  tags: Tag[];
  status: PublishStatus;
  typology?: string;
  website?: string;
}

export interface Architect {
  id: string;
  slug: string;
  name: string;
  nameKo?: string;
  nationality: string;
  birthYear?: number;
  deathYear?: number;
  bio: string;
  portrait?: ImageMeta;
  tags: Tag[];
  status: PublishStatus;
  website?: string;
  notableWorks?: string[];
}

export interface City {
  id: string;
  slug: string;
  name: string;
  nameKo?: string;
  country: string;
  description: string;
  location: GeoLocation;
  images: ImageMeta[];
  tags: Tag[];
  status: PublishStatus;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  nameKo?: string;
  cityId: string;
  category: string;
  description: string;
  address: string;
  location: GeoLocation;
  images: ImageMeta[];
  tags: Tag[];
  status: PublishStatus;
  website?: string;
  openingHours?: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  titleKo?: string;
  cityId: string;
  description: string;
  date: DateRange;
  venue: string;
  address?: string;
  location?: GeoLocation;
  images: ImageMeta[];
  tags: Tag[];
  status: PublishStatus;
  website?: string;
}
