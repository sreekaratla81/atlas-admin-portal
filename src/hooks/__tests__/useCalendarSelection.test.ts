/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useCalendarSelection from "../useCalendarSelection";

const dates = [
  "2024-01-01",
  "2024-01-02",
  "2024-01-03",
  "2024-01-04",
  "2024-01-05",
];

describe("useCalendarSelection", () => {
  it("selects a single date on click", () => {
    const { result } = renderHook(() => useCalendarSelection(dates));

    act(() => {
      result.current.handleMouseDown(10, "2024-01-03", false);
      result.current.handleMouseUp();
    });

    expect(result.current.getSelectedDatesForListing(10)).toEqual(["2024-01-03"]);
  });

  it("selects a shift range from the anchor date", () => {
    const { result } = renderHook(() => useCalendarSelection(dates));

    act(() => {
      result.current.handleMouseDown(10, "2024-01-02", false);
      result.current.handleMouseUp();
    });

    act(() => {
      result.current.handleMouseDown(10, "2024-01-05", true);
    });

    expect(result.current.getSelectedDatesForListing(10)).toEqual([
      "2024-01-02",
      "2024-01-03",
      "2024-01-04",
      "2024-01-05",
    ]);
  });

  it("selects a drag range as the cursor moves", () => {
    const { result } = renderHook(() => useCalendarSelection(dates));

    act(() => {
      result.current.handleMouseDown(10, "2024-01-01", false);
    });

    act(() => {
      result.current.handleMouseEnter(10, "2024-01-04");
      result.current.handleMouseUp();
    });

    expect(result.current.getSelectedDatesForListing(10)).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
      "2024-01-04",
    ]);
  });

  it("tracks selections for multiple listings", () => {
    const { result } = renderHook(() => useCalendarSelection(dates));

    act(() => {
      result.current.handleMouseDown(10, "2024-01-02", false);
      result.current.handleMouseUp();
    });

    act(() => {
      result.current.handleMouseDown(11, "2024-01-04", true);
      result.current.handleMouseUp();
    });

    expect(result.current.getSelectedDatesForListing(10)).toEqual(["2024-01-02"]);
    expect(result.current.getSelectedDatesForListing(11)).toEqual(["2024-01-04"]);
    expect(result.current.getSelectedListings()).toEqual([
      { listingId: 10, startDate: "2024-01-02", endDate: "2024-01-02", dates: ["2024-01-02"] },
      { listingId: 11, startDate: "2024-01-04", endDate: "2024-01-04", dates: ["2024-01-04"] },
    ]);
  });

  it("allows dragging across rows using the same anchor", () => {
    const { result } = renderHook(() => useCalendarSelection(dates));

    act(() => {
      result.current.handleMouseDown(10, "2024-01-01", false);
    });

    act(() => {
      result.current.handleMouseEnter(11, "2024-01-03");
      result.current.handleMouseUp();
    });

    expect(result.current.getSelectedDatesForListing(10)).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
    ]);
    expect(result.current.getSelectedDatesForListing(11)).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
    ]);
  });
});
