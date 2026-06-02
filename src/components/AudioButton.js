import React, { useEffect, useRef, useState } from "react";
import { Headphones, Pause } from "lucide-react";
import { playCachedAudio, speakText, stopAllAudio, stopAudioElement } from "../utils/audioPlayback.js";

const e = React.createElement;

export default function AudioButton({
  text,
  audioUrl,
  label = "Слушать",
  activeLabel = "Играет...",
  lang = "ar",
  rate = 0.75,
  className = "button button--soft",
  disabled = false
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  function stop() {
    stopAllAudio();
    stopAudioElement(audioRef.current);
    audioRef.current = null;
    setPlaying(false);
  }

  function play() {
    setPlaying(true);

    if (audioUrl) {
      playCachedAudio(audioUrl, {
        onPlaying: (audio) => {
          audioRef.current = audio;
        },
        onEnded: () => setPlaying(false),
        onError: () => {
          audioRef.current = null;
          if (text) speakText(text, { lang, rate, onEnd: () => setPlaying(false) });
          else setPlaying(false);
        }
      }).catch(() => {});
      return;
    }

    speakText(text, { lang, rate, onEnd: () => setPlaying(false) });
  }

  useEffect(() => stop, []);

  return e(
    "button",
    {
      className,
      type: "button",
      onClick: playing ? play : play,
      disabled: disabled || (!text && !audioUrl),
      "aria-label": playing ? activeLabel : label
    },
    playing ? e(Pause, { size: 18, "aria-hidden": true }) : e(Headphones, { size: 18, "aria-hidden": true }),
    playing ? activeLabel : label
  );
}
