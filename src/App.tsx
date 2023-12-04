import React, { useState, useEffect } from "react";
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import MyChatBot from "./chatbot/chatbot";
import { Code } from "./editor/code";
import { Type, File, Directory, findFileByName } from "./utils/file-manager";
import "./App.css";
import logo from './assets/logo.png'; // Tell webpack this JS file uses this image
import { Stack, Typography } from "@mui/material";
import { FileTree } from "./editor/file-tree";
import { messages } from "./chatbot/messages";
import { v4 as uuidv4 } from 'uuid';
import { rag_api_uri } from "./common";

const dummyDir: Directory = {
  id: "1",
  name: "loading...",
  type: Type.DUMMY,
  parentId: undefined,
  depth: 0,
  dirs: [],
  files: []
};


const App = () => {
  const [sessionId] = useState(uuidv4());
  const [rootDir, setRootDir] = useState(dummyDir);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      fetch(`${rag_api_uri}/delete_chat_history?session_id=${sessionId}`);
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId]);

  const responseCallback = (root) => {
    if (!selectedFile) {
      setSelectedFile(findFileByName(root, "main.md"));
    }
    setRootDir(root);
  }

  return (
    <Stack spacing={0.4} useFlexGap={true}>
       <Grid
        container
        spacing={1}
        display="flex"
        columns={{xs: 4, sm: 8, md: 12}}
        justifyContent="center"
        alignItems="center"
        >
        <Grid><a href="https://technology-robot.com/" target="_blank" rel="noreferrer noopener"><img src={logo} alt="TR Logo" width={50}/></a></Grid>
      </Grid>
      <Grid
        container
        spacing={1}
        display="flex"
        columns={{xs: 4, sm: 8, md: 12}}
        direction="row-reverse"
        justifyContent="center"
        alignItems="stretch"
        >
        <Grid xs={4} sm={4} md={4}>
          <MyChatBot
            steps={messages(sessionId, responseCallback)}/>
        </Grid>
        <Grid xs={4} sm={7} md={7}>
          <Code selectedFile={selectedFile} />
        </Grid>
        <Grid xs={4} sm={1} md={1}>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={(file: File) => {
              setSelectedFile(file)
            }}
            />
        </Grid>
      </Grid>
      <a href="https://technology-robot.com/#:~:text=%F0%9F%92%AC-,Aisha%20for%20code,-Search%20and%20retrieve" target="_blank" rel="noreferrer noopener"><Typography align="right">More about Aisha</Typography></a>
    </Stack>
  );
};

export default App;
