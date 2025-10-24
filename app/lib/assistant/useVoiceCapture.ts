import { useCallback, useRef, useState } from "react";

interface VoiceCaptureOptions {
  interimHandler?: (transcript: string) => void;
}

interface VoiceCaptureResult {
  transcript?: string;
  audioBlob?: Blob;
  mimeType?: string;
}

interface VoiceCaptureHook {
  isRecording: boolean;
  recordingSupported: boolean;
  start: () => Promise<void>;
  stop: () => Promise<VoiceCaptureResult>;
  reset: () => void;
}

const isBrowser = typeof window !== "undefined";

// Check for Web Speech API support
const hasSpeechRecognition =
  isBrowser &&
  ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

// Check for MediaRecorder API support
const hasMediaRecorder = isBrowser && "MediaRecorder" in window;

export function useVoiceCapture(
  options: VoiceCaptureOptions = {}
): VoiceCaptureHook {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptRef = useRef<string>("");

  const recordingSupported = hasSpeechRecognition || hasMediaRecorder;

  const start = useCallback(async () => {
    if (!isBrowser) return;

    // Try Web Speech API first (browser-native transcription)
    if (hasSpeechRecognition) {
      try {
        const SpeechRecognitionAPI =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const results = Array.from(event.results);
          const transcript = results
            .map((result) => result[0].transcript)
            .join(" ");
          transcriptRef.current = transcript;
          options.interimHandler?.(transcript);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
        return;
      } catch {
        // Fall through to MediaRecorder
      }
    }

    // Fallback to MediaRecorder (requires server-side transcription)
    if (hasMediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
        const mediaRecorder = new MediaRecorder(stream, { mimeType });

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch {
        throw new Error(
          "Failed to access microphone. Please check permissions."
        );
      }
    }
  }, [options]);

  const stop = useCallback(async (): Promise<VoiceCaptureResult> => {
    setIsRecording(false);

    // Stop Web Speech API
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      const transcript = transcriptRef.current;
      recognitionRef.current = null;
      transcriptRef.current = "";
      return { transcript };
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current) {
      return new Promise((resolve) => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) {
          resolve({});
          return;
        }

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType,
          });
          audioChunksRef.current = [];

          // Stop all tracks
          recorder.stream.getTracks().forEach((track) => track.stop());

          mediaRecorderRef.current = null;
          resolve({ audioBlob, mimeType: recorder.mimeType });
        };

        recorder.stop();
      });
    }

    return {};
  }, []);

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    transcriptRef.current = "";
    audioChunksRef.current = [];
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    recordingSupported,
    start,
    stop,
    reset,
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  const SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  const webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
}
