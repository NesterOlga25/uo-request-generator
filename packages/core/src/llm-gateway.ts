import type { GenerateRequestInput, GenerateRequestResult } from "./contracts";

export interface LlmGateway {
  generateRequest(input: GenerateRequestInput): Promise<GenerateRequestResult>;
}
