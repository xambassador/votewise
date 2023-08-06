/* -----------------------------------------------------------------------------------------------
 * This is minimal server for add support for file uploads
 * As of now, static-web-server doesn't support file uploads
 * -----------------------------------------------------------------------------------------------*/
import busboy from "busboy";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import http from "http";
import { promisify } from "util";
import { v4 } from "uuid";

import { logger } from "@votewise/lib/logger";

dotenv.config();

// ----------
const getFileInfo = promisify(fs.stat);

// ----------
const port = process.env.STATIC_UPLOAD_SERVER_PORT || 8001;
const staticServerPort = process.env.STATIC_WEB_SERVER_PORT || 8787;

import("./scripts/launch-static-server");

// ----------
const app = express();
const httpServer = http.createServer(app);
// ----------
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());

// ----------
const getFilePath = (fileName: string, fileToken: string) => `./public/upload-${fileToken}-${fileName}`;

// ----------
/**
 * @route POST /handshake
 * Performing a token exchange with the client
 */
app.post("/handshake", (req, res) => {
  if (!req.body || !req.body.fileName) {
    res.status(400).json({
      success: false,
      message: "Invalid request. Missing fileName in body.",
    });
    return;
  }

  const fileName = req.body.fileName;
  // ----- Token
  const fileToken = v4();
  // ----- Creating empty file
  fs.createWriteStream(getFilePath(fileName, fileToken), {
    flags: "w",
  });
  return res.status(200).json({
    message: "ok",
    token: fileToken,
    fileName,
    success: true,
  });
});

// ----------
/**
 * @route POST /upload
 * Upload file to server.
 * Need to pass x-file-token and content-range headers. Token can be obtained from /handshake route.
 */
app.post("/upload", async (req, res) => {
  const contentRange = req.headers["content-range"];
  const token = req.headers["x-file-token"];

  if (!contentRange) {
    return res.status(400).json({
      message: "Missing content-range header",
      success: false,
    });
  }

  if (!token) {
    return res.status(400).json({
      message: "Missing x-file-token header",
      success: false,
    });
  }

  // ----------
  // bytes=0-999/10000
  const isValidContentRange = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);

  if (!isValidContentRange) {
    return res.status(400).json({ message: "Invalid content-range format", success: false });
  }

  const startingByte = Number(isValidContentRange[1]);
  const endingByte = Number(isValidContentRange[2]);
  const fileSize = Number(isValidContentRange[3]);

  if (
    startingByte >= fileSize ||
    startingByte >= endingByte ||
    endingByte <= startingByte ||
    endingByte > fileSize
  ) {
    return res.status(400).json({
      message: "Invalid content-range",
      success: false,
    });
  }

  const bb = busboy({ headers: req.headers });

  bb.on("error", (e) => {
    logger(`Failed to read file :===> ${e}`, "error");
    return res.sendStatus(500);
  });

  let fileName: string;

  bb.on("file", async (_, file, info) => {
    const { filename } = info;
    fileName = filename;
    const filepath = getFilePath(filename, token as string);
    try {
      const stats = await getFileInfo(filepath);
      if (stats.size !== startingByte) {
        return res.status(400).json({ message: "Bad Chunk Starting Byte" });
      }
      file.pipe(fs.createWriteStream(filepath, { flags: "a" })).on("error", () => {
        logger("Failed to upload file", "error");
        return res.status(500).json({ message: "Something is wrong", success: false });
      });
    } catch (error) {
      logger(`Failed to get file details :===> ${error}`, "error");
      return res.status(404).json({
        message: "No file found with provided credentials",
        credentials: {
          token,
          filename,
        },
        success: false,
      });
    }
  });

  bb.on("finish", () => {
    return res.status(200).json({
      message: "File uploaded successfully",
      success: true,
      data: {
        // We delegate the serving of the file to the client to rust static-web-server, which is running on port 8787
        url: `${req.protocol}://${req.hostname}:${staticServerPort}/upload-${token}-${fileName}`,
      },
    });
  });

  req.pipe(bb);
});

// ----------
/**
 * @route GET /upload-status
 * For performing resume upload functionality.
 */
app.get("/upload-status", (req, res) => {
  if (!req.query || !req.query.token || !req.query.filename) {
    return res.status(400).json({
      message: "Missing token or fileName in query params",
      success: false,
    });
  }
  const { token, filename } = req.query;
  getFileInfo(getFilePath(filename as string, token as string))
    .then((stats) => {
      res.status(200).json({
        totalChunkUploaded: stats.size,
      });
    })
    .catch((error) => {
      logger(`Failed to get file details ===> ${error}`, "error");
      return res.status(404).json({
        message: "No file found with provided credentials",
        credentials: {
          token,
          filename,
        },
        success: false,
      });
    });
});

// ----------
/**
 * @route DELETE /upload
 * Perform cleanup of the file from disk.
 */
app.delete("/upload", (req, res) => {
  if (!req.query || !req.query.token || !req.query.filename) {
    return res.status(400).json({
      message: "Missing token or fileName in query params",
      success: false,
    });
  }

  const { token, filename } = req.query;
  const filepath = getFilePath(filename as string, token as string);

  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).json({
        message: "Something is wrong",
        success: false,
      });
    }
    return res.status(200).json({
      message: "File removed successfully",
      success: false,
    });
  });
});

app.get("/heartbeat", (req, res) => {
  res.status(200).json({
    message: "service is running",
    success: true,
  });
});

// ----------
httpServer.listen(port, () => {
  logger(`Static Server is on fire 🔥🔥🔥 on ${port}`, "info");
});

// ----------
// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger("🚨 SIGTERM signal received: closing HTTP server");
  httpServer.close(() => {
    logger(`🚨🚨🚨 💤Server is going to shutdown .....`);

    // Gracefully exit the process
    logger(`💤💤💤Server is shutdown .....`);
    process.exit(0);
  });
});
