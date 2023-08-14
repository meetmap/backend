export interface ICachedEvent {
  cid: string;
  _id: string;
  description?: string;
  title: string;
  tags: ICachedTag[];
}

export interface ICachedTag {
  label: string;
  cid: string;
}
