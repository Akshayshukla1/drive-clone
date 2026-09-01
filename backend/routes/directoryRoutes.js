import express from "express";
import { mkdir, readdir, stat, writeFile } from "fs/promises";
import path from "path";
import directoriesData from '../directoriesDB.json' with {type: "json"}
import filesData from '../filesDB.json' with {type: "json"}

const router = express.Router();

// Read
router.get("/:id?", async (req, res) => {
  const { id } = req.params
  const directoryData = id ? directoriesData.find((directory) => directory.id === id) : directoriesData[0]
  const files = directoryData.files.map((fileId) =>
    filesData.find((file) => file.id === fileId)
  )
  const directories = directoryData.directories.map((dirId) =>
    directoriesData.find((dir) => dir.id === dirId)
  ).map((({ id, name }) => ({ id, name })))
  res.json({ ...directoryData, files, directories })
});

router.post("/:parentDirId?", async (req, res) => {
  const parentDirId = req.params.parentDirId || directoriesData[0].id
  const { dirname } = req.headers
  const id = crypto.randomUUID()
  const parentDir = directoriesData.find((dir) => dir.id === parentDirId)
  parentDir.directories.push(id)
  directoriesData.push({
    id,
    name: dirname,
    parentDirId,
    files: [],
    directories: []
  })
  try {
    await writeFile('./directoriesDB.json', JSON.stringify(directoriesData))
    res.json({ message: "Directory Created!" })
  } catch (err) {
    res.status(404).json({ err: err.message });
  }
});

export default router;
