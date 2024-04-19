import "./styles/prosemirror.css";
import "./styles/global.css";

import {
  EditorBubble,
  EditorBubbleItem,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  EditorRoot
} from "novel";
import { Editor as EditorInstance } from '@tiptap/core';

import { NodeSelector } from "./bubble/node-selector";
import { LinkSelector } from "./bubble/link-selector";
import { ColorSelector } from "./bubble/color-selector";
import { TextButtons } from "./bubble/text-buttons";

import { defaultExtensions } from "./extensions/extensions";
import { slashCommand, suggestionItems } from "./extensions/slash-command";
const extensions = [...defaultExtensions, slashCommand];

import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";


export default () => {
  // const [content, setContent] = useState(null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    // setContent(json);
    window.localStorage.setItem("novel__content", JSON.stringify(json));
    setSaveStatus("Saved");
  }, 500);


  return ( 
  <EditorRoot>
    <EditorContent
      extensions={extensions}
      onUpdate={({ editor }) => {
        debouncedUpdates(editor);
        setSaveStatus("Unsaved");
      }}
    >

    <EditorCommand className='z-50 not-prose h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-white px-1 py-2 shadow-md transition-all'>
      <EditorCommandEmpty className='px-2 text-muted-foreground'>No results</EditorCommandEmpty>
      {suggestionItems.map((item) => (
        <EditorCommandItem
          value={item.title}
          onCommand={(val) => item.command(val)}
          className={`flex not-prose w-full items-center justify-items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-base-200 aria-selected:bg-base-200`}
          key={item.title}>
            <div className='flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background'>
              {item.icon}
            </div>
            <div>
              <p className='font-medium mb-0'>{item.title}</p>
              <p className='text-xs text-muted-foreground'>{item.description}</p>
          </div>
        </EditorCommandItem>
        ))}
      </EditorCommand>

      <EditorBubble
        tippyOptions={{
          placement: openAI ? "bottom-start" : "top",
        }}
        className='not-prose flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-base-100 shadow-xl'>
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <TextButtons />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
      </EditorBubble>

    </EditorContent>
  </EditorRoot>
  );
};
