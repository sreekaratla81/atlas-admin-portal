import { describe, it, expect } from "vitest";
import { buildBulkBlockPayload, buildBulkPricePayload } from "../availability";

describe("availability payload builders", () => {
  it("builds bulk block payload with defaults", () => {
    const payload = buildBulkBlockPayload({
      listingId: 12,
      dates: ["2024-01-01", "2024-01-02"],
    });

    expect(payload).toEqual({
      listingIds: [12],
      startDate: "2024-01-01",
      endDate: "2024-01-02",
      status: "blocked",
      blockType: "Maintenance",
    });
  });

  it("builds bulk block payload for unblocking", () => {
    const payload = buildBulkBlockPayload({
      listingId: 12,
      dates: ["2024-01-03"],
      blockType: "OwnerHold",
      unblock: true,
    });

    expect(payload).toEqual({
      listingIds: [12],
      startDate: "2024-01-03",
      endDate: "2024-01-03",
      status: "open",
      blockType: undefined,
    });
  });

  it("builds bulk price payload", () => {
    const payload = buildBulkPricePayload({
      listingId: 7,
      dates: ["2024-02-01", "2024-02-02"],
      nightlyPrice: 2500,
    });

    expect(payload).toEqual({
      listingIds: [7],
      startDate: "2024-02-01",
      endDate: "2024-02-02",
      price: 2500,
    });
  });
});
