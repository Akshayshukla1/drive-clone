import express from "express";
import { createWriteStream } from "fs";
import { readdir, rename, rm, stat } from "fs/promises";
import cors from "cors";

const app = express();

app.use(express.json());


// Enabling CORS
// app.use((req, res, next) => {
//   res.set({
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "*",
//     "Access-Control-Allow-Headers": "*",
//   });
//   next();
// });

app.use(cors());

app.post("/:filename",(req,res,next)=>{
console.log(req.params.filename)
const writeStream=createWriteStream(`./storage/${req.params.filename}`)
req.pipe(writeStream)
req.on("end",()=>{
  res.json({message:"File uploaded"})
})
})
// Read
// /directory
app.get("/directory", async (req, res) => {
  const filesList = await readdir("./storage");
  const resData = [];

  for (const item of filesList) {
    const stats = await stat(`./storage/${item}`);

    resData.push({
      name: item,
      isDirectory: stats.isDirectory(),
    });
  }

  res.json(resData);
});

// /directory/:dirname
app.get("/directory/:dirname", async (req, res) => {
  const { dirname } = req.params;

  const fullDirPath = `./storage/${dirname}`;
  const filesList = await readdir(fullDirPath);
  const resData = [];

  for (const item of filesList) {
    const stats = await stat(`${fullDirPath}/${item}`);

    resData.push({
      name: item,
      isDirectory: stats.isDirectory(),
    });
  }

  res.json(resData);
});

//create
app.post("/files/:filename", (req, res) => {
  const writeStream = createWriteStream(`./storage/${filename}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.json({ message: "File uploaded" });
  });
});

app.get("/files/:filename", (req, res) => {
  const { filename } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`);
});

// Update
app.patch("/files/:filename", async (req, res) => {
  const { filename } = req.params;
  await rename(`./storage/${filename}`, `./storage/${req.body.newFilename}`);
  res.json({ message: "Renamed" });
});

// Delete
app.delete("/files/:filename", async (req, res) => {
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
