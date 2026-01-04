import { setupAvailabilityMocks } from "./availability";
import { api } from "@/lib/api";

export const setupMocks = () => {
  const teardownFns: Array<() => void> = [];

  const availabilityCleanup = setupAvailabilityMocks(api);
  if (availabilityCleanup) {
    teardownFns.push(availabilityCleanup);
  }

  return () => {
    teardownFns.forEach((teardown) => teardown());
  };
};
