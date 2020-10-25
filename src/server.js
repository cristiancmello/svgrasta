"use strict";

const express = require("express");
const fileUpload = require("express-fileupload");

const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

// Constants
const PORT = process.env.NODE_ENV === "development" ? 3000 : 8080;
const HOST = "0.0.0.0";

// App
const app = express();

const fileUploadSetup = {
  useTempFiles: true,
  tempFileDir: "/tmp/",
};

app.use(fileUpload(fileUploadSetup));

app.get("/", (req, res) => {
  res.send("svgrasta API");
});

app.post("/render/png", async (req, res) => {
  let fontFiles = req.files.fonts || [];
  let fontDir = "/usr/local/share/fonts/";
  let loadedFonts = [];
  let file = req.files.file;
  let filename = req.files.file.tempFilePath;
  let newFileName = filename + ".svg";
  let filenameRendered = filename + ".png";
  let resvgAppName = "resvg";
  let resvgArgs = [newFileName, filenameRendered];
  let resvgCommand = `${resvgAppName} ${resvgArgs.join(" ")}`;

  try {
    for (let fontFile of fontFiles) {
      let newFileName = fontDir + fontFile.name;
      fontFile.mv(newFileName);
      console.log(fontFile.name);
    }

    file.mv(newFileName);

    const resvgResponse = await execPromise(resvgCommand);

    if (resvgResponse.stderr) {
      res.json({
        error: {
          message: resvgResponse.stderr,
        },
      });
    }

    res.download(filenameRendered);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        message: "Critical Error",
      },
    });
  }
});

app.post("/fonts", async (req, res) => {
  let files = req.files.files;
  let fontDir = "/usr/local/share/fonts/";
  let loadedFonts = [];

  for (let file of files) {
    let newFileName = fontDir + file.name;
    file.mv(newFileName);

    loadedFonts.push(file.name);
  }

  res.json({
    fonts: loadedFonts,
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
