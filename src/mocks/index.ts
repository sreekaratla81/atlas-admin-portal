import { setupAvailabilityMocks } from "./availability";
import { api } from "@/lib/api";

export const setupMocks = () => {
  setupAvailabilityMocks(api);
};
