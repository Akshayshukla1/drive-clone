import express from "express";
import { createWriteStream,  } from "fs";
import { rename, rm ,writeFile} from "fs/promises";
import path from "path";
import filesData from '../filesDB.json' with {type:"json"}
import directoriesData from "../directoriesDb.json" with { type: "json" };
import console from "console";



const router = express.Router();

// Create
router.post("/:filename", (req, res) => {
  const { filename } = req.params;
  const parentDirId  = req.headers.parentdirid||directoriesData[0].id;
  const id = crypto.randomUUID();
  const extension = path.extname(filename);
  const fullFileName = `${id}${extension}`;
  console.log(fullFileName)
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on("end", async () => {
    filesData.push({
      id,
      extension,
      name: filename,
      parentDirId
    })
    const parentDirData=directoriesData.find((directoryData)=>directoryData.id==parentDirId)
    console.log(filesData);
    parentDirData.files.push(id)
    await writeFile('./filesDB.json', JSON.stringify(filesData))
    await writeFile('./directoriesDb.json', JSON.stringify(directoriesData))
    res.json({ message: "File Uploaded" });
  });
});

// Path Traversal Vulnerability
router.get("/:id", (req, res) => {
  const {id} = req.params
  const fileData = filesData.find((file) => file.id === id)
  // console.log(id,fileData)
  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment;filename=${fileData.name}`);
  }
  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`, (err) => {
    if (!res.headersSent) {
      res.json({ error: "File not found!" });
    }
  });
});

// Update
router.patch("/:id", async (req, res) => {
  const {id}=req.params
  console.log(id)
  const fileData = filesData.find((file) => file.id === id)
  console.log(fileData)
  console.log(req.body.newFilename)
  fileData.name=req.body.newFilename
  await writeFile('./filesDB.json', JSON.stringify(filesData))
  
  
  res.json({ message: "Renamed" });
});

// Delete
router.delete("/:id", async (req, res) => {
  console.log("delete")
  const {id}=req.params
  console.log(id)
  const fileIndex = filesData.findIndex((file) => file.id === id)
  const fileData = filesData[fileIndex]
  console.log(fileData)

  try {
    await rm(`./storage/${id}${fileData.extension}`, { recursive: true });
    filesData.splice(fileIndex,1)
    const parentDirData=directoriesData.find((directoryData)=>directoryData.id===fileData.parentDirId)
    parentDirData.files=parentDirData.files.filter((fileId)=>fileId!==id)
    await writeFile('./filesDB.json', JSON.stringify(filesData))
    await writeFile('./directoriesDb.json', JSON.stringify(directoriesData))
    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

export default router;
