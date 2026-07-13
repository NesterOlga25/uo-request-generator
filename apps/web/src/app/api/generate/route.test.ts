import { describe, expect, it } from "vitest";
import { POST } from "./route";

function expectApiError(payload: unknown, expected: { code: string; message: string }): void {
  if (typeof payload !== "object" || payload === null || !("error" in payload)) {
    throw new Error("Expected an API error object");
  }

  const apiError = payload.error;
  if (
    typeof apiError !== "object" ||
    apiError === null ||
    !("requestId" in apiError) ||
    typeof apiError.requestId !== "string"
  ) {
    throw new Error("Expected an API error with a request ID");
  }

  expect(payload).toEqual({
    error: {
      ...expected,
      requestId: apiError.requestId,
    },
  });
  expect(apiError.requestId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
}

describe("POST /api/generate", () => {
  it("returns the controlled provider error in the public API format", async () => {
    const request = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "На лестничной площадке не горит свет",
      }),
    });

    const response = await POST(request);
    const payload: unknown = await response.json();

    expect(response.status).toBe(503);
    expectApiError(payload, {
      code: "generation_provider_unavailable",
      message: "Генерация пока не подключена",
    });
  });

  it("returns a validation error for invalid input", async () => {
    const request = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: "Течь" }),
    });

    const response = await POST(request);
    const payload: unknown = await response.json();

    expect(response.status).toBe(400);
    expectApiError(payload, {
      code: "validation_error",
      message: "Проверьте формат и содержание запроса",
    });
  });
});
