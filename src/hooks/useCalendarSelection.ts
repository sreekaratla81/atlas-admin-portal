import { useCallback, useEffect, useMemo, useState } from "react";

type SelectionState = {
  listingId: number | null;
  ratePlanId: number | null;
  anchorDate: string | null;
  startDate: string | null;
  endDate: string | null;
};

const emptySelection: SelectionState = {
  listingId: null,
  ratePlanId: null,
  anchorDate: null,
  startDate: null,
  endDate: null,
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
  const [selection, setSelection] = useState<SelectionState>(emptySelection);
  const [isDragging, setIsDragging] = useState(false);

  const datesIndex = useMemo(() => {
    return new Map(dates.map((date, index) => [date, index]));
  }, [dates]);

  const clearSelection = useCallback(() => {
    setSelection(emptySelection);
    setIsDragging(false);
  }, []);

  const setRange = useCallback(
    (listingId: number, ratePlanId: number | null, anchorDate: string, endDate: string) => {
      const range = resolveRange(datesIndex, anchorDate, endDate);
      setSelection({
        listingId,
        ratePlanId,
        anchorDate,
        startDate: range.startDate,
        endDate: range.endDate,
      });
    },
    [datesIndex]
  );

  const handleMouseDown = useCallback(
    (listingId: number, ratePlanId: number | null, date: string, shiftKey: boolean) => {
      if (
        shiftKey &&
        selection.anchorDate &&
        selection.listingId === listingId &&
        selection.ratePlanId === ratePlanId
      ) {
        setRange(listingId, ratePlanId, selection.anchorDate, date);
        setIsDragging(false);
        return;
      }

      setSelection({
        listingId,
        ratePlanId,
        anchorDate: date,
        startDate: date,
        endDate: date,
      });
      setIsDragging(true);
    },
    [selection.anchorDate, selection.listingId, selection.ratePlanId, setRange]
  );

  const handleMouseEnter = useCallback(
    (listingId: number, ratePlanId: number | null, date: string) => {
      if (
        !isDragging ||
        selection.listingId !== listingId ||
        selection.ratePlanId !== ratePlanId ||
        !selection.anchorDate
      ) {
        return;
      }

      setRange(listingId, ratePlanId, selection.anchorDate, date);
    },
    [isDragging, selection.anchorDate, selection.listingId, selection.ratePlanId, setRange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const isDateSelected = useCallback(
    (listingId: number, ratePlanId: number | null, date: string) => {
      if (
        selection.listingId !== listingId ||
        selection.ratePlanId !== ratePlanId ||
        !selection.startDate ||
        !selection.endDate
      ) {
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
    [datesIndex, selection.endDate, selection.listingId, selection.startDate]
  );

  const getSelectedDatesForRow = useCallback(
    (listingId: number, ratePlanId: number | null) => {
      if (
        selection.listingId !== listingId ||
        selection.ratePlanId !== ratePlanId ||
        !selection.startDate ||
        !selection.endDate
      ) {
        return [];
      }

      const startIndex = datesIndex.get(selection.startDate);
      const endIndex = datesIndex.get(selection.endDate);

      if (startIndex == null || endIndex == null) {
        return [];
      }

      return dates.slice(startIndex, endIndex + 1);
    },
    [dates, datesIndex, selection.endDate, selection.listingId, selection.ratePlanId, selection.startDate]
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
    getSelectedDatesForRow,
  };
}
