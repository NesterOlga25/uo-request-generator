import { generateRequestInputSchema } from "@uo-request-generator/core";
import { DisabledLlmGateway, GenerationProviderUnavailableError } from "@uo-request-generator/llm";

type ApiErrorCode = "generation_provider_unavailable" | "validation_error";

function errorResponse(
  code: ApiErrorCode,
  message: string,
  requestId: string,
  status: number,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
        requestId,
      },
    },
    { status },
  );
}

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return errorResponse(
      "validation_error",
      "Проверьте формат и содержание запроса",
      requestId,
      400,
    );
  }

  const parsedInput = generateRequestInputSchema.safeParse(payload);
  if (!parsedInput.success) {
    return errorResponse(
      "validation_error",
      "Проверьте формат и содержание запроса",
      requestId,
      400,
    );
  }

  const gateway = new DisabledLlmGateway();

  try {
    const result = await gateway.generateRequest(parsedInput.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof GenerationProviderUnavailableError) {
      return errorResponse(
        "generation_provider_unavailable",
        "Генерация пока не подключена",
        requestId,
        503,
      );
    }

    return errorResponse(
      "generation_provider_unavailable",
      "Генерация пока не подключена",
      requestId,
      503,
    );
  }
}
