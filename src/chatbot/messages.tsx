import { rag_api_uri } from "../common";
import { Directory, buildFileTree } from "../utils/file-manager";

import { fetchEventSource } from "@microsoft/fetch-event-source";

const queryMessage = async (question: string, sessionId: string, responseCallback: (dir: Directory) => void) => {
  const queryUrl = `${rag_api_uri}/message?question=${encodeURI(question)}&session_id=${sessionId}`;

  await fetchEventSource(queryUrl, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
    },
    async onopen(res) {
      if (res.ok && res.status === 200) {
        console.log("Connection made ", res);
      } else if (
        res.status >= 400 &&
        res.status < 500 &&
        res.status !== 429
      ) {
        console.log("Client side error ", res);
      }
      processFilesFromResponse(
        {
          "response": "...",
          "source_nodes": []
        },
        responseCallback
      )
    },
    onmessage(event) {
      const parsedData = JSON.parse(event.data);
      processFilesFromResponse(
        parsedData,
        responseCallback
      )
    },
    onclose() {
      console.log("Connection closed by the server");
    },
    onerror(err) {
      processFilesFromResponse(
        {
          "response": `There was an error from server: ${err}`,
          "source_nodes": []
        },
        responseCallback
      )
    },
  });
}

const processFilesFromResponse = (responseJson, callback: (dir: Directory) => void) => {
  var modules = [{
    "code": "placeholder",
    "shortid": "main.md",
    "title": "main.md",
    "directory_shortid": null,
  }];
  var recommendations = {};

  for (var [i_node, node] of responseJson.source_nodes.entries()) {
    const title = node.node.metadata.title;
    const url = node.node.metadata.url;
    recommendations[title] = url;
    const text = `# Title: ${title}\n# Url: ${url}\n---\n\n${node.node.text}`;

    const fileName = `${i_node + 1}. ${title}`;
    modules.push({
      "code": text,
      "shortid": fileName,
      "title": fileName,
      "directory_shortid": null,
    });
  }

  var mainContent = responseJson.response;
  if (Object.keys(recommendations).length > 0) {
    mainContent += "\n\n===\n\nRecommended products:\n";
    for (const title in recommendations) {
      mainContent += `- ${title}: ${recommendations[title]}\n`;
    }
  }

  modules[0].code = mainContent;

  var data = {
      "directories": [],
      "modules": modules
  };
  const rootDir = buildFileTree(data);
  callback(rootDir)
}

export const messages = (sessionId: string, responseCallback) => [
  {
    id: "0",
    message: "How can I help you today?",
    trigger: "1"
  },
  {
    id: "1",
    user: true,
    trigger: "2"
  },
  {
    id: "2",
    message: ({ previousValue, steps }) => {
      queryMessage(previousValue, sessionId, responseCallback);
      return "[Please look at the editor]";
    },
    hideInput: false,
    trigger: "1"
  },
]
