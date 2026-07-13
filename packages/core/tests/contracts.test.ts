import { describe, expect, it } from "vitest";
import {
  generateRequestInputSchema,
  generateRequestLimits,
  generateRequestResultSchema,
} from "../src";

describe("generateRequestInputSchema", () => {
  it("accepts a valid description", () => {
    const result = generateRequestInputSchema.safeParse({
      description: "На лестничной площадке не горит свет",
      location: "Третий этаж",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a description shorter than the minimum", () => {
    const result = generateRequestInputSchema.safeParse({
      description: "Течь",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a description longer than the maximum without truncating it", () => {
    const description = "а".repeat(generateRequestLimits.description.max + 1);
    const result = generateRequestInputSchema.safeParse({ description });

    expect(result.success).toBe(false);
    expect(description).toHaveLength(generateRequestLimits.description.max + 1);
  });

  it("rejects a location longer than the maximum", () => {
    const result = generateRequestInputSchema.safeParse({
      description: "На лестничной площадке не горит свет",
      location: "а".repeat(generateRequestLimits.location.max + 1),
    });

    expect(result.success).toBe(false);
  });
});

describe("generateRequestResultSchema", () => {
  it("accepts a valid generation result", () => {
    const result = generateRequestResultSchema.safeParse({
      title: "Не работает освещение на этаже",
      body: "На лестничной площадке не горит свет. Прошу: проверить и восстановить освещение.",
      warnings: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid generation result", () => {
    const result = generateRequestResultSchema.safeParse({
      title: "а".repeat(generateRequestLimits.result.titleMax + 1),
      body: "Прошу проверить проблему.",
      warnings: [],
    });

    expect(result.success).toBe(false);
  });
});
