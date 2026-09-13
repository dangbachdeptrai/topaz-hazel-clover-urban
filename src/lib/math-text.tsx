import katex from "katex";
import { useMemo } from "react";

function renderChunk(text: string, display: boolean) {
  try {
    return katex.renderToString(text, {
      throwOnError: false,
      displayMode: display,
      output: "html",
    });
  } catch {
    return text;
  }
}

export function MathText({ text }: { text: string }) {
  const html = useMemo(() => {
    const parts: string[] = [];
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m.index > last) {
        parts.push(escapeHtml(text.slice(last, m.index)));
      }
      if (m[1] != null) parts.push(renderChunk(m[1], true));
      else if (m[2] != null) parts.push(renderChunk(m[2], false));
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(escapeHtml(text.slice(last)));
    return parts.join("");
  }, [text]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}
