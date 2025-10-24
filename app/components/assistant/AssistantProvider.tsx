"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ActionHandler = (payload: Record<string, unknown>) => void;

export interface AssistantConfig {
  apiBaseUrl?: string;
  onAction?: (id: string, payload: Record<string, unknown>) => void;
}

interface AssistantContextValue {
  config: AssistantConfig;
  registerAction: (id: string, handler: ActionHandler) => () => void;
  triggerAction: (id: string, payload: Record<string, unknown>) => boolean;
  getActionHandler: (id: string) => ActionHandler | undefined;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

export interface AssistantProviderProps {
  config?: AssistantConfig;
  children: React.ReactNode;
}

export function AssistantProvider({ config, children }: AssistantProviderProps) {
  const [exposedHandlers] = useState(() => new Map<string, ActionHandler>());
  const configRef = useRef<AssistantConfig>(config ?? {});
  configRef.current = config ?? {};

  const registerAction = useCallback((id: string, handler: ActionHandler) => {
    exposedHandlers.set(id, handler);
    return () => {
      exposedHandlers.delete(id);
    };
  }, [exposedHandlers]);

  const triggerAction = useCallback(
    (id: string, payload: Record<string, unknown>) => {
      const handler = exposedHandlers.get(id);
      if (handler) {
        handler(payload);
        return true;
      }

      if (configRef.current.onAction) {
        configRef.current.onAction(id, payload);
        return true;
      }

      return false;
    },
    [exposedHandlers],
  );

  const value = useMemo<AssistantContextValue>(
    () => ({
      config: configRef.current,
      registerAction,
      triggerAction,
      getActionHandler: exposedHandlers.get.bind(exposedHandlers),
    }),
    [registerAction, triggerAction, exposedHandlers],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within an <AssistantProvider />.");
  }
  return context;
}
