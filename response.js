class Response {
  constructor(isSuccess, cause, personalInfos, productInfos, comments) {
    this.isSuccess = isSuccess;                // success or fail; boolean
    this.cause = cause;                        // cause of fail or warning; string
    this.personalInfos = personalInfos;        // user's information; object
    this.productInfos = productInfos;          // product's information; array
    this.comments = comments;                  // product's comments; array
  }
}

class ResponseCreator {
  constructor() {
    this.isSuccess = null;
    this.cause = null;
    this.personalInfos = null;
    this.productInfos = null;
    this.comments = null;
  }

  setIsSuccess(isSuccess) {
    this.isSuccess = isSuccess;
  }
  setCause(cause) {
    this.cause = cause;
  }
  setPersonalInfos(personalInfos) {
    this.personalInfos = personalInfos;
  }
  setProductInfos(productInfos) {
    this.productInfos = productInfos;
  }
  setComments(comments) {
    this.comments = comments;
  }

  getResponse() {
    return new Response(this.isSuccess, this.cause, this.personalInfos, this.productInfos, this.comments);
  }

  static getCreator() {
    return new ResponseCreator();
  }
}

export default ResponseCreator.getCreator;
