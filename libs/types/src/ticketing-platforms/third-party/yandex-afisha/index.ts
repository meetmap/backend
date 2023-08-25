export interface ICityResponse {
  data: ICity[];
}
export interface ICity {
  id: string;
  url: string;
  name: string;
}

export interface ICityEventsResponse {
  paging: IPaging;

  data: ISingleEvent[];
}

export interface ISingleEvent {
  distance?: number | null;
  isPersonal: boolean;
  commentsCount: number;
  event: ICityEventsResponseEvent;
  scheduleInfo: IScheduleInfo;
}

//schedule-info-related
export interface IScheduleInfo {
  collapsedText?: string | null;
  dateEnd: string;
  dateGroups: DateGroup[];
  dateReleased?: string | null;
  dates: string[];
  dateStarted: string;
  multiSession: boolean;
  oneOfPlaces?: Place;
  onlyPlace?: Place;
  permanent: boolean;
  placePreview: string;
  placesTotal: number;
  preview: Preview;
  regularity: Regularity;
  tagsPreview?: string | null;
  prices: Price[];
  pushkinCardAllowed: boolean;
}

interface DateGroup {
  title: string;
  date: string;
  period: number;
  hasTickets: boolean;
  hasDiscounts: boolean;
}

interface Place {
  id: string;
  url: string;
  type: PlaceType;
  tags: PlaceType[];
  logo?: string | null;
  title: string;
  address: string;
  systemTags: SystemTag[];
  city: City;
  coordinates: Coordinates;
  bgColor: string;
  logoColor: string;
  distance?: string | null;
  promoImage2FeaturedDesktop?: string | null;
  promoImage2FeaturedBannerDesktop?: string | null;
  promoVideo2FeaturedDesktop?: string | null;
  metro: Metro[];
  isFavorite: boolean;
}

interface PlaceType {
  id: string;
  rubricUrl: string;
  rubricPlacesUrl: string;
  code: string;
  description?: string | null;
  type: string;
  status: string;
  name: string;
  namePlural: string;
  nameAcc?: string | null;
  nameGen?: string | null;
  nameAdj?: string | null;
  plural?: string | null;
}

interface SystemTag {
  code: string;
}

interface City {
  id: string;
  name: string;
  geoid: number;
  timezone: string;
}

interface Coordinates {
  longitude: number;
  latitude: number;
}

interface Metro {
  name: string;
  colors: string[];
}

interface Preview {
  type: string;
  text: string;
  startDate?: string | null;
  regularity?: string | null;
  singleDate: SingleDate;
}

interface SingleDate {
  day: string;
  month: string;
}

interface Regularity {
  isRegular: boolean;
  singleShowtime: string;
  daily: any[];
  weekly: any[];
}

interface Price {
  currency: string;
  value: number;
}

//event-related
export interface IPaging {
  limit: number;
  offset: number;
  total: number;
}

export interface ICityEventsResponseEvent {
  id: string;
  url: string;
  permanent: boolean;
  systemTags: SystemTag[];
  title: string;
  originalTitle?: string | null;
  dateReleased?: string | null;
  argument: string;
  promoArgument?: string | null;
  contentRating: string;
  kinopoisk?: any;
  userRating: UserRating;
  isFavorite: boolean;
  type: EventType;
  tags: Tag[];
  tickets: Ticket[];
  poster?: any | null;
  promoImage2: PromoImage;
  promoVideo2: PromoVideo;
  image: Image | null;
}

interface SystemTag {
  code: string;
}

interface UserRating {
  overall: RatingValue;
}

interface RatingValue {
  value: number;
  count: number;
}

interface EventType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  namePlural: string;
  plural: Plural;
  rubricPlacesUrl: string;
  status: string;
  type: string;
  nameCases: NameCases;
}

interface Plural {
  one: string;
  some: string;
  many: string;
  none: string;
}

interface NameCases {
  nameAcc: string;
  nameGen: string;
}

interface Tag {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  namePlural: string;
  plural?: any;
  rubricPlacesUrl: string;
  status: string;
  type: string;
  nameCases: NameCases;
}

interface Ticket {
  id: string;
  price?: Price;
  discount?: any | null;
  saleStatus: string;
  hasSpecificLoyalty: boolean;
  hasSpecificPlusWalletPercent: boolean;
  plusWalletPercent: number;
  discountPercents: any[];
}

interface Price {
  currency: string;
  min: number;
  max: number;
}

interface PromoImage {
  featuredDesktop: ImageDetail;
  featuredBannerDesktop: ImageDetail;
  previewL: ImageDetail;
  previewM: ImageDetail;
  previewS: ImageDetail;
  previewXS: ImageDetail;
}

interface PromoVideo {
  featuredDesktop: VideoDetail;
}

interface VideoDetail {
  poster: {
    x1: ImageDetail;
    x2: ImageDetail;
  };
  mp4: string;
  webm: string;
}

interface ImageDetail {
  url: string;
  width: number;
  height: number;
  precision: number;
  retina?: {
    '1x': string;
    '2x': string;
  };
}

interface Image {
  subType?: any;
  bgColor: string;
  baseColor: string;
  source: ImageSource;
  sizes: ImageSizes;
}

interface ImageSource {
  id?: string | null;
  url?: string | null;
  title?: string | null;
}

interface ImageSizes {
  eventCover: ImageDetail;
  eventCoverXS: ImageDetail;
  eventCoverS: ImageDetail;
  eventCoverL: ImageDetail;
  eventCoverL2x: ImageDetail;
  eventCoverM: ImageDetail;
  eventCoverM2x: ImageDetail;
  featured: ImageDetail;
  featuredSelection: ImageDetail;
  headingPrimaryS: ImageDetail;
  microdata: ImageDetail;
  suggest: ImageDetail;
  // add more image details as required
}
