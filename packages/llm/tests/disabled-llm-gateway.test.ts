import { describe, expect, it } from "vitest";
import { DisabledLlmGateway, GenerationProviderUnavailableError } from "../src";

describe("DisabledLlmGateway", () => {
  it("rejects generation with a controlled infrastructure error", async () => {
    const gateway = new DisabledLlmGateway();

    await expect(
      gateway.generateRequest({
        description: "На лестничной площадке не горит свет",
      }),
    ).rejects.toBeInstanceOf(GenerationProviderUnavailableError);
  });
});
