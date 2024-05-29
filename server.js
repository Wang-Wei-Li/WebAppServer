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

function parseJsonFile(route, responseCreator, res) { // Parse JSON file with proper error handling
  try {
      return JSON.parse(fs.readFileSync(route));
  } catch (error) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Error parsing JSON file: " + error.message);
      const result = responseCreator.getResponse();
      res.send(result); // Send response from within the function
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
    const result = responseCreator.getResponse();
    res.send(result);
    return false;
  }
}

const productsRoute = "./data/products.json";
const productRoutePrefix = "./data/product-";
const productRouteSuffix = ".json";

// GET

/** GET /product **/
app.get("/product", (req, res) => {
  const responseCreator = getResponseCreator();

  let productInfos = [];
  if (fs.existsSync(productsRoute)) {
    const products = parseJsonFile(productsRoute, responseCreator, res);
    if(!products) return;

    const productsArray = Object.keys(products);
    for(const productId of productsArray) {
      let productRoute = productRoutePrefix + productId + productRouteSuffix;
      if (fs.existsSync(productRoute)) {
        const productInfo = parseJsonFile(productRoute, responseCreator, res);
        if(!productInfo) return;
        productInfos.push(productInfo);
      } else {
        responseCreator.setCause("Some products do not exist. Please remind backend developers.");
        
      }
    }

    responseCreator.setIsSuccess(true);
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${productsRoute} does not exist.`);
  }
  responseCreator.setProductInfos(productInfos);

return res.send(responseCreator.getResponse());
});
/** GET /product **/

const viewcountsRoute = "./data/viewcounts.json";

/** GET /product/:id **/
app.get("/product/:id", (req, res) => {
  const productId = req.params.id;
  const responseCreator = getResponseCreator();
  const productRoute = productRoutePrefix + productId + productRouteSuffix;

  let productInfos = [];
  if(fs.existsSync(productRoute)) {
    const productInfo = parseJsonFile(productRoute, responseCreator, res);
    if(!productInfo) return;
    productInfos.push(productInfo);
    responseCreator.setIsSuccess(true);

    if(fs.existsSync(viewcountsRoute)) {
      const viewcounts = parseJsonFile(viewcountsRoute, responseCreator, res);
      if(!viewcounts) return;
      viewcounts[productId] += 1;
      const writeVeiwcounts = writeJsonFile(viewcountsRoute, viewcounts, responseCreator, res);
      if(!writeVeiwcounts) return;
    } else { // if viewcounts.json does not exist, create it
      const createViewcountsJson = {};
      createViewcountsJson[productId] = 1;
      const writeVeiwcounts = writeJsonFile(viewcountsRoute, createViewcountsJson, responseCreator, res);
      if(!writeVeiwcounts) return;
    }
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${productRoute} does not exist.`);
  }
  responseCreator.setProductInfos(productInfos);

return res.send(responseCreator.getResponse());
});
/** GET /product/:id **/

const recommendationsRoute = "./data/recommendations.json";

/** GET /recommendation **/
app.get("/recommendation", (req, res) => {
  const responseCreator = getResponseCreator();

  let recommendationInfos = [];
  if (fs.existsSync(recommendationsRoute)) {
    const recommendations = parseJsonFile(recommendationsRoute, responseCreator, res);
    if(!recommendations) return;
    const recommendationsArray = Object.values(recommendations);
    let isRecommendationsValid = true;
    for (const productId of recommendationsArray) {
      let productRoute = productRoutePrefix + productId + productRouteSuffix;
      if (fs.existsSync(productRoute)) {
        const recommendationInfo = parseJsonFile(productRoute, responseCreator, res);
        if(!recommendationInfo) return;
        recommendationInfos.push(recommendationInfo);
      } else {
        responseCreator.setIsSuccess(false);
        responseCreator.setCause(`${productRoute} does not exist.`);
        isRecommendationsValid = false;
        break;
      }
    }

    if (isRecommendationsValid) {
      responseCreator.setIsSuccess(true);
    } else {
      recommendationInfos = [];
    }
  } else { 
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${recommendationsRoute} does not exist.`);
  }
  responseCreator.setProductInfos(recommendationInfos);

return res.send(responseCreator.getResponse());
});
/** GET /recommendation **/

/** GET /recommendation/:rank **/
app.get("/recommendation/:rank", (req, res) => {
  const rank = req.params.rank;
  const responseCreator = getResponseCreator();

  let productInfos = [];
  if (fs.existsSync(recommendationsRoute)) {
    const recommendations = parseJsonFile(recommendationsRoute, responseCreator, res);
    if (!recommendations) return;
    if (rank in recommendations) {  // Check if the rank is a valid key in the recommendations object
      const productId = recommendations[rank];
      const productRoute = productRoutePrefix + productId + productRouteSuffix;
      if (fs.existsSync(productRoute)) {
        const productInfo = parseJsonFile(productRoute, responseCreator, res);
        if (!productInfo) return;
        productInfos.push(productInfo);
        responseCreator.setIsSuccess(true);
      } else {
        responseCreator.setIsSuccess(false);
        responseCreator.setCause(`${productRoute} does not exist.`);
      }
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Invalid rank.");
    }
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${recommendationsRoute} does not exist.`);
  }
  responseCreator.setProductInfos(productInfos);

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

  let commentArray = [];
  if(fs.existsSync(commentRoute)) {
    const comments = parseJsonFile(commentRoute, responseCreator, res);
    if(!comments) return;
    commentArray = Object.values(comments); // Convert object to array
    responseCreator.setIsSuccess(true);
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause("No comments yet.");
  }
  responseCreator.setComments(commentArray);

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

const accountsRoute = "./data/accounts.json";

// POST

/** POST /register **/
app.post("/register", (req, res) => {
  const { account, password } = req.body;
  const responseCreator = getResponseCreator();

  if (fs.existsSync(accountsRoute)) {
    const accounts = parseJsonFile(accountsRoute, responseCreator, res);
    if (!accounts) return;

    if (account in accounts) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Account already exists.");
    } else {
      accounts[account] = password;
      const writeAccounts = writeJsonFile(accountsRoute, accounts, responseCreator, res);
      if(!writeAccounts) return;
      responseCreator.setIsSuccess(true);
    }
  } else { // if accounts.json does not exist
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
  }

return res.send(responseCreator.getResponse());
});
/** POST /register **/

