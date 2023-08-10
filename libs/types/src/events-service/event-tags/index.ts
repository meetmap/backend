export interface ITag {
  id: string;
  cid: string;
  label: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISafeTag {
  label: string;
  cid: string;
}

export interface ISafeTagWithMetadata extends ISafeTag {
  count: number;
}
