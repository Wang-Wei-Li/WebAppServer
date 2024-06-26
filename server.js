import express, { response } from "express";
import getResponseCreator from "./response.js";
import getPersonalInfoCreator from "./personalInfo.js";
import getProductInfoCreator from "./productInfo.js";
import fs, { existsSync } from "fs";
import cors from "cors"; // for cross-origin requests, could be removed if not needed
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3000;

app.use(cors()); // for cross-origin requests, could be removed if not needed
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function parseJsonFile(route, responseCreator, res) { // Parse JSON file with proper error handling
  try {
    return JSON.parse(fs.readFileSync(route));
  } catch (error) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Error parsing JSON file: " + error.message);
    res.send(responseCreator.getResponse()); // Send response from within the function
    return null; // Return null to indicate failure
  }
}

function writeJsonFile(route, data, responseCreator, res) { // Write JSON file with proper error handling
  try {
    fs.writeFileSync(route, JSON.stringify(data));
    return true;
  } catch (error) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Error writing JSON file: " + error.message);
    res.send(responseCreator.getResponse());
    return false;
  }
}

function creatPersonalInfo(username, email, phonenum, address) {
  const personalInfoCreator = getPersonalInfoCreator();
  personalInfoCreator.setUsername(username);
  personalInfoCreator.setEmail(email);
  personalInfoCreator.setPhonenum(phonenum);
  personalInfoCreator.setAddress(address);
  return personalInfoCreator.getPersonalInfo();
}

const productsRoute = "./data/products.json";
const productRoutePrefix = "./data/product-";
const productRouteSuffix = ".json";

// GET

