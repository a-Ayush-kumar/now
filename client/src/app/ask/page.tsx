"use client";

import { useState } from "react";
import { askQuestion } from "../lib/axios";

export default function AskPage() {
  const [urls, setUrls] = useState<string[]>([""]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSearch = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      // Clean out empty inputs before firing request
      const activeUrls = urls.filter((url) => url.trim() !== "");
      const payloadUrls = activeUrls.length === 1 ? activeUrls[0] : activeUrls;
      
      const res = await askQuestion(payloadUrls, question);
      const answerText = res.data?.answer;
      if (res.success && typeof answerText === "string") {
        setAnswer(answerText);
      } else {
        setAnswer("⚠️ Failed to parse video context.");
      }
    } catch (err) {
      // log the error to avoid "err is defined but never used" and aid debugging
      // eslint-disable-next-line no-console
      console.error(err);
      setAnswer("Connection to agent endpoint failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black text-black dark:text-zinc-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm transition-all">
        
        <h1 className="text-2xl font-semibold tracking-tight">Analyze Short Videos</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
          Paste up to 3 video links (YouTube Shorts or Reels) to query across them.
        </p>

        {/* Video URLs Group */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Video Sources</label>
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
              onClick={addUrlField}
              className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 mt-1"
            >
              + Add another video URL
            </button>
          )}
        </div>

        {/* Question Area */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Your Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What happens in these videos? Compare them..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-3 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm"
        >
          {loading ? "Analyzing Audio Context..." : "Query Agent"}
        </button>

        {/* Markdown Output Surface */}
        {answer && (
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 transition-all animate-in fade-in">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">Agent Answer</h3>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-5 border border-zinc-100 dark:border-zinc-900 text-sm leading-7 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}