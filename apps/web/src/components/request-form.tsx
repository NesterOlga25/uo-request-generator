"use client";

import {
  generateRequestLimits,
  generateRequestResultSchema,
  type GenerateRequestResult,
} from "@uo-request-generator/core";
import type { FormEvent } from "react";
import { useState } from "react";

function readErrorMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null || !("error" in payload)) {
    return undefined;
  }

  const error = payload.error;
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return undefined;
  }

  return typeof error.message === "string" ? error.message : undefined;
}

export function RequestForm() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateRequestResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    const normalizedLocation = location.trim();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          location: normalizedLocation || undefined,
        }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(readErrorMessage(payload) ?? "Не удалось составить заявку");
        return;
      }

      const parsedResult = generateRequestResultSchema.safeParse(payload);
      if (!parsedResult.success) {
        setError("Сервис вернул некорректный результат");
        return;
      }

      setResult(parsedResult.data);
    } catch {
      setError("Не удалось связаться с сервисом. Попробуйте позже");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="request-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="description">Описание проблемы</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            minLength={generateRequestLimits.description.min}
            maxLength={generateRequestLimits.description.max}
            rows={7}
            required
            aria-describedby="description-hint description-count"
          />
          <div className="field-meta">
            <span id="description-hint">Опишите одну проблему обычными словами</span>
            <span id="description-count" aria-live="polite">
              {description.length} / {generateRequestLimits.description.max}
            </span>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="location">Где это произошло</label>
          <input
            id="location"
            name="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={generateRequestLimits.location.max}
            aria-describedby="location-hint"
          />
          <span id="location-hint" className="field-hint">
            Необязательно, например: подъезд или этаж
          </span>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Составляем…" : "Составить заявку"}
        </button>
      </form>

      <div className="message-area" aria-live="polite">
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <section className="result-area" aria-labelledby="result-title">
        <h2 id="result-title">Готовая заявка</h2>
        {result ? (
          <div className="result-content">
            <h3>{result.title}</h3>
            <p>{result.body}</p>
          </div>
        ) : (
          <p>Здесь появится результат после успешной генерации.</p>
        )}
      </section>

      <p className="service-note">
        Генерация через LLM пока не подключена. Форма вернёт контролируемую ошибку.
      </p>
    </>
  );
}
