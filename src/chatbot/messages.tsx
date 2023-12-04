import { maxMessageLength, rag_api_uri } from "../common";
import { Directory, buildFileTree } from "../utils/file-manager";

const queryMessage = (question: string, sessionId: string) => {
  var response = {"response": "No response from me", "source_nodes": []};
  const queryUrl = `${rag_api_uri}/message?question=${encodeURI(question)}&session_id=${sessionId}`;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', queryUrl, false);

  try {
    xhr.send();

    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      response = data;
    }
  } catch (err) {}

  return response;
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
    mainContent += "\n\nRecommended products:\n";
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
      const response = queryMessage(previousValue, sessionId);
      processFilesFromResponse(response, responseCallback);
      var message = response.response;
      if (message.length > maxMessageLength) {
        message = message.substring(0, maxMessageLength) + "...";
      }
      return message;
    },
    hideInput: false,
    trigger: "1"
  },
]
