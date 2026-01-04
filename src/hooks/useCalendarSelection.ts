import { useCallback, useEffect, useMemo, useState } from "react";

type ListingSelection = {
  anchorDate: string | null;
  startDate: string | null;
  endDate: string | null;
};

type SelectionState = Record<number, ListingSelection>;

const resolveRange = (
  datesIndex: Map<string, number>,
  startDate: string | null,
  endDate: string | null
) => {
  if (!startDate || !endDate) {
    return { startDate, endDate };
  }

  const startIndex = datesIndex.get(startDate);
  const endIndex = datesIndex.get(endDate);

  if (startIndex == null || endIndex == null) {
    return { startDate, endDate };
  }

  if (startIndex <= endIndex) {
    return { startDate, endDate };
  }

  return { startDate: endDate, endDate: startDate };
};

export default function useCalendarSelection(dates: string[]) {
  const [selection, setSelection] = useState<SelectionState>({});
  const [isDragging, setIsDragging] = useState(false);

  const datesIndex = useMemo(() => {
    return new Map(dates.map((date, index) => [date, index]));
  }, [dates]);

  const clearSelection = useCallback(() => {
    setSelection({});
    setIsDragging(false);
  }, []);

  const setRange = useCallback(
    (listingId: number, anchorDate: string, endDate: string) => {
      const range = resolveRange(datesIndex, anchorDate, endDate);
      setSelection((current) => ({
        ...current,
        [listingId]: {
          anchorDate,
          startDate: range.startDate,
          endDate: range.endDate,
        },
      }));
    },
    [datesIndex]
  );

  const handleMouseDown = useCallback(
    (listingId: number, date: string, shiftKey: boolean) => {
      const existingSelection = selection[listingId];

      if (shiftKey && existingSelection?.anchorDate) {
        setRange(listingId, existingSelection.anchorDate, date);
        setIsDragging(false);
        return;
      }

      setSelection((current) => ({
        ...current,
        [listingId]: {
          anchorDate: date,
          startDate: date,
          endDate: date,
        },
      }));
      setIsDragging(true);
    },
    [selection, setRange]
  );

  const handleMouseEnter = useCallback(
    (listingId: number, date: string) => {
      if (!isDragging) {
        return;
      }

      setSelection((current) => {
        const listingSelection = current[listingId];
        const anchorDate = listingSelection?.anchorDate ?? date;
        const range = resolveRange(datesIndex, anchorDate, date);

        return {
          ...current,
          [listingId]: {
            anchorDate,
            startDate: range.startDate,
            endDate: range.endDate,
          },
        };
      });
    },
    [datesIndex, isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const isDateSelected = useCallback(
    (listingId: number, date: string) => {
      const listingSelection = selection[listingId];

      if (!listingSelection?.startDate || !listingSelection?.endDate) {
        return false;
      }

      const startIndex = datesIndex.get(listingSelection.startDate);
      const endIndex = datesIndex.get(listingSelection.endDate);
      const dateIndex = datesIndex.get(date);

      if (startIndex == null || endIndex == null || dateIndex == null) {
        return false;
      }

      return dateIndex >= startIndex && dateIndex <= endIndex;
    },
    [datesIndex, selection]
  );

  const getSelectedDatesForListing = useCallback(
    (listingId: number) => {
      const listingSelection = selection[listingId];

      if (!listingSelection?.startDate || !listingSelection?.endDate) {
        return [];
      }

      const startIndex = datesIndex.get(listingSelection.startDate);
      const endIndex = datesIndex.get(listingSelection.endDate);

      if (startIndex == null || endIndex == null) {
        return [];
      }

      return dates.slice(startIndex, endIndex + 1);
    },
    [dates, datesIndex, selection]
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleWindowMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, [isDragging]);

  return {
    selection,
    isDragging,
    clearSelection,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isDateSelected,
    getSelectedDatesForListing,
  };
}