/** POST /login **/
app.post("/login", (req, res) => {
  const { account, password } = req.body;
  const responseCreator = getResponseCreator();

  if (fs.existsSync(accountsRoute)) {
    const accounts = parseJsonFile(accountsRoute, responseCreator, res);
    if (!accounts) return;

    if (account in accounts && accounts[account] === password) {
      responseCreator.setIsSuccess(true);
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Wrong account or password.");
    }
  } else { // if accounts.json does not exist
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
  }

return res.send(responseCreator.getResponse());
});
/** POST /login **/

/** POST /product **/
app.post("/product", (req, res) => {
  const { filters } = req.body;
  const responseCreator = getResponseCreator();

  if (fs.existsSync(productsRoute)) {
    const products = parseJsonFile(productsRoute, responseCreator, res);
    if(!products) return;
    
    let productInfos = [];

    const productsArray = Object.keys(products);
    for(const productId of productsArray) {
      let productRoute = productRoutePrefix + productId + productRouteSuffix;
      if (fs.existsSync(productRoute)) {
        let productInfo = parseJsonFile(productRoute, responseCreator, res);
        if(!productInfo) return;
        
        let matchAllFilters = true;
        for(const filter of filters) {
          let match = false;
          for(const category of productInfo["categories"]) {
            if(filter == category) {
              match = true;
              break;
            }
          }
          
          if(!match) {
            matchAllFilters = false;
            break;
          }
        }
        
        if(matchAllFilters) {
          productInfos.push(productInfo);
        }
      } else {
        responseCreator.setCause("Some products do not exist. Please remind backend developers.");
      }
    }
    responseCreator.setIsSuccess(true);
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${productsRoute} does not exist.`);
  }
  responseCreator.setProductInfos(productInfos);
  
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

  let productInfos = [];
  if (fs.existsSync(accountsRoute)) {
    const accounts = parseJsonFile(accountsRoute, responseCreator, res);
    if (!accounts) return;
    
    if((account in accounts) && accounts[account] === password) {
      const cartRoute = cartRoutePrefix + account + cartRouteSuffix;
      if(fs.existsSync(cartRoute)) {
        const cart = parseJsonFile(cartRoute, responseCreator, res);
        if (!cart) return;
        
        let allProductsExist = true;
        const cartArray = Object.keys(cart);
        for(const productId of cartArray) {
          let productRoute = productRoutePrefix + productId + productRouteSuffix;
          if (fs.existsSync(productRoute)) {
            let productInfo = parseJsonFile(productRoute, responseCreator, res);
            if (!productInfo) return;
            productInfo["amount"] = cart[productId];
            productInfos.push(productInfo);
          } else {
            responseCreator.setCause(`${productRoute} does not exist.`);
            allProductsExist = false;
            productInfos = [];
            break;
          }
        }
        responseCreator.setIsSuccess(allProductsExist);
      } else {
        responseCreator.setIsSuccess(false);
        responseCreator.setCause("Cart is empty.");
      }
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Wrong account or password.");
    }
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
  }
  responseCreator.setProductInfos(productInfos);

return res.send(responseCreator.getResponse());
});
/** POST /cart/:account **/

/** POST /cart/change/:account **/
app.post("/cart/change/:account", (req, res) => {
  const account = req.params.account;
  const { password, products } = req.body;
  const responseCreator = getResponseCreator();

  if (fs.existsSync(accountsRoute)) {
    const accounts = parseJsonFile(accountsRoute, responseCreator, res);
    if (!accounts) return;
    if((account in accounts) && accounts[account] === password) {
      const cartRoute = cartRoutePrefix + account + cartRouteSuffix;

      let cart = {};
      if (fs.existsSync(cartRoute)) {
        cart = parseJsonFile(cartRoute, responseCreator, res);
        if (!cart) return;
      }

      for(const { id, amount } of products) {
        if(id in cart) {
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
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Wrong account or password.");
    }
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
  }

return res.send(responseCreator.getResponse());
});
/** POST /cart/change/:account **/

const archivedProductRoutePrefix = "./data/archived/product-";

const purchasedRoutePrefix = "./data/purchased-";
const purchasedRouteSuffix = ".json";

/** POST /purchased/:account **/
app.post("/purchased/:account", (req, res) => {
  const account = req.params.account;
  const { password } = req.body;
  const responseCreator = getResponseCreator();

  let productInfos = [];
  if (fs.existsSync(accountsRoute)) {
    const accounts = parseJsonFile(accountsRoute, responseCreator, res);
    if (!accounts) return;

    if (account in accounts && accounts[account] === password) {
      const purchasedRoute = purchasedRoutePrefix + account + purchasedRouteSuffix;
      if (fs.existsSync(purchasedRoute)) {
        const purchasedItems = parseJsonFile(purchasedRoute, responseCreator, res);
        if (!purchasedItems) return;

        let allProductsExist = true;
        for (const productId in purchasedItems) {
          let productInfo = null;
          let productRoute = productRoutePrefix + productId + productRouteSuffix;
          if (fs.existsSync(productRoute)) {
            productInfo = parseJsonFile(productRoute, responseCreator, res);
            if (!productInfo) return;
          } else {
            productRoute = archivedProductRoutePrefix + productId + productRouteSuffix;
            if (fs.existsSync(productRoute)) {
              productInfo = parseJsonFile(productRoute, responseCreator, res);
              if (!productInfo) return;
            } else {
              responseCreator.setCause(`Both active and archived files for product ID ${productId} do not exist.`);
              allProductsExist = false;
              break;
            }
          }
          productInfo.amount = purchasedItems[productId][0];  // Set the purchased amount for the product
          productInfo.isComment = purchasedItems[productId][1]; // Set the isComment for the product
          productInfos.push(productInfo);
        }
        
        responseCreator.setIsSuccess(allProductsExist);
      } else {
        responseCreator.setIsSuccess(false);
        responseCreator.setCause(`${purchasedRoute} does not exist.`);
      }
    } else {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Wrong account or password.");
    }
  } else {
    responseCreator.setIsSuccess(false);
    responseCreator.setCause(`${accountsRoute} does not exist.`);
  }
  responseCreator.setProductInfos(productInfos);

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

    if (productId in purchasedItems) { // Update the purchased items
      purchasedItems[productId][0] += boughtItems[productId];
    } else {
      purchasedItems[productId][0] = boughtItems[productId];
      purchasedItems[productId][1] = false; // Set isComment to false
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
  const { comment } = req.body;
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

  const commentRoute = commentsRoutePrefix + id + commentsRouteSuffix;
  if (fs.existsSync(commentRoute)) {
    const comments = parseJsonFile(commentRoute, responseCreator, res);
    if (!comments) return;

    if (comments[account]) {
      responseCreator.setIsSuccess(false);
      responseCreator.setCause("Account has commented before.");
    } else {
      comments[account] = comment;
      const writeComments = writeJsonFile(commentRoute, comments, responseCreator, res);
      if(!writeComments) return;
      purchasedItems[id][1] = true; // Set isComment to true
      const writePurchased = writeJsonFile(purchasedRoute, purchasedItems, responseCreator, res);
      if(!writePurchased) return;
      responseCreator.setIsSuccess(true);
    }
  } else {
    const createCommentsJson = {[account] : comment};
    const writeComments = writeJsonFile(commentRoute, createCommentsJson, responseCreator, res);
    if(!writeComments) return;
    purchasedItems[id][1] = true; // Set isComment to true
    const writePurchased = writeJsonFile(purchasedRoute, purchasedItems, responseCreator, res);
    if(!writePurchased) return;
    responseCreator.setIsSuccess(true);
    responseCreator.setCause("Comment has been created.");
  }
  
  return res.send(responseCreator.getResponse());
});
/** POST /comment/:account/:id **/

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
