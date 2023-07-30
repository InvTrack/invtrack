// TODO this could be improved by creating a recordIds cache
export const useRecordPagination = (
  recordId: number | undefined,
  recordIds: (number | null)[] | undefined
): {
  nextRecordId: number | undefined;
  prevRecordId: number | undefined;
  isLast: boolean;
  isFirst: boolean;
} => {
  if (
    !recordIds ||
    recordIds.length === 0 ||
    recordIds.some((id) => id === null)
  ) {
    return {
      nextRecordId: undefined,
      prevRecordId: undefined,
      isLast: false,
      isFirst: false,
    };
  }

  const numberRecordIds: number[] = recordIds as number[];

  if (numberRecordIds.length === 0) {
    return {
      nextRecordId: undefined,
      prevRecordId: undefined,
      isLast: false,
      isFirst: false,
    };
  }

  const index = numberRecordIds.findIndex((id) => id === recordId);
  const isLast = index === numberRecordIds.length - 1;
  const isFirst = index === 0;

  const nextRecordId = isLast ? undefined : numberRecordIds[index + 1];
  const prevRecordId = isFirst ? undefined : numberRecordIds[index - 1];

  return {
    nextRecordId,
    prevRecordId,
    isLast,
    isFirst,
  };
};
