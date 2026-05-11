"use client";

import * as Tooltip from "@radix-ui/react-tooltip";

interface TextTooltipProps {
  text: string;
  children: React.ReactNode;
}

export function TextTooltip({ text, children }: TextTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="max-w-sm px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg leading-relaxed z-50"
            sideOffset={5}
          >
            {text}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}