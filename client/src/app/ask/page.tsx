"use client";

import { useState, useEffect } from "react";
// Import the askQuestion action alongside the clear ChatMessage structural interface
import { askQuestion, ChatMessage } from "../lib/axios";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
}

export default function AskPage() {
  const [urls, setUrls] = useState<string[]>([""]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-scrolls viewport to the bottom when history threads expand
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleUrlChange = (index: number, value: string) => {
    const updatedUrls = [...urls];
    updatedUrls[index] = value;
    setUrls(updatedUrls);
  };

  const addUrlField = () => {
    if (urls.length < 3) setUrls([...urls, ""]);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuery = question.trim();
    const currentQuestionId = crypto.randomUUID();
    const agentAnswerId = crypto.randomUUID();

    // 1. Immediately append the user message UI side
    setMessages((prev) => [
      ...prev,
      { id: currentQuestionId, role: "user", text: userQuery },
    ]);
    
    setQuestion("");
    setLoading(true);

    try {
      const activeUrls = urls.filter((url) => url.trim() !== "");
      const payloadUrls = activeUrls.length === 1 ? activeUrls[0] : activeUrls;
      
      // Local development session context tracker string
      const currentSessionId = "session_local_dev";

      // 2. Formulate historical conversation context using the proper types
      // Map local structural array into clean objects matching backend schemas
      const historyPayload: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      // 3. Dispatch data object across matching parameter list positions
      const res = await askQuestion(payloadUrls, userQuery, currentSessionId, historyPayload);
      
      const finalAnswer = typeof res === "string"
        ? res
        : (res as { answer?: string; data?: { answer?: string } })?.answer ??
          (res as { data?: { answer?: string } })?.data?.answer ??
          null;

      if (finalAnswer) {
        setMessages((prev) => [
          ...prev,
          { id: agentAnswerId, role: "agent", text: finalAnswer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: agentAnswerId,
            role: "agent",
            text: "⚠️ System processing error: Failed to parse structural video payload.",
          },
        ]);
      }
    } catch (err) {
      console.error("UI Render Execution Failure:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: agentAnswerId,
          role: "agent",
          text: " Connection to target agent worker context endpoint failed.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-black dark:text-zinc-50 flex flex-col items-center py-16 px-4">
      {/* Main Content Workspace Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm transition-all mb-24">
        {/* Header Block */}
        <h1 className="text-2xl font-semibold tracking-tight">
          Analyze Short Videos
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
          Paste up to 3 video links (YouTube Shorts or Reels) to query across them.
        </p>

        {/* Video URLs Context Configuration Stack */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Video Sources
          </label>
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="Paste YouTube Short or Instagram Reel link..."
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlField(index)}
                  className="px-3 py-3 text-zinc-400 hover:text-red-500 text-sm transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {urls.length < 3 && (
            <button
              type="button"
              onClick={addUrlField}
              className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 mt-1"
            >
              + Add another video URL
            </button>
          )}
        </div>

        {/* Conversational Stream Interface */}
        <div className="my-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          {messages.length === 0 && !loading ? (
            /* Empty Sandbox State Placeholder */
            <div className="flex flex-col items-center justify-center text-center opacity-40 py-16 animate-in fade-in duration-300">
              <span className="text-4xl mb-3 select-none">💬</span>
              <h3 className="text-sm font-medium">
                Conversational Stream Ready
              </h3>
              <p className="text-xs mt-1 max-w-xs leading-5">
                Input your video sources above and execute your initial query through the action console.
              </p>
            </div>
          ) : (
            /* Populated Message History Threads */
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      msg.role === "user"
                        ? "bg-black text-white dark:bg-zinc-100 dark:text-black font-medium rounded-tr-none"
                        : "bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-tl-none whitespace-pre-wrap text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {msg.role === "agent" && (
                      <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5 select-none">
                        noW Agent Model
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Loading Indicator State */}
          {loading && (
            <div className="flex w-full justify-start mt-6 animate-pulse">
              <div className="max-w-[85%] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl rounded-tl-none px-5 py-4 text-sm flex items-center gap-2 text-zinc-400">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                </div>
                <span className="text-xs font-medium ml-1">
                  Analyzing audio context...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Follow-up Input Panel */}
      <footer className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-zinc-100 via-zinc-100 to-transparent dark:from-black dark:via-black p-4 z-20 flex justify-center">
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl relative flex items-center"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            placeholder={
              loading
                ? "Waiting for agent output..."
                : "Ask a follow-up question..."
            }
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-2 px-3 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black rounded-xl font-medium text-xs hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-0 disabled:pointer-events-none"
          >
            ➔
          </button>
        </form>
      </footer>
    </div>
  );
}