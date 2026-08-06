import { createWriteStream } from "fs";
import { open, readdir, readFile,rm,rename  } from "fs/promises";
import http from "http";
import mime from "mime-types";

const server = http.createServer(async (req, res) => {
  console.log(req.url);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  if ((req.method ==="GET")) {
    if (req.url === "/favicon.ico") return res.end("No favicon.");

    if (req.url === "/") {
      serveDirectory(req, res);
    } 
    else {
      try {
        const [url, queryString] = req.url.split("?");
        const queryParam = {};
        queryString?.split("&").forEach((pair) => {
          const [key, value] = pair.split("=");
          queryParam[key] = value;
        });
        console.log(queryParam);

        const fileHandle = await open(`./storage${decodeURIComponent(url)}`);
        const stats = await fileHandle.stat();
        if (stats.isDirectory()) {
          serveDirectory(req, res);
        } else {
          const readStream = fileHandle.createReadStream();
          res.setHeader("Content-Type", mime.contentType(url.slice(1)));
          res.setHeader("Content-Length", stats.size);
          if (queryParam.action === "download") {
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${url.slice(1)}"`,
            );
          }
          readStream.pipe(res);
        }
      } catch (err) {
        console.log(err.message);
        res.end("Not Found!");
      }
    }
  }else if(req.method==="OPTIONS"){
    res.end("OK OK")

  }
  else if(req.method==="PATCH"){
    req.on("data",async (chunk)=>{
      const data=JSON.parse(chunk.toString())
      console.log(data)
      await rename(`./storage/${data.oldFilename}`,`./storage/${data.newFileName}`)
      console.log("File renamed")
      res.end("Rename")
    })
  }
  else if(req.method==="DELETE"){
    req.on("data",async(chunk)=>{
      try{
        const filename=chunk.toString()
      console.log(filename)
      await rm(`./storage/${filename}`)
      res.end("File deleted")
      }catch(err){
        res.end(err.message)
      }
    })
   
  }
    else if (req.method === "POST") {

    const writeableStream = createWriteStream(
        `./storage/${req.headers.filename}`
    );

    req.pipe(writeableStream);

    writeableStream.on("finish", () => {
        console.log("File uploaded successfully");
        res.end("Success");
    });

    writeableStream.on("error", (err) => {
        console.log(err);
        res.statusCode = 500;
        res.end("Upload Failed");
    });

}
  
});

async function serveDirectory(req, res) {
  const [url] = req.url.split("?");
  // console.log("hiii", { url, queryString });
  const itemsList = await readdir(`./storage${url}`);

  // const htmlBoilerplate = await readFile("./index.html", "utf-8");

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(itemsList));
}

server.listen(3000, "192.168.1.2", () => {
  console.log("Server started");
});
