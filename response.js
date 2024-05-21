class Response {
  constructor(isSuccess, cause, productInfos, amount, comments) {
    this.isSuccess = isSuccess;
    this.cause = cause;
    this.productInfos = productInfos; // product's information; array
    this.amount = amount;             // cart amount; purchased amount;
    this.comments = comments;         // product's comments; array
  }
}

class ResponseCreator {
  constructor() {
    this.isSuccess = null;
    this.cause = null;
    this.productInfos = null;
    this.amount = null;
    this.comments = null;
  }

  setIsSuccess(isSuccess) {
    this.isSuccess = isSuccess;
  }
  setCause(cause) {
    this.cause = cause;
  }
  setProductInfos(productInfos) {
    this.productInfos = productInfos;
  }
  setAmount(amount) {
    this.amount = amount;
  }
  setComments(comments) {
    this.comments = comments;
  }

  getResponse() {
    return new Response(this.isSuccess, this.cause, this.productInfos, this.amount, this.comments);
  }

  static getCreator() {
    return new ResponseCreator();
  }
}

export default ResponseCreator.getCreator;
