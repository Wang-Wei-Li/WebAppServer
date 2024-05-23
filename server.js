import express from "express";
import getResponseCreator from "./response.js";
import getProductInfoCreator from "./productInfo.js";
import fs from "fs";
import cors from "cors"; // for cross-origin requests, could be removed if not needed

const app = express();
const PORT = 3000;

app.use(cors()); // for cross-origin requests, could be removed if not needed
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const productsRoute = "./data/products.json";
const productRoutePrefix = "./data/product-";
const productRouteSuffix = ".json";

const commentsRoutePrefix = "./data/comment-";
const commentsRouteSuffix = ".json";

const accountsRoute = "./data/accounts.json";

const recommendationsRoute = "./data/recommendations.json";

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

/** GET /recommendation **/
app.get("/recommendation", (req, res) => {
  const responseCreator = getResponseCreator();

  let recommendationArray = [];
  let recommendationInfos = [];
  if (fs.existsSync(recommendationsRoute)) {
    const recommendations = JSON.parse(fs.readFileSync(recommendationsRoute));
    recommendationArray = Object.values(recommendations); // Convert object to array
    for (const productId of recommendationArray) {
      const recommendationInfo = JSON.parse(fs.readFileSync(productRoutePrefix + productId + productRouteSuffix));
      recommendationInfos.push(recommendationInfo);
    }
    responseCreator.setIsSuccess(true);
    responseCreator.setProductInfos(recommendationInfos);
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Recommandations.json does not exist.");
  }

  const result = responseCreator.getResponse();
  res.send(result);
});
/** GET /recommendation **/

/** GET /recommendation/:rank **/
app.get("/recommendation/:rank", (req, res) => {
  const rank = req.params.rank;
  const responseCreator = getResponseCreator();

  const recommendations = JSON.parse(fs.readFileSync(recommendationsRoute));

  if (rank in recommendations) {  // Check if the rank is a valid key in the recommendations object
    const productId = recommendations[rank];
    const productRoute = productRoutePrefix + productId + productRouteSuffix;
    let productInfos = [];
    if (fs.existsSync(productRoute)) {
      responseCreator.setIsSuccess(true);
      const productInfo = JSON.parse(fs.readFileSync(productRoute));
      productInfos.push(productInfo);
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("File does not exist.");
    }
    responseCreator.setProductInfos(productInfos);
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Invalid rank.");
  }

  const result = responseCreator.getResponse();
  res.send(result);
});
/** GET /recommendation/:rank **/

/** GET /comment/:id **/
app.get("/comment/:id", (req, res) => {
  const productId = req.params.id;
  const responseCreator = getResponseCreator();
  const commentRoute = commentsRoutePrefix + productId + commentsRouteSuffix;

  let commentArray = [];
  if(fs.existsSync(commentRoute)) {
    responseCreator.setIsSuccess(true);

    const comments = JSON.parse(fs.readFileSync(commentRoute));
    commentArray = Object.values(comments); // Convert object to array
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("File does not exist.");
  }
  responseCreator.setComments(commentArray);

  const result = responseCreator.getResponse();
  res.send(result);
});

// POST
app.post("/register", (req, res) => {
  const { account, password } = req.body;
  const responseCreator = getResponseCreator();

  if (fs.existsSync(accountsRoute)) {
    const accountsData = JSON.parse(fs.readFileSync(accountsRoute));

    if (accountsData[account]) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Account already exists.");
    } else {
      accountsData[account] = password;
      fs.writeFileSync(accountsRoute, JSON.stringify(accountsData));
      responseCreator.setIsSuccess(true);
    }
  } else { // if accounts.json does not exist
    const createAccountsJson = {};
    createAccountsJson[account] = password;
    fs.writeFileSync(accountsRoute, JSON.stringify(createAccountsJson));
    responseCreator.setIsSuccess(true);
  }

  const result = responseCreator.getResponse();
  res.send(result);
});

app.post("/login", (req, res) => {
  const { account, password } = req.body;
  const responseCreator = getResponseCreator();

  if (fs.existsSync(accountsRoute)) {
    const accountsData = JSON.parse(fs.readFileSync(accountsRoute));

    if (accountsData[account] && accountsData[account] === password) {
      responseCreator.setIsSuccess(true);
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Wrong account or password.");
    }
  } else { // if accounts.json does not exist
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("File does not exist.");
  }

  const result = responseCreator.getResponse();
  res.send(result);
});

app.post("/product", (req, res) => {});

app.post("/cart/:account", (req, res) => {});

app.post("/purchased/:account", (req, res) => {});

app.post("/cart/change/:account", (req, res) => {});

app.post("/cart/submit/:account", (req, res) => {});

app.post("/comment/:account/:id", (req, res) => {
  const { account, id } = req.params;
  const { comment } = req.body;
  const responseCreator = getResponseCreator();
  const commentRoute = commentsRoutePrefix + id + commentsRouteSuffix;

  if (!comment) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Comment cannot be empty.");
  } else {
    if (fs.existsSync(commentRoute)) {
      const comments = JSON.parse(fs.readFileSync(commentRoute));

      if (comments[account]) {
        responseCreator.setIsSuccess(false);
        responseCreator.setCause("Account has commented before.");
      } else {
        comments[account] = comment;
        fs.writeFileSync(commentRoute, JSON.stringify(comments));
        responseCreator.setIsSuccess(true);
      }
    } else {
      const createCommentsJson = {};
      createCommentsJson[account] = comment;
      fs.writeFileSync(commentRoute, JSON.stringify(createCommentsJson));
      responseCreator.setIsSuccess(true);
    }
  }

  const result = responseCreator.getResponse();
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});