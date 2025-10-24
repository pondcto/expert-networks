export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantContext {
  route?: string;
  extra?: {
    viewport?: {
      width: number;
      height: number;
    };
    [key: string]: unknown;
  };
}

export interface AssistantCTA {
  id: string;
  label: string;
  payload?: Record<string, unknown>;
}

export interface AssistantQueryRequest {
  message: string;
  context?: AssistantContext;
}

export interface AssistantQueryResponse {
  reply: AssistantMessage;
  ctas?: AssistantCTA[];
}

export interface TranscribeRequest {
  audioBase64: string;
  mimeType: string;
  language?: string;
}

export interface TranscribeResponse {
  text: string;
}
