# Floating Assistant Component

This directory contains the standalone WindShift assistant UI. It is safe to
mount on any Next.js page without modifying existing components. Voice capture
uses the browser’s Web Speech API when available and falls back to server-side
transcription via `/assistant/transcribe`.

Key behaviors:
- Docked state shows a rounded rectangle with the WindShift wordmark, remains half-visible at the bottom, and the pill stays collapsed until clicked to open.
- Expanded window is resizable (bottom-right handle) and remembers its last position.

## Usage

```tsx
import { AssistantProvider, FloatingAssistant } from "@/app/components/assistant";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AssistantProvider config={{ apiBaseUrl: "/assistant" }}>
      {children}
      <FloatingAssistant />
    </AssistantProvider>
  );
}
```

The provider exposes a small action registry so feature teams can bind CTA
identifiers to page-specific behaviors:

```tsx
const { registerAction } = useAssistant();

useEffect(() => registerAction("open_help_center", () => setHelpModal(true)), [registerAction]);
```

## TODO

- Mount `<AssistantProvider>` globally (e.g. in `app/layout.tsx`).
- Define CTA handlers for page-specific actions.
- Provide `NEXT_PUBLIC_ASSISTANT_API_BASE` if the assistant routes live on a different origin.
