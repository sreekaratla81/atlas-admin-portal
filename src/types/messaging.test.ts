/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { parseVariablesFromBody } from "./messaging";

describe("parseVariablesFromBody", () => {
  it("returns empty array for empty string", () => {
    expect(parseVariablesFromBody("")).toEqual([]);
  });

  it("extracts single variable", () => {
    expect(parseVariablesFromBody("Hi {GuestFirstName}!")).toEqual(["GuestFirstName"]);
  });

  it("extracts multiple variables and deduplicates", () => {
    expect(parseVariablesFromBody("Hi {GuestFirstName}, check-in {CheckInDate} at {CheckInTime}. Bye {GuestFirstName}."))
      .toEqual(["GuestFirstName", "CheckInDate", "CheckInTime"]);
  });

  it("returns empty for no placeholders", () => {
    expect(parseVariablesFromBody("Plain text")).toEqual([]);
  });
});
