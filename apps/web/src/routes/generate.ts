import { randomUUID } from "node:crypto";
import { generateRequestInputSchema, type LlmGateway } from "@uo-request-generator/core";
import { GenerationProviderUnavailableError } from "@uo-request-generator/llm";
import type { FastifyInstance, FastifyReply } from "fastify";

type ApiErrorCode = "generation_provider_unavailable" | "internal_error" | "validation_error";

type ApiError = {
  code: ApiErrorCode;
  message: string;
  statusCode: 400 | 500 | 503;
};

const validationApiError: ApiError = {
  code: "validation_error",
  message: "Проверьте формат и содержание запроса",
  statusCode: 400,
};

const providerUnavailableApiError: ApiError = {
  code: "generation_provider_unavailable",
  message: "Генерация пока не подключена",
  statusCode: 503,
};

const internalApiError: ApiError = {
  code: "internal_error",
  message: "Не удалось составить заявку",
  statusCode: 500,
};

function sendApiError(reply: FastifyReply, apiError: ApiError): FastifyReply {
  return reply.code(apiError.statusCode).send({
    error: {
      code: apiError.code,
      message: apiError.message,
      requestId: randomUUID(),
    },
  });
}

export function registerGenerateRoute(app: FastifyInstance, llmGateway: LlmGateway): void {
  app.post(
    "/api/generate",
    {
      errorHandler(error, _request, reply) {
        // Fastify отклоняет некорректный JSON до вызова основного обработчика.
        if (error.code === "FST_ERR_CTP_INVALID_JSON_BODY") {
          return sendApiError(reply, validationApiError);
        }

        return sendApiError(reply, internalApiError);
      },
    },
    async (request, reply) => {
      const inputValidation = generateRequestInputSchema.safeParse(request.body);

      if (!inputValidation.success) {
        return sendApiError(reply, validationApiError);
      }

      try {
        return await llmGateway.generateRequest(inputValidation.data);
      } catch (error) {
        if (error instanceof GenerationProviderUnavailableError) {
          return sendApiError(reply, providerUnavailableApiError);
        }

        throw error;
      }
    },
  );
}
