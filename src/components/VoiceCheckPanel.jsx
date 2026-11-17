import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createSpeechPractice, getSpeechRecognition, scoreSpeech } from "../utils/speechPractice.js";
import { stopAllAudio } from "../utils/audioPlayback.js";

export default function VoiceCheckPanel(props) {
  return <VoiceCheckSession key={JSON.stringify([props.targets, props.lang])} {...props} />;
}

function VoiceCheckSession({ targets, prompt, successText = "Распознанные слова совпали с образцом.", threshold = 0.9, lang = "ar-SA", onPassed }) {
  const recognitionRef = useRef(null);
  const runRef = useRef(0);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState({
    status: "idle",
    transcript: "",
    score: null,
    message: prompt
  });
  const supported = Boolean(getSpeechRecognition());

  function stop() {
    runRef.current += 1;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try { recognition.abort(); } catch { /* Recognition may already have ended. */ }
    }
    setListening(false);
    setResult((previous) => previous.status === "listening" ? { status: "idle", transcript: "", score: null, message: prompt } : previous);
  }

  function start() {
    if (!supported) {
      setResult({
        status: "unsupported",
        transcript: "",
        score: null,
        message: "Этот браузер не поддерживает распознавание речи. Повторяй по образцу и проверь чтение с учителем."
      });
      return;
    }

    if (recognitionRef.current || listening) {
      stop();
      return;
    }

    stopAllAudio();
    const run = ++runRef.current;
    setListening(true);
    const recognition = createSpeechPractice({
      lang,
      onStart: () => {
        if (runRef.current !== run) return;
        setListening(true);
        setResult({ status: "listening", transcript: "", score: null, message: "Слушаю... прочитай вслух." });
      },
      onResult: (transcripts) => {
        if (runRef.current !== run) return;
        const best = transcripts
          .map((transcript) => ({ transcript, score: scoreSpeech(transcript, targets) }))
          .sort((a, b) => b.score - a.score)[0] || { transcript: "", score: 0 };
        const passed = best.score >= Math.max(0.85, threshold);

        setResult({
          status: passed ? "success" : "retry",
          transcript: best.transcript,
          score: Math.round(best.score * 100),
          message: passed ? successText : "Браузер не всегда понимает детский голос — это не оценка твоего чтения. Послушай пример и попробуй ещё раз или покажи учителю."
        });
        if (passed) onPassed?.();
      },
      onError: (event) => {
        if (runRef.current !== run) return;
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
        if (runRef.current !== run) return;
        recognitionRef.current = null;
        setListening(false);
        setResult((previous) => previous.status === "listening" ? { status: "retry", transcript: "", score: null, message: "Фраза не распознана. Попробуй ещё раз." } : previous);
      }
    });

    recognitionRef.current = recognition;
    try { recognition?.start(); }
    catch {
      stop();
      setResult({ status: "retry", transcript: "", score: null, message: "Не удалось начать запись. Проверь разрешение микрофона и попробуй снова." });
    }
  }

  useEffect(() => () => stop(), []);

  return (
    <div className={`voice-check-panel voice-check-panel--${result.status}`}>
      <div>
        <strong>Проверка распознанных слов</strong>
        <p>{result.message}</p>
        <details className="voice-check-panel__note">
          <summary>Для родителей</summary>
          <small>Проверка сравнивает распознанные слова, а не произношение или таджвид. Для проверки чтения нужен учитель.</small>
          <small>Голос распознаёт сервис браузера (например, Google в Chrome или Apple в Safari), запись может передаваться на его серверы. Приложение запись не сохраняет.</small>
        </details>
        {result.transcript ? <small>Я услышал: {result.transcript}{result.score !== null ? ` · ${result.score}%` : ""}</small> : null}
      </div>
      <button className={`button ${listening ? "button--soft" : "button--primary"}`} type="button" onClick={start}>
        {listening ? <Square size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
        {listening ? "Стоп" : "Проверить"}
      </button>
    </div>
  );
}
