export interface IEventerSlideResponse {
  _id: string;
  slideType: number;
  objectRef: string;
  images: {
    imageDefault: string;
    imageSquare: string;
  };
  url: string;
  linkName: string;
  title: string;
  subTitle: string;
  /**
   * ISO date
   */
  lut: string;
}

export interface IEventerFullEventResponse {
  event: Event;
  production: Production;
  dataForSale: IDataForSale;
  jsonLdData: JsonLdData;
}

interface TicketPlatform {
  eventCategories: {
    subEventCategoryRefs: any[];
    subEventCategoryStrings: any[];
  };
  isHandled: boolean;
  isHidden: boolean;
  isPending: boolean;
  artists: any[];
  venues: any[];
  productions: any[];
  articles: any[];
  experiences: string[];
  orderHot: number;
  categories: {
    category: string;
    order: number;
    _id: string;
  }[];
  blockWelcomeMessage: boolean;
  eventDesc: string;
  images: {
    imageDefault: string;
    imageMobile: string;
    imageSquare: string;
    imageWide: string;
  };
  metadata: {
    metadataDescription: string;
    metadataImage: string;
    metadataTitle: string;
  };
  name: string;
  klaviyoLists: string[];
}

interface Location {
  latitude?: number;
  longitude?: number;
  timezone: string;
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
}

interface Schedule {
  start: string;
  end: string;
  openDoors: string;
  cancellationDeadline: string;
}

interface GuestInfoFields {
  name: {
    isToShow: boolean;
    isRequired: boolean;
    showInNamePerTicket: boolean;
  };
  sid: {
    isSupportInternationalID: boolean;
    isToShow: boolean;
    isRequired: boolean;
    showInNamePerTicket: boolean;
  };
  phone: {
    isSupportInternationalPhone: boolean;
    isToShow: boolean;
    isRequired: boolean;
    showInNamePerTicket: boolean;
  };
  email: {
    isToShow: boolean;
    isRequired: boolean;
    showInNamePerTicket: boolean;
  };
  age: {
    isAgeByDate: boolean;
    isToShow: boolean;
    isRequired: boolean;
    ageLimit: number;
    showInNamePerTicket: boolean;
  };
  gender: {
    isToShow: boolean;
    isRequired: boolean;
    showInNamePerTicket: boolean;
  };
}

interface Event {
  _id: string;
  linkName: string;
  status: number;
  name: string;
  eventType: number;
  ticketPlatform: TicketPlatform;
  location: Location;
  locationDescription: string;
  hideStartTime: boolean;
  hideEndTime: boolean;
  hideOpenDoors: boolean;
  schedule: Schedule;
  showMap: boolean;
  askForGender: boolean;
  pngBanner: boolean;
  eventDesc: string;
  guestInfoFields: GuestInfoFields;
}
interface Production {
  _id: string;
  contactDetails: {
    postalCode: string;
    addressDescription: string;
    contactEmail: string;
  };
  isBlockEventerPromotionalCheckbox: boolean;
  companyType: number;
  companyNo: string;
  publicName: string;
}

interface IDataForSale {
  settings: {
    eventType: number;
    purchaseConfirm: {
      confirmMethod: string;
      confirmEachPurchase: boolean;
    };
    ageLimit: number;
    allowMultipleTickets: number;
    multipleCreditCards: boolean;
    uniqueNamePerTicket: boolean;
    namePerTicket: boolean;
    guestInfoFields: {
      name: {
        isToShow: boolean;
        isRequired: boolean;
        showInNamePerTicket: boolean;
      };
      sid: {
        isSupportInternationalID: boolean;
        isToShow: boolean;
        isRequired: boolean;
        showInNamePerTicket: boolean;
      };
      phone: {
        isSupportInternationalPhone: boolean;
        isToShow: boolean;
        isRequired: boolean;
        showInNamePerTicket: boolean;
      };
      email: {
        isToShow: boolean;
        isRequired: boolean;
        showInNamePerTicket: boolean;
      };
      age: {
        isAgeByDate: boolean;
        isToShow: boolean;
        isRequired: boolean;
        ageLimit: number;
        showInNamePerTicket: boolean;
      };
      gender: {
        isToShow: boolean;
        isRequired: boolean;
        showInNamePerTicket: boolean;
      };
    };
    eventCategories: {
      topEventCategoryRef: string;
      topEventCategoryString: string;
      subEventCategoryRefs: string[];
      subEventCategoryStrings: string[];
    };
    extraQuestions: any[];
    extraQuestionsTranslations: any[];
    upsaleItems: any[];
    guestQuestions: {
      text: string;
      type: string;
      required: boolean;
      ticketTypes: any[];
      order: number;
      _id: string;
      choices: any[];
      choicesTranslations: any[];
      isHidden?: boolean;
    }[];
    nonMandatoryExtraQuestions: any[];
    showExtraQuestionsToBuyerOnly: boolean;
    askForGender: boolean;
    isTicketSectionTop: boolean;
    isSMSOptional: boolean;
    ticketDelivery: {
      homePrint: boolean;
    };
    conversionEmailOptions: {
      isSendConversionEmail: boolean;
    };
    hideStartTime: boolean;
    hideEndTime: boolean;
    hideOpenDoors: boolean;
    usePrivateTerminal: boolean;
    supportedLanguages: {
      [key: string]: boolean;
    };
    defaultLanguage: string;
    isUseCancellationDeadline: boolean;
    isSendSMSForPendingSales: boolean;
    isShowFullTextDescription: boolean;
    isShowingGuestInfo: boolean;
    useAltDefaultTerminal: boolean;
    isLiveStreamEvent: boolean;
    status: number;
    isSendSMSForCancelledSales: boolean;
  };
}

interface JsonLdData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  doorTime: string;
  location: {
    '@type': string;
    name: string;
    address: {
      '@type': string;
      addressCountry: string;
      addressLocality: string;
      addressRegion: string;
      streetAddress: string | null;
      postalCode: string | null;
    };
  };
  url: string;
  eventStatus: string;
  eventAttendanceMode: string;
}

export interface IEventerTicketsResponse {
  _id: string;
  ticketTypes: IEventerTicketType[];
}

interface IEventerTicketType {
  _id: string;
  name: string;
  originalName: string;
  description: string;
  demandPicture: boolean;
  multiGuestPricing: Record<string, unknown>;
  seatColor: string;
  order: number;
  areas: unknown[];
  price: number;
  saleRound: null;
  roundAmount: number;
  toDate: string;
  remaining: number;
  originalPrice: number;
  saleRounds: unknown[];
  isStandingOrder: boolean;
  standingOrderBillingFrequency: {
    amount: number;
    type: string;
  };
}
