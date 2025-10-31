"use client";

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { queryAssistant, transcribeAudio } from "../../lib/assistant/assistantClient";
import { useVoiceCapture } from "../../lib/assistant/useVoiceCapture";
import {
  AssistantCTA,
  AssistantContext,
  AssistantMessage,
  AssistantQueryRequest,
  AssistantQueryResponse,
} from "../../lib/assistant/types";
import { useAssistant } from "./AssistantProvider";
import { useTheme } from "../../providers/theme-provider";

const MIN_MARGIN = 16;
const COLLAPSED_MIN_BOTTOM = 8;
const OPEN_MIN_BOTTOM = 24;
const DOCK_THRESHOLD = 120;
const DOCKED_OFFSET = 0;
const DOCK_SNAP_DISTANCE = 72;

const DOCKED_COLLAPSED_SIZE = { width: 176, height: 58 } as const;
const FLOATING_COLLAPSED_SIZE = { width: 188, height: 74 } as const;

const INITIAL_DIMENSIONS = { width: 420, height: 520 } as const;
const MIN_DIMENSIONS = { width: 408, height: 400 } as const;
const MAX_DIMENSIONS = { width: 720, height: 720 } as const;
const INITIAL_OFFSET = { right: MIN_MARGIN, bottom: DOCKED_OFFSET } as const;

type Offset = { right: number; bottom: number };

type PanelSize = { width: number; height: number };

type DragState = {
  type: "open" | "collapsed";
  startX: number;
  startY: number;
  startOffset: Offset;
  size: PanelSize;
};

type ResizeDirection =
  | "right"
  | "bottom"
  | "bottom-right"
  | "left"
  | "top"
  | "top-left"
  | "top-right"
  | "bottom-left";

type ResizeState = {
  startX: number;
  startY: number;
  startSize: PanelSize;
  startOffset: Offset;
  direction: ResizeDirection;
};

interface ConversationEntry extends AssistantMessage {
  id: string;
  timestamp: number;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result.split(",")[1] ?? reader.result;
        resolve(base64);
      } else {
        reject(new Error("Failed to read audio data."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read audio data."));
    reader.readAsDataURL(blob);
  });
}

