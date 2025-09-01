import { expect, test } from "vitest";
import routes from "@/router/routes";

test("routes is an array with path+element", () => {
  expect(Array.isArray(routes)).toBe(true);
  routes.forEach((r) => {
    expect(typeof r.path).toBe("string");
    expect(r.element).toBeTruthy();
  });
});
