import express from "express";
import { createWriteStream } from "fs";
import { readdir, rename, rm } from "fs/promises";

const app = express();

app.use(express.json());

// Enabling CORS
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  });
  next();
});

// Read
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage");
  res.json(filesList);
});


//create
app.post("/:filename",(req,res)=>{
  // console.log(req.params.filename)
  const filename=req.params.filename

  const writeStream=createWriteStream(`./storage/${filename}`)
  req.pipe(writeStream)
  req.on("end",()=>{
    res.json({message:'File uploaded'})
  })
})
app.get("/:filename", (req, res) => {
  const { filename } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`);
});

// Update
app.patch("/:filename", async (req, res) => {
  const { filename } = req.params;
  await rename(`./storage/${filename}`, `./storage/${req.body.newFilename}`);
  res.json({ message: "Renamed" });
});

// Delete
app.delete("/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = `./storage/${filename}`;
  try {
    await rm(filePath);
    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    res.status(404).json({ message: "File Not Found!" });
  }
});

app.listen(3000, () => {
  console.log(`Server Started`);
});
