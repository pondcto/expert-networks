import {
  AssistantQueryRequest,
  AssistantQueryResponse,
  TranscribeRequest,
  TranscribeResponse,
} from "./types";

interface RequestOptions {
  baseUrl?: string;
  signal?: AbortSignal;
}

const DEFAULT_BASE_URL = "/api/assistant";

export async function queryAssistant(
  payload: AssistantQueryRequest,
  options: RequestOptions = {}
): Promise<AssistantQueryResponse> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const url = `${baseUrl}/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Assistant query failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function transcribeAudio(
  payload: TranscribeRequest,
  options: RequestOptions = {}
): Promise<TranscribeResponse> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const url = `${baseUrl}/transcribe`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Transcription failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
