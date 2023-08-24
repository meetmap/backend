export interface ICachedEvent {
  cid: string;
  _id: string;
  description?: string;
  title: string;
  tags: ICachedTag[];
  //@todo change it back

  startTime: Date;
  endTime: Date;
  ageLimit: number;
  country: string;
  locality: string;
}

export interface ICachedTag {
  label: string;
  cid: string;
}