export function FloatingAssistant() {
  const { config, triggerAction } = useAssistant();
  const { theme } = useTheme();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [panelSize, setPanelSize] = useState<PanelSize>(INITIAL_DIMENSIONS);
  const [offset, setOffset] = useState<Offset>(INITIAL_OFFSET);
  const [isDocked, setIsDocked] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [ctas, setCtas] = useState<AssistantCTA[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const collapsedButtonRef = useRef<HTMLButtonElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const offsetRef = useRef<Offset>(INITIAL_OFFSET);
  const lastOpenOffsetRef = useRef<Offset>(INITIAL_OFFSET);
  const dragMovedRef = useRef(false);
  const suppressClickRef = useRef(false);

  const voiceCapture = useVoiceCapture({
    interimHandler: transcript => setInputValue(transcript),
  });
  const baseUrl = useMemo(() => config.apiBaseUrl, [config.apiBaseUrl]);

  const clamp = useCallback((value: number, min: number, max: number) => Math.min(Math.max(value, min), max), []);

  const clampOffsetForSize = useCallback(
    (proposed: Offset, size: PanelSize, minBottom: number) => {
      if (typeof window === "undefined") {
        return {
          right: Math.max(MIN_MARGIN, proposed.right),
          bottom: Math.max(minBottom, proposed.bottom),
        };
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const minRight = MIN_MARGIN;
      const maxRight = Math.max(minRight, viewportWidth - size.width - MIN_MARGIN);
      const maxBottom = Math.max(minBottom, viewportHeight - size.height - MIN_MARGIN);

      return {
        right: clamp(proposed.right, minRight, maxRight),
        bottom: clamp(proposed.bottom, minBottom, maxBottom),
      };
    },
    [clamp],
  );

  const getPanelSize = useCallback((): PanelSize => {
    return {
      width: containerRef.current?.offsetWidth ?? panelSize.width,
      height: containerRef.current?.offsetHeight ?? panelSize.height,
    };
  }, [panelSize.height, panelSize.width]);

  const getCollapsedSize = useCallback(
    (dockedOverride?: boolean): PanelSize => {
      if (collapsedButtonRef.current) {
        return {
          width: collapsedButtonRef.current.offsetWidth,
          height: collapsedButtonRef.current.offsetHeight,
        };
      }
      const targetDocked = dockedOverride ?? isDocked;
      return targetDocked ? DOCKED_COLLAPSED_SIZE : FLOATING_COLLAPSED_SIZE;
    },
    [isDocked],
  );

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    if (!isOpen) return;

    const clamped = clampOffsetForSize(lastOpenOffsetRef.current, getPanelSize(), OPEN_MIN_BOTTOM);
    setOffset(clamped);
    setIsDocked(false);
  }, [clampOffsetForSize, getPanelSize, isOpen]);

  useEffect(() => {
    if (!isOpen || isDragging || isResizing) return;
    const clamped = clampOffsetForSize(offset, getPanelSize(), OPEN_MIN_BOTTOM);
    lastOpenOffsetRef.current = clamped;
  }, [clampOffsetForSize, getPanelSize, isDragging, isOpen, isResizing, offset]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state) return;

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      const moved = Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;
      if (!dragMovedRef.current && moved) {
        dragMovedRef.current = true;
        if (state.type === "collapsed" && isDocked) {
          setIsDocked(false);
        }
      }

      const minBottom =
        state.type === "collapsed"
          ? isDocked
            ? DOCKED_OFFSET
            : COLLAPSED_MIN_BOTTOM
          : OPEN_MIN_BOTTOM;

      const proposed = {
        right: state.startOffset.right - deltaX,
        bottom: state.startOffset.bottom - deltaY,
      };

      setOffset(clampOffsetForSize(proposed, state.size, minBottom));
    };

    const handlePointerUp = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state) return;

      dragStateRef.current = null;
      setIsDragging(false);

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      const proposed = {
        right: state.startOffset.right - deltaX,
        bottom: state.startOffset.bottom - deltaY,
      };

      if (state.type === "collapsed") {
        const collapsedBounds = clampOffsetForSize(proposed, state.size, COLLAPSED_MIN_BOTTOM);

        const proximityDock = collapsedBounds.bottom <= DOCK_SNAP_DISTANCE;
        const pointerDock =
          typeof window !== "undefined" ? event.clientY >= window.innerHeight - DOCK_THRESHOLD : false;
        const shouldDock = proximityDock || pointerDock;

        const dockSize: PanelSize = {
          width: DOCKED_COLLAPSED_SIZE.width,
          height: DOCKED_COLLAPSED_SIZE.height,
        };

        const nextCollapsedOffset: Offset = shouldDock
          ? (() => {
              const dockBounds = clampOffsetForSize(
                { right: collapsedBounds.right, bottom: DOCKED_OFFSET },
                dockSize,
                DOCKED_OFFSET,
              );
              return { right: dockBounds.right, bottom: DOCKED_OFFSET };
            })()
          : {
              right: collapsedBounds.right,
              bottom: Math.max(collapsedBounds.bottom, COLLAPSED_MIN_BOTTOM),
            };

        const anchorForOpen = clampOffsetForSize(
          {
            right: nextCollapsedOffset.right,
            bottom: Math.max(nextCollapsedOffset.bottom, OPEN_MIN_BOTTOM),
          },
          getPanelSize(),
          OPEN_MIN_BOTTOM,
        );

        lastOpenOffsetRef.current = anchorForOpen;
        setIsDocked(shouldDock);
        setOffset(nextCollapsedOffset);
      } else {
        const panelBounds = clampOffsetForSize(proposed, getPanelSize(), OPEN_MIN_BOTTOM);
        lastOpenOffsetRef.current = panelBounds;
        setIsDocked(false);
        setOffset(panelBounds);
      }

      if (dragMovedRef.current) {
        suppressClickRef.current = true;
        requestAnimationFrame(() => {
          suppressClickRef.current = false;
        });
      } else {
        suppressClickRef.current = false;
      }

      dragMovedRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [clampOffsetForSize, getPanelSize, isDocked, isDragging]);

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || typeof window === "undefined") return;

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const leftStart = viewportWidth - state.startOffset.right - state.startSize.width;
      const topStart = viewportHeight - state.startOffset.bottom - state.startSize.height;

      const includesLeft = state.direction === "left" || state.direction === "top-left" || state.direction === "bottom-left";
      const includesRight = state.direction === "right" || state.direction === "top-right" || state.direction === "bottom-right";
      const includesTop = state.direction === "top" || state.direction === "top-left" || state.direction === "top-right";
      const includesBottom = state.direction === "bottom" || state.direction === "bottom-left" || state.direction === "bottom-right";

      let left = leftStart;
      let top = topStart;
      let width = state.startSize.width;
      let height = state.startSize.height;

      if (includesLeft) {
        const minLeft = MIN_MARGIN;
        const maxLeft = leftStart + state.startSize.width - MIN_DIMENSIONS.width;
        const newLeft = clamp(leftStart + deltaX, minLeft, Math.max(minLeft, maxLeft));
        width = state.startSize.width + (leftStart - newLeft);
        left = newLeft;
      }

      if (includesRight) {
        const maxWidth = Math.min(MAX_DIMENSIONS.width, viewportWidth - left - MIN_MARGIN);
        width = clamp(width + deltaX, MIN_DIMENSIONS.width, maxWidth);
      }

      if (includesTop) {
        const minTop = MIN_MARGIN;
        const maxTop = topStart + state.startSize.height - MIN_DIMENSIONS.height;
        const newTop = clamp(topStart + deltaY, minTop, Math.max(minTop, maxTop));
        height = state.startSize.height + (topStart - newTop);
        top = newTop;
      }

      if (includesBottom) {
        const maxHeight = Math.min(MAX_DIMENSIONS.height, viewportHeight - top - OPEN_MIN_BOTTOM);
        height = clamp(height + deltaY, MIN_DIMENSIONS.height, maxHeight);
      }

      const nextSize = {
        width: width,
        height: height,
      };

      const rawOffset: Offset = {
        right: viewportWidth - left - width,
        bottom: viewportHeight - top - height,
      };

      setPanelSize(nextSize);

      const clampedOffset = clampOffsetForSize(rawOffset, nextSize, OPEN_MIN_BOTTOM);
      setOffset(clampedOffset);
      lastOpenOffsetRef.current = clampedOffset;
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      resizeStateRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [clamp, clampOffsetForSize, isResizing]);

  const closeAssistant = useCallback(() => {
    lastOpenOffsetRef.current = offsetRef.current;
    setIsOpen(false);
    setIsDocked(true);

    const collapsedBounds = clampOffsetForSize(
      { right: offsetRef.current.right, bottom: DOCKED_OFFSET },
      getCollapsedSize(true),
      DOCKED_OFFSET,
    );

    setOffset({ right: collapsedBounds.right, bottom: DOCKED_OFFSET });
    abortRef.current?.abort();
    voiceCapture.reset();
    setConversation([]);
    setCtas([]);
    setInputValue("");
    setError(null);
    setIsTranscribing(false);
  }, [clampOffsetForSize, getCollapsedSize, voiceCapture]);

  const startDrag = useCallback(
    (type: DragState["type"], event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      const element = type === "open" ? containerRef.current : collapsedButtonRef.current;
      if (!element) return;

      element.setPointerCapture?.(event.pointerId);

      dragMovedRef.current = false;
      suppressClickRef.current = false;

      const size =
        type === "open"
          ? getPanelSize()
          : {
              width: element.offsetWidth || getCollapsedSize().width,
              height: element.offsetHeight || getCollapsedSize().height,
            };

      dragStateRef.current = {
        type,
        startX: event.clientX,
        startY: event.clientY,
      startOffset: offsetRef.current,
      size,
    };
    setIsDragging(true);
  },
  [getCollapsedSize, getPanelSize],
);

  const handleHeaderPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => startDrag("open", event),
    [startDrag],
  );

  const handleCollapsedPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => startDrag("collapsed", event),
    [startDrag],
  );

  const handleResizePointerDown = useCallback(
    (direction: ResizeDirection) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        resizeStateRef.current = {
          startX: event.clientX,
          startY: event.clientY,
          startSize: getPanelSize(),
          startOffset: offsetRef.current,
          direction,
        };
        setIsResizing(true);
      },
    [getPanelSize],
  );

  const buildContext = useCallback((): AssistantContext => {
    const context: AssistantContext = { route: pathname ?? undefined };
    if (typeof window !== "undefined") {
      context.extra = {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };
    }
    return context;
  }, [pathname]);

  const appendMessage = useCallback((message: AssistantMessage) => {
    setConversation(prev => [
      ...prev,
      {
        ...message,
        id: createId(),
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!inputValue.trim()) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: AssistantMessage = { role: "user", content: inputValue.trim() };
      appendMessage(userMessage);
      setInputValue("");
      setError(null);
      setIsLoading(true);

      const payload: AssistantQueryRequest = {
        message: userMessage.content,
        context: buildContext(),
      };

      try {
        const response: AssistantQueryResponse = await queryAssistant(payload, {
          baseUrl,
          signal: controller.signal,
        });
        appendMessage(response.reply);
        setCtas(response.ctas ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, baseUrl, buildContext, inputValue],
  );

  const handleCtaClick = useCallback(
    (cta: AssistantCTA) => {
      const handled = triggerAction(cta.id, cta.payload ?? {});
      if (!handled) {
        const href = typeof cta.payload?.href === "string" ? cta.payload.href : null;
        if (href && typeof window !== "undefined") {
          window.open(href, "_blank", "noopener");
        }
      }
    },
    [triggerAction],
  );

  const toggleVoiceRecording = useCallback(async () => {
    if (!voiceCapture.recordingSupported) {
      setError("Voice capture is not supported in this browser.");
      return;
    }

    if (voiceCapture.isRecording) {
      try {
        setIsTranscribing(true);
        const result = await voiceCapture.stop();

        if (result.transcript) {
          setInputValue(result.transcript);
          return;
        }

        if (result.audioBlob) {
          const audioBase64 = await blobToBase64(result.audioBlob);
          const response = await transcribeAudio(
            {
              audioBase64,
              mimeType: result.mimeType ?? "audio/webm",
              language: "en-US",
            },
            { baseUrl },
          );
          setInputValue(response.text);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to transcribe audio.");
      } finally {
        setIsTranscribing(false);
      }
    } else {
      setError(null);
      setIsTranscribing(false);
      voiceCapture.reset();
      await voiceCapture.start();
    }
  }, [baseUrl, voiceCapture]);

  const labelTextClass = theme === "dark" ? "text-primary-100" : "text-primary-500";
  const wordmarkSrc =
    theme === "dark"
      ? "/images/windshift-wordmark-sky-blue.png"
      : "/images/WindShift - Wordmark - Blue@3x-8.png";

  const collapsedWidth = isDocked ? DOCKED_COLLAPSED_SIZE.width : FLOATING_COLLAPSED_SIZE.width;
  const collapsedHeight = isDocked ? DOCKED_COLLAPSED_SIZE.height : FLOATING_COLLAPSED_SIZE.height;

  const collapsedStyles: React.CSSProperties = {
    right: `${offset.right}px`,
    bottom: `${offset.bottom}px`,
    width: collapsedWidth,
    height: collapsedHeight,
    cursor: isDragging ? "grabbing" : "grab",
    transition: "transform 0.25s ease, box-shadow 0.2s ease, border-color 0.2s ease",
  };

  const baseClasses =
    "fixed z-40 flex select-none flex-col items-center justify-center border text-sm font-semibold text-light-text shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/60 focus-visible:ring-offset-0 dark:border-dark-border/60 dark:text-dark-text dark:hover:shadow-lg dark:focus-visible:ring-primary-500/40";
  const collapsedClasses = isDocked
    ? `${baseClasses} gap-0.5 rounded-t-3xl rounded-b-none border-b-0 border-light-border/80 bg-light-surface/95 px-3 py-1 backdrop-blur-sm dark:bg-dark-surface`
    : `${baseClasses} gap-1.5 rounded-full border-light-border bg-light-surface px-6 py-3 dark:border-dark-border dark:bg-dark-surface dark:hover:border-primary-400 dark:hover:bg-dark-surface`;

  const collapsedContent = isDocked ? (
    <div className="flex w-full flex-col items-center justify-center leading-tight">
      <Image
        src={wordmarkSrc}
        alt="WindShift wordmark"
        width={120}
        height={30}
        className="h-6 w-auto"
        priority={false}
      />
      <span className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${labelTextClass}`}>Assistant</span>
    </div>
  ) : (
    <div className="flex w-full flex-col items-center justify-center gap-1.5 leading-tight">
      <Image
        src={wordmarkSrc}
        alt="WindShift wordmark"
        width={144}
        height={38}
        className="h-7 w-auto"
        priority={false}
      />
      <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${labelTextClass}`}>Assistant</span>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        aria-label="Open assistant"
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          setIsDocked(false);
          const desired = {
            right: offsetRef.current.right,
            bottom: Math.max(offsetRef.current.bottom, OPEN_MIN_BOTTOM),
          };
          const clamped = clampOffsetForSize(desired, getPanelSize(), OPEN_MIN_BOTTOM);
          lastOpenOffsetRef.current = clamped;
          setOffset(clamped);
          setIsOpen(true);
        }}
        onPointerDown={handleCollapsedPointerDown}
        ref={collapsedButtonRef}
        className={collapsedClasses}
        style={collapsedStyles}
      >
        {collapsedContent}
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-light-border bg-light-surface shadow-card dark:border-dark-border dark:bg-dark-surface dark:shadow-card-dark"
      style={{
        right: `${offset.right}px`,
        bottom: `${offset.bottom}px`,
        width: `${panelSize.width}px`,
        height: `${panelSize.height}px`,
      }}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-3 border-b border-light-border bg-light-background px-4 py-3 text-sm font-semibold text-light-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        onPointerDown={handleHeaderPointerDown}
      >
        <div className="flex select-none items-center gap-2 pr-1">
          <Image
            src={wordmarkSrc}
            alt="WindShift logo"
            width={104}
            height={28}
            className="h-6 w-auto"
            priority={false}
          />
          <span className="text-xs uppercase tracking-[0.2em] text-primary-600 dark:text-primary-200">Assistant</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsDocked(true);
              const collapsedBounds = clampOffsetForSize(
                { right: offsetRef.current.right, bottom: DOCKED_OFFSET },
                getCollapsedSize(true),
                DOCKED_OFFSET,
              );
              setOffset({ right: collapsedBounds.right, bottom: DOCKED_OFFSET });
            }}
            onPointerDown={event => {
              event.stopPropagation();
            }}
            className="inline-flex h-8 items-center justify-center rounded-full border border-light-border bg-light-surface px-2 text-[11px] font-medium text-primary-600 whitespace-nowrap transition hover:border-primary-300 hover:bg-primary-50 dark:border-dark-border dark:bg-dark-surface dark:text-primary-200 dark:hover:border-primary-400 dark:hover:bg-primary-500/10"
          >
            Snap to bottom
          </button>
          <button
            type="button"
            onClick={closeAssistant}
            onPointerDown={event => event.stopPropagation()}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-transparent text-[28px] font-semibold text-light-text transition hover:border-light-border hover:bg-light-background hover:text-primary-600 dark:text-dark-text dark:hover:border-dark-border dark:hover:bg-dark-surface dark:hover:text-primary-200"
            aria-label="Collapse assistant"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-3">
        <div className="flex-1 overflow-y-auto space-y-3 text-sm text-light-text dark:text-dark-text">
          {conversation.length === 0 && (
            <div className="rounded-lg border border-light-border bg-light-background px-3 py-2 text-sm text-light-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
              Ask for help with workflows, data sources, or anything else in WindShift.
            </div>
          )}
          {conversation.map(entry => (
            <div
              key={entry.id}
              className={
                entry.role === "user"
                  ? "text-right text-light-text dark:text-dark-text"
                  : "text-left text-light-text dark:text-dark-text"
              }
            >
              <span
                className={
                  entry.role === "user"
                    ? "inline-block rounded-xl bg-primary-500 px-3 py-2 text-light-surface shadow-sm dark:bg-primary-400"
                    : "inline-block rounded-xl border border-light-border bg-light-background px-3 py-2 text-light-text dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                }
              >
                {entry.content}
              </span>
            </div>
          ))}
        </div>

        {ctas.length > 0 && (
          <div className="flex gap-2 overflow-x-auto min-w-0 pt-1">
            {ctas.map(cta => (
              <button
                key={cta.id}
                type="button"
                onClick={() => handleCtaClick(cta)}
                className="rounded-full border border-primary-200 bg-light-surface px-3 py-1 text-xs font-semibold text-primary-600 transition hover:border-primary-300 hover:bg-primary-50 dark:border-primary-500/40 dark:bg-dark-surface dark:text-primary-200 dark:hover:border-primary-400 dark:hover:bg-primary-500/10 flex-shrink-0 whitespace-nowrap"
              >
                {cta.label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-status-error bg-status-error/10 px-3 py-2 text-xs text-status-error dark:border-status-error/60 dark:bg-status-error/20 dark:text-status-error">
            {error}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-light-border px-4 py-2 dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <input
            value={inputValue}
            onChange={event => setInputValue(event.target.value)}
            className="flex-1 rounded-full border border-light-border bg-light-surface px-3 py-2 text-sm text-light-text shadow-sm outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-200 placeholder:text-light-text-muted dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:focus:border-primary-400 dark:focus:ring-primary-500/40 dark:placeholder:text-dark-text-muted"
            placeholder="Ask WindShift anything…"
          />
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              voiceCapture.isRecording
                ? "border-status-error bg-status-error text-light-surface"
                : "border-light-border bg-light-surface text-light-text hover:border-primary-300 hover:text-primary-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-primary-400 dark:hover:text-primary-200"
            } ${!voiceCapture.recordingSupported || isTranscribing ? "cursor-not-allowed opacity-60" : ""}`}
            aria-pressed={voiceCapture.isRecording}
            aria-label={
              voiceCapture.isRecording
                ? "Stop voice recording"
                : voiceCapture.recordingSupported
                  ? "Start voice recording"
                  : "Voice recording is not available"
            }
            disabled={!voiceCapture.recordingSupported || isTranscribing}
          >
            {isTranscribing ? "…" : voiceCapture.isRecording ? "■" : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-2.07A7 7 0 0 0 19 12h-2Z" />
              </svg>
            )}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-full border border-primary-500 bg-primary-500 px-5 text-sm font-semibold text-light-surface shadow transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "…" : "Send"}
          </button>
        </div>
        <div className="flex justify-end text-xs text-light-text-tertiary dark:text-dark-text-muted" />
      </form>
      {/* Edge hit zones */}
      <div
        className="absolute top-0 left-4 right-4 h-2 cursor-n-resize"
        onPointerDown={handleResizePointerDown("top")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
        onPointerDown={handleResizePointerDown("bottom")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-4 bottom-4 left-0 w-2 cursor-w-resize"
        onPointerDown={handleResizePointerDown("left")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize"
        onPointerDown={handleResizePointerDown("right")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      {/* Corner hit zones */}
      <div
        className="absolute top-0 left-0 h-4 w-4 cursor-nw-resize"
        onPointerDown={handleResizePointerDown("top-left")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 h-4 w-4 cursor-ne-resize"
        onPointerDown={handleResizePointerDown("top-right")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 h-4 w-4 cursor-sw-resize"
        onPointerDown={handleResizePointerDown("bottom-left")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
        onPointerDown={handleResizePointerDown("bottom-right")}
        style={{ touchAction: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
