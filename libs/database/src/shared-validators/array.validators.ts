export const arrayMaxLength = (limit: number) => {
  return (value: any[]) => {
    return value.length <= limit;
  };
};
