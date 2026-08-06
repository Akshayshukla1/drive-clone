import { useEffect, useState } from "react";

import "./App.css";

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgresss] = useState(0);
  const [newFileName, setNewFileName] = useState("");

  async function getDirectoryItems() {
    const response = await fetch("http://192.168.1.2:3000/");
    const data = await response.json();
    console.log(data);
    setDirectoryItems(data);
  }

  useEffect(() => {
    getDirectoryItems();
  }, []);
  async function uploadFile(e) {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://192.168.1.2:3000", true);
    xhr.setRequestHeader("filename", file.name);
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });

    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      console.log((e.loaded / e.total) * 100);
      setProgresss(totalProgress.toFixed(2));
    });
    xhr.send(file);
  }

  async function renameFile(oldFilename) {
    console.log({ oldFilename, newFileName });
    setNewFileName(oldFilename);
    
  }

  async function saveFilename(oldFilename) {
  const response = await fetch("http://192.168.1.2:3000/", {
    method: "PATCH",
    body: JSON.stringify({ oldFilename, newFileName }),
  });

  console.log(await response.text());

  setNewFileName("");
  getDirectoryItems();
}

  async function handleDelete(filename) {
    console.log(filename);
    const response = await fetch(`http://192.168.1.2:3000/delete`, {
      method: "DELETE",
      body: filename,
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }
  return (
    <>
      <h1>Directory Items</h1>

      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        onChange={(e) => setNewFileName(e.target.value)}
        value={newFileName}
      />
      <p>{progress}</p>
      {directoryItems.map((item, i) => (
        <div key={i}>
          {item}
          <a href={`http://192.168.1.2:3000/${item}?action=open`}>Open</a>
          <a href={`http://192.168.1.2:3000/${item}?action=download`}>
            Download
          </a>
          <button
            onClick={() => {
              handleDelete(item);
            }}
          >
            Delete
          </button>
          <button onClick={() => renameFile(item)}>Rename</button>
          <button onClick={() => saveFilename(item)}>Save</button>
        </div>
      ))}
    </>
  );
}

export default App;
