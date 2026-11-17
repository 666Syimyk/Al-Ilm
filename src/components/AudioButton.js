import React, { useEffect, useRef, useState } from "react";
import { Headphones, Pause } from "lucide-react";
import { playAudioSources, speakText, stopAllAudio, stopAudioElement } from "../utils/audioPlayback.js";
import { getRecordingSources } from "../utils/quranAudio.js";

const e = React.createElement;

export default function AudioButton(props) {
  return e(AudioButtonSession, { ...props, key: JSON.stringify([props.text, props.audioUrl, props.audioUrls]) });
}

function AudioButtonSession({
  text,
  audioUrl,
  audioUrls = [],
  label = "Слушать",
  activeLabel = "Играет...",
  lang = "ar",
  rate = 0.75,
  speakAfterAudio = false,
  className = "button button--soft",
  disabled = false
}) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const playIdRef = useRef(0);

  function stop() {
    playIdRef.current += 1;
    stopAllAudio();
    stopAudioElement(audioRef.current);
    audioRef.current = null;
    setPlaying(false);
  }

  function finish(playId) {
    if (playIdRef.current !== playId) return;
    audioRef.current = null;

    if (speakAfterAudio && text) {
      speakText(text, {
        lang,
        rate,
        onStop: () => { if (playIdRef.current === playId) setPlaying(false); },
        onError: () => { if (playIdRef.current === playId) { setPlaying(false); setError("Озвучка недоступна. Проверь звук в профиле и голос браузера."); } },
        onEnd: () => {
          if (playIdRef.current === playId) setPlaying(false);
        }
      });
      return;
    }

    setPlaying(false);
  }

  function play() {
    stopAllAudio();
    const playId = playIdRef.current + 1;
    playIdRef.current = playId;
    setPlaying(true);
    setError("");
    const onError = (problem) => {
      if (playIdRef.current !== playId) return;
      setPlaying(false);
      setError(problem?.message || "Аудио недоступно. Проверь интернет и настройки звука.");
    };
    const onStop = () => { if (playIdRef.current === playId) setPlaying(false); };

    const queue = (Array.isArray(audioUrls) && audioUrls.length ? audioUrls : [audioUrl]).filter(Boolean);

    if (!queue.length) {
      speakText(text, {
        lang,
        rate,
        onError,
        onStop,
        onEnd: () => {
          if (playIdRef.current === playId) setPlaying(false);
        }
      });
      return;
    }

    let nextIndex = 0;
    const playNext = () => {
      if (playIdRef.current !== playId) return;

      const nextUrl = queue[nextIndex];
      nextIndex += 1;

      if (!nextUrl) {
        finish(playId);
        return;
      }

      playAudioSources(getRecordingSources(nextUrl), {
        onReady: (audio) => {
          audioRef.current = audio;
        },
        onEnded: playNext,
        onError,
        onStop
      });
    };

    playNext();
  }

  useEffect(() => stop, []);

  return e(React.Fragment, null, e(
    "button",
    {
      className,
      type: "button",
      onClick: playing ? stop : play,
      disabled: disabled || (!text && !audioUrl && !(Array.isArray(audioUrls) && audioUrls.length)),
      "aria-label": playing ? activeLabel : label
    },
    playing ? e(Pause, { size: 18, "aria-hidden": true }) : e(Headphones, { size: 18, "aria-hidden": true }),
    playing ? activeLabel : label
  ), error ? e("small", { role: "status", className: "audio-unavailable-note" }, error) : null);
}
