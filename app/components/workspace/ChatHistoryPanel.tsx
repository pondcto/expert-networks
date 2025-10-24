"use client";

import React from "react";
import { mockChatMessages, type ChatMessage } from "../../data/mockData";

export interface DeepResearchChatPanelProps {
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

export default function DeepResearchChatPanel({
  messages = mockChatMessages,
  onSendMessage,
}: DeepResearchChatPanelProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
          Chat - Interview Transcript
        </h3>
        <div className="flex items-center gap-2">
          <button className="w-20 px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors h-6 flex items-center justify-center">
            Settings
          </button>
          <button className="w-20 px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md transition-colors h-6 flex items-center justify-center">
            Refresh
          </button>
        </div>
      </div>

      {/* Messages + overlay composer */}
      <div className="relative flex-1 min-h-0">
        <div className="h-full overflow-auto space-y-2 pr-1 pb-20">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  (m.role === "user"
                    ? "bg-primary-500 text-white rounded-2xl rounded-bl-sm"
                    : "rounded-2xl rounded-br-sm bg-light-background-secondary border border-light-border text-light-text dark:bg-dark-background-secondary dark:border-dark-border dark:text-dark-text shadow-card dark:shadow-card-dark") +
                  " px-3 py-2 max-w-[80%]"
                }
              >
                {m.role === "assistant" ? (
                  <div className="whitespace-pre-wrap text-sm leading-6">
                    {m.content}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {m.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Overlay Composer */}
        <div className="absolute left-2 right-6 bottom-2 z-40">
          <div className="pointer-events-auto relative">
            <input
              className="w-full h-10 rounded-full border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface pl-4 pr-36 text-body focus:outline-none ring-1 ring-primary-500/20 dark:ring-primary-500/65 focus:ring-2 focus:ring-primary-500 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow truncate dark:shadow-[0_0_0_2px_rgba(59,130,246,0.35),inset_0_0_14px_rgba(59,130,246,0.20)] dark:hover:shadow-[0_0_0_2px_rgba(59,130,246,0.35),inset_0_0_16px_rgba(59,130,246,0.25)]"
              placeholder="Enter a query…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSend}
              className="absolute right-[1px] top-1/2 -translate-y-1/2 btn-primary h-[38px] px-5 rounded-full min-w-[132px]"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