/** GET /product **/
app.get("/product", (req, res) => {
  const responseCreator = getResponseCreator();

  if (!existsSync(productsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${productsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const products = parseJsonFile(productsRoute, responseCreator, res);
  if (!products) return;

  let missingProducts = [];
  let productInfos = [];
  for (const productId in products) {
    let productRoute = productRoutePrefix + productId + productRouteSuffix;

    if (!fs.existsSync(productRoute)) {
        missingProducts.push(productId);
        continue;
    }

    const productInfo = parseJsonFile(productRoute, responseCreator, res);
    if (!productInfo) return;

    productInfos.push(productInfo);
  }

  if (missingProducts.length > 0) {
    responseCreator.setCause(`Missing JSON file for product id(s): ${missingProducts.join(", ")}`);
  }
  responseCreator.setProductInfos(productInfos);
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** GET /product **/

const viewcountsRoute = "./data/viewcounts.json";

/** GET /product/:id **/
app.get("/product/:id", (req, res) => {
  const productId = req.params.id;
  const responseCreator = getResponseCreator();
  const productRoute = productRoutePrefix + productId + productRouteSuffix;

  if (!fs.existsSync(productRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${productRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const productInfo = parseJsonFile(productRoute, responseCreator, res);
  if (!productInfo) return;

  if (!fs.existsSync(viewcountsRoute)) { // Create viewcounts.json if it does not exist
    const createViewcountsJson = {};

    createViewcountsJson[productId] = 1;
    const writeVeiwcounts = writeJsonFile(viewcountsRoute, createViewcountsJson, responseCreator, res);
    if (!writeVeiwcounts) return;
  }

  const viewcounts = parseJsonFile(viewcountsRoute, responseCreator, res);
  if (!viewcounts) return;

  if (!(productId in viewcounts)) viewcounts[productId] = 0; // initialize viewcount if productId does not exist

  viewcounts[productId] += 1;
  const writeVeiwcounts = writeJsonFile(viewcountsRoute, viewcounts, responseCreator, res);
  if (!writeVeiwcounts) return;

  let productInfos = [];
  productInfos.push(productInfo);

  responseCreator.setProductInfos(productInfos);
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** GET /product/:id **/

const recommendationsRoute = "./data/recommendations.json";

/** GET /recommendation **/
app.get("/recommendation", (req, res) => {
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(recommendationsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${recommendationsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const recommendations = parseJsonFile(recommendationsRoute, responseCreator, res);
  if (!recommendations) return;

  let recommendationInfos = [];
  for (const rank in recommendations) {
    const productId = recommendations[rank];
    let productRoute = productRoutePrefix + productId + productRouteSuffix;

    if (!fs.existsSync(productRoute)) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause(`${productRoute} does not exist.`);
      return res.send(responseCreator.getResponse());
    }

    const recommendationInfo = parseJsonFile(productRoute, responseCreator, res);
    if (!recommendationInfo) return;

    recommendationInfos.push(recommendationInfo);
  }
  responseCreator.setProductInfos(recommendationInfos);
  responseCreator.setIsSuccess(true);
  
  return res.send(responseCreator.getResponse());
});
/** GET /recommendation **/

/** GET /recommendation/:rank **/
app.get("/recommendation/:rank", (req, res) => {
  const rank = req.params.rank;
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(recommendationsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${recommendationsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const recommendations = parseJsonFile(recommendationsRoute, responseCreator, res);
  if (!recommendations) return;

  if (!(rank in recommendations)) { // Check if the rank is a valid.
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Invalid rank.");
    return res.send(responseCreator.getResponse());
  }

  const productId = recommendations[rank];
  const productRoute = productRoutePrefix + productId + productRouteSuffix;

  if (!fs.existsSync(productRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${productRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const productInfo = parseJsonFile(productRoute, responseCreator, res);
  if (!productInfo) return;

  let productInfos = [];
  productInfos.push(productInfo);

  responseCreator.setProductInfos(productInfos);
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** GET /recommendation/:rank **/

const commentsRoutePrefix = "./data/comment-";
const commentsRouteSuffix = ".json";

/** GET /comment/:id **/
app.get("/comment/:id", (req, res) => {
  const productId = req.params.id;
  const responseCreator = getResponseCreator();
  const commentRoute = commentsRoutePrefix + productId + commentsRouteSuffix;

  if (!fs.existsSync(commentRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("No comments yet.");
    return res.send(responseCreator.getResponse());
  }

  const comments = parseJsonFile(commentRoute, responseCreator, res);
  if (!comments) return;

  responseCreator.setComments(comments);
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** GET /comment/:id **/

/** GET /product/image:id **/
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import e from "express";
const moduleURL = import.meta.url;
const filePath = fileURLToPath(moduleURL);
const directoryPath = dirname(filePath);

app.get("/product/image/:id", (req, res) => {
  const productId = req.params.id;
  const imageRoute = directoryPath + `/data/image-${productId}.png`;

  if (fs.existsSync(imageRoute)) {
    res.sendFile(imageRoute, (err) => {
      if (err) {
        console.log("Error of Sending File: ", err);
      }
    });
  } else {
    res.send("File does not exist.");
  }
});
/** GET /product/image:id **/

const accountsRoute = "./data/accounts.json";
const personalInfosRoute = "./data/personalInfos.json";

// POST

const purchasedRoutePrefix = "./data/purchased-";
const purchasedRouteSuffix = ".json";

/** POST /register **/
app.post("/register", (req, res) => {
  const { account, password, username, email, phonenum, address } = req.body;
  const responseCreator = getResponseCreator();

  if (!account || !password) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Account and password cannot be empty.");
    return res.send(responseCreator.getResponse());
  }

  if (!fs.existsSync(accountsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const accounts = parseJsonFile(accountsRoute, responseCreator, res);
  if (!accounts) return;

  if (account in accounts) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Account already exists.");
    return res.send(responseCreator.getResponse());
  }

  if (!fs.existsSync(personalInfosRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${personalInfosRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const personalInfos = parseJsonFile(personalInfosRoute, responseCreator, res);
  if (!personalInfos) return;

  // hash the password
  const saltRounds = 10;
  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashP = bcrypt.hashSync(password, salt);
    console.log(password)
    console.log(hashP)
    accounts[account] = hashP;
  } catch (error) {
    console.log('Error hashing password:', error);
  }

  const writeAccounts = writeJsonFile(accountsRoute, accounts, responseCreator, res);
  if (!writeAccounts) return;

  const personalInfo = creatPersonalInfo(username, email, phonenum, address);
  personalInfos[account] = personalInfo;

  const writePersonalInfos = writeJsonFile(personalInfosRoute, personalInfos, responseCreator, res);
  if (!writePersonalInfos) return;

  const purchasedRoute = purchasedRoutePrefix + account + purchasedRouteSuffix;

  const createPurchasedJson = {};
  const writePurchased = writeJsonFile(purchasedRoute, createPurchasedJson, responseCreator, res);
  if (!writePurchased) return;

  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** POST /register **/

/** POST /login **/
app.post("/login", (req, res) => {
  const { account, password } = req.body;
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(accountsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const accounts = parseJsonFile(accountsRoute, responseCreator, res);
  if (!accounts) return;

  if (!fs.existsSync(personalInfosRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${personalInfosRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const personalInfos = parseJsonFile(personalInfosRoute, responseCreator, res);
  if (!personalInfos) return;

  if (!(account in accounts)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Wrong account.");
    return res.send(responseCreator.getResponse());
  }

  const storedHashedPassword = accounts[account];
  bcrypt.compare(password, storedHashedPassword, (err, result) => {
    if (err) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Error during authentication.");
    } else if (result) {
      // Passwords match, authentication successful
      responseCreator.setPersonalInfos(personalInfos[account]);
      responseCreator.setPassword(storedHashedPassword);
      responseCreator.setIsSuccess(true);
    } else {
      // Passwords don't match, authentication failed
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Wrong password.");
    }
    return res.send(responseCreator.getResponse());
  });
});
/** POST /login **/

/** POST /product **/
app.post("/product", (req, res) => {
  const { filters } = req.body;
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(productsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${productsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }
  
  const products = parseJsonFile(productsRoute, responseCreator, res);
  if (!products) return;

  let missingProducts = [];
  let productInfos = [];
  for (const productId in products) {
    let productRoute = productRoutePrefix + productId + productRouteSuffix;

    if (!fs.existsSync(productRoute)) {
      missingProducts.push(productId);
      continue;
    }

    let productInfo = parseJsonFile(productRoute, responseCreator, res);
    if (!productInfo) return;

    let matchAllFilters = true;
    for (const filter of filters) {
      let match = false;
      for (const category of productInfo["categories"]) {
        if (filter == category) {
          match = true;
          break;
        }
      }

      if (!match) {
        matchAllFilters = false;
        break;
      }
    }

    if (matchAllFilters) {
      productInfos.push(productInfo);
    }
  }

  if (missingProducts.length > 0) {
    responseCreator.setCause(`Missing JSON file for product id(s): ${missingProducts.join(", ")}`);
  }
  responseCreator.setProductInfos(productInfos);
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** POST /product **/

const cartRoutePrefix = "./data/cart-";
const cartRouteSuffix = ".json";

/** POST /cart/:account **/
app.post("/cart/:account", (req, res) => {
  const account = req.params.account;
  const { password } = req.body;
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(accountsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const accounts = parseJsonFile(accountsRoute, responseCreator, res);
  if (!accounts) return;

  if (!(account in accounts) || accounts[account] !== password) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Wrong account or password.");
    return res.send(responseCreator.getResponse());
  }

  const cartRoute = cartRoutePrefix + account + cartRouteSuffix;

  if (!fs.existsSync(cartRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Cart is empty.");
    return res.send(responseCreator.getResponse());
  }

  const cart = parseJsonFile(cartRoute, responseCreator, res);
  if (!cart) return;

  let productInfos = [];
  for (const productId in cart) {
    let productRoute = productRoutePrefix + productId + productRouteSuffix;

    if (!fs.existsSync(productRoute)) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause(`${productRoute} does not exist.`);
      return res.send(responseCreator.getResponse());
    }

    let productInfo = parseJsonFile(productRoute, responseCreator, res);
    if (!productInfo) return;

    productInfo["amount"] = cart[productId];
    productInfos.push(productInfo);
  }
  responseCreator.setProductInfos(productInfos);
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** POST /cart/:account **/

/** POST /cart/change/:account **/
app.post("/cart/change/:account", (req, res) => {
  const account = req.params.account;
  const { password, products } = req.body;
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(accountsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const accounts = parseJsonFile(accountsRoute, responseCreator, res);
  if (!accounts) return;

  if (!(account in accounts) || accounts[account] !== password) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Wrong account or password.");
    return res.send(responseCreator.getResponse());
  }

  const cartRoute = cartRoutePrefix + account + cartRouteSuffix;

  let cart = {};
  if (fs.existsSync(cartRoute)) {
    cart = parseJsonFile(cartRoute, responseCreator, res);
    if (!cart) return;
  }

  for (const { id, amount } of products) {
    const productRoute = productRoutePrefix + id + productRouteSuffix;

    if (!fs.existsSync(productRoute)) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause(`${productRoute} does not exist.`);
      return res.send(responseCreator.getResponse());
    }

    if (id in cart) {
      cart[id] += amount;
    } else {
      cart[id] = amount;
    }

    if (cart[id] <= 0) {
      delete cart[id];
    }
  }

  if (Object.keys(cart).length === 0) { // if cart is empty
    if (fs.existsSync(cartRoute)) {
      fs.unlinkSync(cartRoute); // delete the cart file
      responseCreator.setCause("Cart is empty and has been deleted.");
    }
  } else {
    const writeCart = writeJsonFile(cartRoute, cart, responseCreator, res);
    if (!writeCart) return;
  }

  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** POST /cart/change/:account **/

const archivedProductRoutePrefix = "./data/archived/product-";

/** POST /purchased/:account **/
app.post("/purchased/:account", (req, res) => {
  const account = req.params.account;
  const { password } = req.body;
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(accountsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const accounts = parseJsonFile(accountsRoute, responseCreator, res);
  if (!accounts) return;

  if (!(account in accounts) || accounts[account] !== password) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Wrong account or password.");
    return res.send(responseCreator.getResponse());
  }

  const purchasedRoute = purchasedRoutePrefix + account + purchasedRouteSuffix;
  if (!fs.existsSync(purchasedRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${purchasedRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const purchasedItems = parseJsonFile(purchasedRoute, responseCreator, res);
  if (!purchasedItems) return;

  let productInfos = [];
  for (const productId in purchasedItems) {
    let productRoute = productRoutePrefix + productId + productRouteSuffix;
    let archivedProductRoute = archivedProductRoutePrefix + productId + productRouteSuffix;

    if (!fs.existsSync(productRoute) && !fs.existsSync(archivedProductRoute)) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause(`Both active and archived files for product ID ${productId} do not exist.`);
      return res.send(responseCreator.getResponse());
    }

    let productInfo = {};
    if (fs.existsSync(productRoute)) {
      productInfo = parseJsonFile(productRoute, responseCreator, res);
      if (!productInfo) return;
    } else {
      productInfo = parseJsonFile(archivedProductRoute, responseCreator, res);
      if (!productInfo) return;

      if (!purchasedItems[productId][1]) {
        purchasedItems[productId][1] = true; // Set isComment to true for archived product
        const writePurchased = writeJsonFile(purchasedRoute, purchasedItems, responseCreator, res);
        if (!writePurchased) return;
      }
    }

    productInfo.amount = purchasedItems[productId][0];  // Set the purchased amount for the product
    productInfo.isComment = purchasedItems[productId][1]; // Set the isComment for the product
    productInfos.push(productInfo);
  }

  responseCreator.setProductInfos(productInfos);
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** POST /purchased/:account **/

/** POST /cart/submit/:account **/
app.post("/cart/submit/:account", (req, res) => {
  const account = req.params.account;
  const { password } = req.body;
  const responseCreator = getResponseCreator();

  if (!fs.existsSync(accountsRoute)) { // Check if accounts.json exists
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const accounts = parseJsonFile(accountsRoute, responseCreator, res);
  if (!accounts) return;

  if (!(account in accounts) || accounts[account] !== password) { // Check if the account and password match
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Wrong account or password.");
    return res.send(responseCreator.getResponse());
  }

  const cartRoute = cartRoutePrefix + account + cartRouteSuffix;
  if (!fs.existsSync(cartRoute)) { // Check if the cart file exists
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Cart is empty.");
    return res.send(responseCreator.getResponse());
  }

  const cart = parseJsonFile(cartRoute, responseCreator, res);
  if (!cart) return;

  let boughtItems = {};
  for (const productId in cart) { // Check if there is enough amount for each product
    let productRoute = productRoutePrefix + productId + productRouteSuffix;
    if (!fs.existsSync(productRoute)) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause(`${productRoute} does not exist.`);
      return res.send(responseCreator.getResponse());
    }

    let productInfo = parseJsonFile(productRoute, responseCreator, res);
    if (!productInfo) return;

    if (productInfo.amount >= cart[productId]) {
      boughtItems[productId] = cart[productId];
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause(`Product ${productId} does not have enough amount.`);
      return res.send(responseCreator.getResponse());
    }
  }

  const purchasedRoute = purchasedRoutePrefix + account + purchasedRouteSuffix;
  if (!fs.existsSync(purchasedRoute)) { // Check if the purchased file exists
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${purchasedRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const purchasedItems = parseJsonFile(purchasedRoute, responseCreator, res);
  if (!purchasedItems) return;

  for (const productId in boughtItems) { // Update the product amount and purchased items
    let productRoute = productRoutePrefix + productId + productRouteSuffix;
    let productInfo = parseJsonFile(productRoute, responseCreator, res);
    if (!productInfo) return;

    productInfo.amount -= boughtItems[productId]; // Subtract the bought amount from the product amount
    const writeProduct = writeJsonFile(productRoute, productInfo, responseCreator, res);
    if (!writeProduct) return;

    let productsInfo = parseJsonFile(productsRoute, responseCreator, res);
    if (!productsInfo) return;

    productsInfo[productId] -= boughtItems[productId]; // update products.json
    const writeProducts = writeJsonFile(productsRoute, productsInfo, responseCreator, res);
    if (!writeProducts) return;

    if (productId in purchasedItems) { // Update the purchased items
      purchasedItems[productId][0] += boughtItems[productId];
    } else {
      purchasedItems[productId] = [boughtItems[productId], false]; // Set isComment to false
    }
  }

  const writePurchased = writeJsonFile(purchasedRoute, purchasedItems, responseCreator, res);
  if (!writePurchased) return;

  fs.unlinkSync(cartRoute); // Delete the cart file
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** POST /cart/submit/:account **/

/** POST /comment/:account/:id **/
app.post("/comment/:account/:id", (req, res) => {
  const { account, id } = req.params;
  const { rating, comment } = req.body;
  const responseCreator = getResponseCreator();

  if (!comment) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Comment cannot be empty.");
    return res.send(responseCreator.getResponse());
  }

  if (!fs.existsSync(accountsRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const accounts = parseJsonFile(accountsRoute, responseCreator, res);
  if (!accounts) return;

  if (!(account in accounts)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Account does not exist.");
    return res.send(responseCreator.getResponse());
  }

  const purchasedRoute = purchasedRoutePrefix + account + purchasedRouteSuffix;
  if (!fs.existsSync(purchasedRoute)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${purchasedRoute} does not exist.`);
    return res.send(responseCreator.getResponse());
  }

  const purchasedItems = parseJsonFile(purchasedRoute, responseCreator, res);
  if (!purchasedItems) return;

  if (!(id in purchasedItems)) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Account has not purchased this product.");
    return res.send(responseCreator.getResponse());
  }

  if (purchasedItems[id][1]) {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("Account has commented before, or the product is archived.");
    return res.send(responseCreator.getResponse());
  }

  const commentRoute = commentsRoutePrefix + id + commentsRouteSuffix;
  if (!fs.existsSync(commentRoute)) {
    const createCommentsJson = { [account]: [rating, comment] }; // Create a new comment JSON file
    const writeComments = writeJsonFile(commentRoute, createCommentsJson, responseCreator, res);
    if (!writeComments) return;

    responseCreator.setCause("Comment has been created.");
  } else {
    const comments = parseJsonFile(commentRoute, responseCreator, res);
    if (!comments) return;

    comments[account] = [rating, comment];
    const writeComments = writeJsonFile(commentRoute, comments, responseCreator, res);
    if (!writeComments) return;
  }

  purchasedItems[id][1] = true; // Set isComment to true
  const writePurchased = writeJsonFile(purchasedRoute, purchasedItems, responseCreator, res);
  if (!writePurchased) return;
  
  responseCreator.setIsSuccess(true);

  return res.send(responseCreator.getResponse());
});
/** POST /comment/:account/:id **/

/** Invalid Routes **/
app.all("*", (req, res) => {
  const responseCreator = getResponseCreator();
  responseCreator.setIsSuccess(false);
  responseCreator.setCause("Invalid route.");
  return res.send(responseCreator.getResponse());
});
/** Invalid Routes **/

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
