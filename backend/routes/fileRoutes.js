import express from "express";
import { createWriteStream,  } from "fs";
import { rename, rm ,writeFile} from "fs/promises";
import path from "path";
import filesData from '../fileDb.json' with {type:"json"}

filesData.push({name:"hiiiiiiiii"})
console.log(filesData)


const router = express.Router();

// Create
router.post("/:filename", (req, res) => {
  const {filename} = req.params
  const id=crypto.randomUUID()
  const extension=path.extname(filename)
  const fullFileName=`${id}.${extension}`
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  
  req.on("end", async() => {
    filesData.push({
      id,
      extension,
      name:filename
    })
    await writeFile('./fileDb.json',JSON.stringify(filesData))
    res.json({ message: "File Uploaded" });
  });
});

// Path Traversal Vulnerability
router.get("/:id", (req, res) => {
  // const filePath = path.join("/", req.params[0]);
  const{id}=req.params
  console.log(id)
  // const fileData=filesData.find(({file})=>file.id===id)
  const fileData = filesData.find((file) => file.id === id);
  console.log(fileData)
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`, (err) => {
    if (err) {
      res.json({ error: "File not found!" });
    }
  });
});

// Update
router.patch("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  await rename(`./storage/${filePath}`, `./storage/${req.body.newFilename}`);
  res.json({ message: "Renamed" });
});

// Delete
router.delete("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  try {
    await rm(`./storage/${filePath}`, { recursive: true });
    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

export default router;
