export interface INominatimReverseResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    county?: string;
    state?: string;
    state_district?: string;
    region?: string;
    country: string;
    country_code: string;
  };
  namedetails: {
    /**
     * local
     */
    name: string;
    /**
     * english
     */
    'name:en'?: string;
  };

  boundingbox: string[];
}

export interface IGoogleReverseResponse {
  plus_code: PlusCode;
  results: Result[];
  status: string;
}

interface PlusCode {
  compound_code: string;
  global_code: string;
}

interface Result {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
  types: string[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface Geometry {
  bounds: Bounds;
  location: Location;
  location_type: string;
  viewport: Viewport;
}

interface Bounds {
  northeast: Location;
  southwest: Location;
}

interface Location {
  lat: number;
  lng: number;
}

interface Viewport {
  northeast: Location;
  southwest: Location;
}

export interface IReverseLocalityResponse {
  coordinates?: {
    lat: number;
    lng: number;
  };
  locality?: {
    en_name: string;
  };
  country?: {
    en_name: string;
  };

  place_id?: string;
}

export interface IReverseCountryResponse {
  coordinates: {
    lat: number;
    lng: number;
  };
  en_name: string;

  place_id?: string;
}
