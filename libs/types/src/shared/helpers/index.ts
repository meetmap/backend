export type WithoutDocFields<
  A extends {
    createdAt: Date;
    updatedAt: Date;
    id: string;
  },
> = Omit<A, 'createdAt' | 'updatedAt' | 'id'>;
