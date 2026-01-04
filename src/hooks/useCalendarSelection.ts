import { useCallback, useEffect, useMemo, useState } from "react";

type ListingSelection = {
  anchorDate: string | null;
  startDate: string | null;
  endDate: string | null;
};

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
  const [selections, setSelections] = useState<Record<number, ListingSelection>>({});
  const [dragAnchorDate, setDragAnchorDate] = useState<string | null>(null);
  const [dragStartListingId, setDragStartListingId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const datesIndex = useMemo(() => {
    return new Map(dates.map((date, index) => [date, index]));
  }, [dates]);

  const clearSelection = useCallback(() => {
    setSelections({});
    setDragAnchorDate(null);
    setDragStartListingId(null);
    setIsDragging(false);
  }, []);

  const setRange = useCallback(
    (listingId: number, anchorDate: string, endDate: string) => {
      const range = resolveRange(datesIndex, anchorDate, endDate);
      setSelections((current) => ({
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
      const listingSelection = selections[listingId];
      const anchorDate = shiftKey && listingSelection?.anchorDate ? listingSelection.anchorDate : date;
      const range = resolveRange(datesIndex, anchorDate, date);

      setSelections((current) => ({
        ...current,
        [listingId]: {
          anchorDate,
          startDate: range.startDate,
          endDate: range.endDate,
        },
      }));
      setDragAnchorDate(anchorDate);
      setDragStartListingId(listingId);
      setIsDragging(true);
    },
    [datesIndex, selections]
  );

  const handleMouseEnter = useCallback(
    (listingId: number, date: string) => {
      if (!isDragging || !dragAnchorDate) {
        return;
      }

      setRange(listingId, dragAnchorDate, date);
      if (dragStartListingId != null && dragStartListingId !== listingId) {
        setRange(dragStartListingId, dragAnchorDate, date);
      }
    },
    [dragAnchorDate, dragStartListingId, isDragging, setRange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragAnchorDate(null);
    setDragStartListingId(null);
  }, []);

  const isDateSelected = useCallback(
    (listingId: number, date: string) => {
      const selection = selections[listingId];
      if (!selection?.startDate || !selection.endDate) {
        return false;
      }

      const startIndex = datesIndex.get(selection.startDate);
      const endIndex = datesIndex.get(selection.endDate);
      const dateIndex = datesIndex.get(date);

      if (startIndex == null || endIndex == null || dateIndex == null) {
        return false;
      }

      return dateIndex >= startIndex && dateIndex <= endIndex;
    },
    [datesIndex, selections]
  );

  const getSelectedDatesForListing = useCallback(
    (listingId: number) => {
      const selection = selections[listingId];
      if (!selection?.startDate || !selection.endDate) {
        return [];
      }

      const startIndex = datesIndex.get(selection.startDate);
      const endIndex = datesIndex.get(selection.endDate);

      if (startIndex == null || endIndex == null) {
        return [];
      }

      return dates.slice(startIndex, endIndex + 1);
    },
    [dates, datesIndex, selections]
  );

  const getSelectedListings = useCallback(() => {
    return Object.entries(selections)
      .map(([listingId, selection]) => ({
        listingId: Number(listingId),
        startDate: selection.startDate,
        endDate: selection.endDate,
        dates: getSelectedDatesForListing(Number(listingId)),
      }))
      .filter((selection) => selection.dates.length > 0);
  }, [getSelectedDatesForListing, selections]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleWindowMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, [isDragging]);

  return {
    selections,
    isDragging,
    clearSelection,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isDateSelected,
    getSelectedDatesForListing,
    getSelectedListings,
  };
}
