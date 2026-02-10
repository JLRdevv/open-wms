export const parseIncludeQuery = <T>(include: (keyof T)[] = []) => {
  return include.reduce((acc, curr) => {
    (acc as any)[curr] = true;
    return acc;
  }, {} as T);
};
