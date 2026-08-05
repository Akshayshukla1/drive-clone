import { useEffect, useState } from "react";

import "./App.css";

function App() {
  const [directoryItems, setDirectoryItems] = useState([]);
  const [progress, setProgresss] = useState(0);

  async function getDirectoryItems() {
    const response = await fetch("http://192.168.1.2:3000/");
    const data = await response.json();
    console.log(data);
    setDirectoryItems(data);
  }

  useEffect(() => {
    getDirectoryItems();
  }, []);
async function handleChange(e){
 const file=e.target.files[0]
    const xhr=new XMLHttpRequest()
    xhr.open("POST","http://192.168.1.2:3000",true)
    xhr.setRequestHeader("filename",file.name)
    xhr.addEventListener("load",()=>{
console.log(xhr.response)
    })

    xhr.upload.addEventListener("progress",(e)=>{
      const totalProgress=(e.loaded/e.total)*100
        console.log((e.loaded/e.total)*100)
        setProgresss(totalProgress.toFixed(2))
    })
    xhr.send(file)
}
  return (
    <>
      <h1>Directory Items</h1>

  <input type="file" onChange={handleChange} />
  <p>{progress}</p>
      {directoryItems.map((item, i) => (
        <div key={i}>
          {item}
          <a href={`http://192.168.1.2:3000/${item}?action=open`}>Open</a>
          <a href={`http://192.168.1.2:3000/${item}?action=download`}>
            Download
          </a>
        </div>
      ))}
    </>
  );
}

export default App;
