import express from "express";
import getResponseCreator from "./response.js";
import getProductInfoCreator from "./productInfo.js";
import fs from "fs";

const app = express();
const PORT = 3000;
const fs = require('fs');
const cors = require('cors'); // for cross-origin requests, could be removed if not needed

app.use(cors()); // for cross-origin requests, could be removed if not needed
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const productsRoute = "./data/products.json";
const productRoutePrefix = "./data/product-";
const productRouteSuffix = ".json";

// GET

/** GET /product **/
app.get("/product", (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsRoute));
  const responseCreator = getResponseCreator();

  responseCreator.setIsSuccess(true);

  let productInfos = [];
  for(const productId of products) {
    const productInfo = JSON.parse(fs.readFileSync(productRoutePrefix + productId + productRouteSuffix));
    productInfos.push(productInfo);
  }
  responseCreator.setProductInfos(productInfos);

  const result = responseCreator.getResponse();
  res.send(result);
});
/** GET /product **/

/** GET /product/:id **/
app.get("/product/:id", (req, res) => {
  const productId = req.params.id;
  const responseCreator = getResponseCreator();
  const productRoute = productRoutePrefix + productId + productRouteSuffix;

  let productInfos = [];
  if(fs.existsSync(productRoute)) {
    responseCreator.setIsSuccess(true);

    const productInfo = JSON.parse(fs.readFileSync(productRoute));
    productInfos.push(productInfo);
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("File does not exist.");
  }
  responseCreator.setProductInfos(productInfos);

  const result = responseCreator.getResponse();
  res.send(result);
});
/** GET /product/:id **/

/** GET /product/image:id **/
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const moduleURL = import.meta.url;
const filePath = fileURLToPath(moduleURL);
const directoryPath = dirname(filePath);

app.get("/product/image/:id", (req, res) => {
  const productId = req.params.id;
  const imageRoute = directoryPath + `/data/image-${productId}.png`;

  if(fs.existsSync(imageRoute)) {
    res.sendFile(imageRoute, (err) => {
      if(err) {
        console.log("Error of Sending File: ", err);
      }
    });
  } else {
    res.send("File does not exist.");
  }
});
/** GET /product/image:id **/

app.get("/recommendation", (req, res) => {});

app.get("/recommendation/:rank", (req, res) => {});

app.get("/comment/:id", (req, res) => {
  const { id } = req.params;
  const path = `./comment-${id}.json`;

  try {
    const data = fs.readFileSync(path, "utf8");
    const comments = JSON.parse(data);
    const cArray = Object.values(comments); // Convert object to array
    res.status(200).json({ isSuccess: true, comments: cArray });
  } catch (err) {
    res.status(404).json({ isSuccess: false, cause: "No comments found." });
  }
});

// POST
app.post("/register", (req, res) => {
  const { account, password } = req.body;
  const path = "./accounts.json";

  try {
    const data = fs.readFileSync(path, "utf8");
    const accountsData = JSON.parse(data);

    // Check if account exists
    if (accountsData[account]) {
      return res.status(400).json({ isSuccess: false, cause: "Account already exists." });
    }

    // Register new account
    accountsData[account] = password;
    fs.writeFileSync(path, JSON.stringify(accountsData));
    res.status(201).json({ isSuccess: true });
  } catch (err) {
    res.status(500).json({ isSuccess: false, cause: "Internal server error." });
  }
});

app.post("/login", (req, res) => {
  const { account, password } = req.body;
  const path = "./accounts.json";

  try {
    const data = fs.readFileSync(path, "utf8");
    const accountsData = JSON.parse(data);
    
    // Check if the account exists and the password matches
    if (accountsData[account] && accountsData[account] === password) {
      return res.status(200).json({ isSuccess: true });
    } else {
      return res.status(401).json({ isSuccess: false, cause: "Wrong account or password." });
    }    
  } catch (err) {
    res.status(500).json({ isSuccess: false, cause: "Internal server error." });
  }
});

app.post("/product", (req, res) => {});

app.post("/cart/:account", (req, res) => {});

app.post("/purchased/:account", (req, res) => {});

app.post("/cart/change/:account", (req, res) => {});

app.post("/cart/submit/:account", (req, res) => {});

app.post("/comment/:account/:id", (req, res) => {
  const { account, id } = req.params;
  const { comment } = req.body;
  const path = `./comment-${id}.json`;

  if (!comment) {
    return res.status(400).json({ isSuccess: false, cause: "Comment cannot be empty." });
  }

  try {
    try {
      const data = fs.readFileSync(path, "utf8");
      let comments = JSON.parse(data); // Load existing comments if file exists
    } catch (err) {
      let comments = {};
    }

    // Check if the account has commented before
    if (comments[account]) {
      return res.status(400).json({ isSuccess: false, cause: "Account has commented before." });
    }

    // Add new comment
    comments[account] = comment;

    fs.writeFileSync(path, JSON.stringify(comments));
    res.status(201).json({ isSuccess: true });
  } catch (err) {
    res.status(500).json({ isSuccess: false, cause: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});