import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createSpeechPractice, getSpeechRecognition, scoreSpeech } from "../utils/speechPractice.js";

export default function VoiceCheckPanel({ targets, prompt, successText = "Отлично, произношение похоже.", threshold = 0.64, lang = "ar-SA", onPassed }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState({
    status: "idle",
    transcript: "",
    score: null,
    message: prompt
  });
  const supported = Boolean(getSpeechRecognition());

  function stop() {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setListening(false);
  }

  function start() {
    if (!supported) {
      setResult({
        status: "unsupported",
        transcript: "",
        score: null,
        message: "Голосовая проверка работает в Chrome или Edge. Разреши микрофон и попробуй снова."
      });
      return;
    }

    if (listening) {
      stop();
      return;
    }

    const recognition = createSpeechPractice({
      lang,
      onStart: () => {
        setListening(true);
        setResult({ status: "listening", transcript: "", score: null, message: "Слушаю... прочитай вслух." });
      },
      onResult: (transcripts) => {
        const best = transcripts
          .map((transcript) => ({ transcript, score: scoreSpeech(transcript, targets) }))
          .sort((a, b) => b.score - a.score)[0] || { transcript: "", score: 0 };
        const passed = best.score >= threshold;

        setResult({
          status: passed ? "success" : "retry",
          transcript: best.transcript,
          score: Math.round(best.score * 100),
          message: passed ? successText : "Почти. Послушай пример и повтори еще раз."
        });
        if (passed) onPassed?.();
      },
      onError: (event) => {
        setResult({
          status: "retry",
          transcript: "",
          score: null,
          message: event.error === "no-speech"
            ? "Я ничего не услышал. Поднеси микрофон ближе."
            : "Не получилось включить микрофон. Проверь разрешение в браузере."
        });
      },
      onEnd: () => {
        recognitionRef.current = null;
        setListening(false);
      }
    });

    recognitionRef.current = recognition;
    recognition?.start();
  }

  useEffect(() => () => stop(), []);

  return (
    <div className={`voice-check-panel voice-check-panel--${result.status}`}>
      <div>
        <strong>Проверка голосом</strong>
        <p>{result.message}</p>
        {result.transcript ? <small>Я услышал: {result.transcript}{result.score !== null ? ` В· ${result.score}%` : ""}</small> : null}
      </div>
      <button className={`button ${listening ? "button--soft" : "button--primary"}`} type="button" onClick={start}>
        {listening ? <Square size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
        {listening ? "Стоп" : "Проверить"}
      </button>
    </div>
  );
}
