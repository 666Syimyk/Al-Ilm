// Russian sentences with Arabic inside: each Arabic run is isolated, so signs like
// "+" and "=" between Arabic words keep the left-to-right order of the sentence.
const ARABIC_RUN = /([؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿](?:[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿\s]*[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿])?)/;

export default function MixedText({ text }) {
  return String(text ?? "").split(ARABIC_RUN).map((part, index) => (
    index % 2 ? <bdi key={index} className="inline-arabic" lang="ar" dir="rtl">{part}</bdi> : part
  ));
}
