const path = require("path");
const fs = require("fs");

const FILES_DIR = path.join(process.cwd(), "files");

const DOWNLOAD_TO_FILE = {
  basic: "basic.pdf",
  standard: "standard.pdf",
  premium: "premium.pdf",
};

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const plan = req.query?.plan || req.params?.plan;
  const fileName = DOWNLOAD_TO_FILE[plan];

  if (!fileName) {
    return res.status(404).send("Invalid plan");
  }

  const filePath = path.join(FILES_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  return res.download(filePath, fileName);
};
