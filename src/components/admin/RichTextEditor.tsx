"use client";

import dynamic from "next/dynamic";

/* Quill reaches for `document` the moment it is imported, so the editor cannot
   be part of the server bundle. Everything real lives in QuillEditor.tsx; this
   file exists only to keep it off the server and to hold the box open at the
   right height while it loads, so the page does not jump. */

const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="a-editorWrap">
      <div className="a-editorLoading">Loading the editor…</div>
    </div>
  ),
});

export default QuillEditor;
