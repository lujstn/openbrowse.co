"use client";

import { useEffect, useState } from "react";
import { install, site } from "@/content/landing";
import { CopyCommand } from "@/components/copy-command";
import { Panel } from "@/components/ui";

const ROTATE_MS = 2000;

// @nonobvious(mirrors) the text-[11px] on the prefix below, against the block's own 13px. The slot width is
// counted in ch, which is one character at the slot's font size, so a prefix drawn smaller has to be
// counted at its own scale or the slot comes out too wide and the command sits adrift of it.
const PREFIX_SCALE = 11 / 13;

// @nonobvious(means) the width a word occupies in the slot counts its prompt prefix and the space after
// it, because both are drawn inside the slot even though neither is part of the command.
function widthOf(tool: { prefix: string; name: string }) {
  const prefix = tool.prefix ? (tool.prefix.length + 1) * PREFIX_SCALE : 0;
  return prefix + tool.name.length;
}

// @nonobvious(forced-by) the theme reset sets a line height on bare spans, which beats anything inherited
// from the <pre>, so every span in the block has to carry this or the rotating slot ends up a different
// height from the words inside it and from the line below. LINE_HEIGHT is the same number, for the one
// place that needs it as a length rather than a class.
const LINE = "leading-[1.9]";
const LINE_HEIGHT = 1.9;

// @nonobvious(means) offsets are kept inside [-1, 1] so every change of tool is one line of travel in the
// same direction. A plain index difference would send the wrap from the last tool back to the first
// travelling two lines the other way, which reads as the carousel jolting rather than turning.
function offsetOf(index: number, current: number, count: number) {
  const half = Math.floor(count / 2);
  return ((index - current + count + half) % count) - half;
}

function Prompt() {
  // @nonobvious(must-hold) the prompt is a separate node, outside both the copy payload and the text
  // selection, because a pasted "$" is a broken command and the sigil is what marks this as a shell.
  return (
    <span aria-hidden="true" className={`mr-2.5 select-none text-label ${LINE}`}>
      $
    </span>
  );
}

export function InstallCard() {
  const [current, setCurrent] = useState(0);
  const [held, setHeld] = useState(false);
  const [rotates, setRotates] = useState(false);

  useEffect(() => {
    // @nonobvious(forced-by) reduced motion is read here rather than left to CSS because the timer is the
    // thing that has to stop: a visually frozen carousel whose interval still runs would change what the
    // copy button sends without anything on screen saying so.
    setRotates(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!rotates || held) return;
    const id = setInterval(
      () => setCurrent((i) => (i + 1) % install.tools.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [rotates, held]);

  const tool = install.tools[current];
  const names = install.tools.map((t) => t.name);
  const spoken = `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`;

  return (
    <div
      // @nonobvious(must-hold) rotation stops on hover and on focus because the copy button sends whatever
      // is on screen. A reader who has just decided which installer they want must not have it change
      // under the pointer on the way to the button.
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <Panel
        label={install.label}
        padded={false}
        actions={
          <>
            <span className="font-mono text-[11px] tabular-nums text-label">
              v{site.version}
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <CopyCommand
              text={`${tool.name} ${install.installArgs}\n${install.start}`}
              label={tool.name}
            />
          </>
        }
      >
        <pre className="overflow-x-auto px-4 py-3.5 text-[13px]">
          <code className="font-mono">
            <span className="flex items-start whitespace-pre">
              <Prompt />
              <span className="sr-only">{spoken}</span>
              <span
                aria-hidden="true"
                // @nonobvious(forced-by) the width is in ch and animated, which is exact only because this
                // is a monospace face: one ch is one character, so the slot is always the width of the word
                // it holds and the rest of the command glides rather than jumping between two guesses.
                className="relative block overflow-hidden transition-[width] duration-500 ease-out"
                style={{ width: `${widthOf(tool)}ch`, height: `${LINE_HEIGHT}em` }}
              >
                {install.tools.map(({ prefix, name }, i) => {
                  const offset = offsetOf(i, current, install.tools.length);
                  return (
                    <span
                      key={name}
                      className={`absolute left-0 top-0 block transition-[transform,opacity] duration-500 ease-out ${LINE}`}
                      style={{
                        transform: `translateY(${offset * 100}%)`,
                        opacity: offset === 0 ? 1 : 0,
                      }}
                    >
                      {prefix ? (
                        <span className="text-label text-[11px]">{`${prefix} `}</span>
                      ) : null}
                      <span className="text-ink">{name}</span>
                    </span>
                  );
                })}
              </span>
              <span className={`text-ink ${LINE}`}>
                {` ${install.installArgs}`}
              </span>
            </span>
            <span className="flex items-start whitespace-pre">
              <Prompt />
              <span className={`text-ink ${LINE}`}>{install.start}</span>
            </span>
          </code>
        </pre>
      </Panel>
    </div>
  );
}
