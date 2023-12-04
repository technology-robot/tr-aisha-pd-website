import React from 'react'
import Editor from "@monaco-editor/react";
import {File} from "../utils/file-manager";
import { standardGridHeight } from '../common';
import map from "lang-map";

export const Code = ({selectedFile}: { selectedFile: File | undefined }) => {
  if (!selectedFile)
    return null

  const code = selectedFile.content
  let language = map.languages(selectedFile.name.split('.').pop())[0];

  return (
    <Editor
      height={standardGridHeight}
      language={language}
      value={code}
      theme="vs-dark"
      keepCurrentModel={true}
      options={{
        inlineSuggest: {
          enabled: false
        },
        quickSuggestions: false,
        suggest: {
          preview: false
        },
        wordWrap: "on",
        lineNumbers: "off",
        padding: {
          "top": 10,
          "bottom": 10
        }
      }}
    />
  )
}
