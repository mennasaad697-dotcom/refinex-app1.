import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward } from "lucide-react";

interface Props {
  text: string;
}

export const AudioPlayerControl: React.FC<Props> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!text || !text.trim() || !supported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = "ar-SA";

    // Attempt to pick an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith("ar"));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSpeedChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying) {
      handleStop();
      setTimeout(handlePlay, 100);
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
      <span className="text-slate-600 dark:text-slate-400 font-medium px-1.5 flex items-center gap-1">
        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
        استماع صوتي:
      </span>

      {!isPlaying ? (
        <button
          type="button"
          onClick={handlePlay}
          disabled={!text}
          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-40 flex items-center gap-1"
          title="تشغيل القراءة الصوتية للنص المنظف"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>تشغيل</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handlePause}
          className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all flex items-center gap-1"
          title="إيقاف مؤقت"
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
          <span>إيقاف مؤقت</span>
        </button>
      )}

      {(isPlaying || isPaused) && (
        <button
          type="button"
          onClick={handleStop}
          className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-all"
          title="إيقاف كلي"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Speed Options */}
      <div className="flex items-center gap-1 pr-1 border-r border-slate-300 dark:border-slate-600">
        {[0.9, 1.0, 1.2].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSpeedChange(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
              rate === s
                ? "bg-blue-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
