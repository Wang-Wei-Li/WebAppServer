class ProductInfo {
  constructor(id, name, price, author, summary, amount, categories) {
    this.id = id;                 // unique for each product
    this.name = name;
    this.price = price;
    this.author = author;
    this.summary = summary;
    this.amount = amount;         // available amount
    this.categories = categories; // array
    this.isComment = isComment;
  }
}

class ProductInfoCreator {
  constructor() {
    this.id = null;
    this.name = null;
    this.price = null;
    this.author = null;
    this.summary = null;
    this.amount = null;
    this.categories = null;
    this.isComment = null;
  }

  setId(id) {
    this.id = id;
  }
  setName(name) {
    this.name = name;
  }
  setPrice(price) {
    this.price = price;
  }
  setAuthor(author) {
    this.author = author;
  }
  setSummary(summary) {
    this.summary = summary;
  }
  setAmount(amount) {
    this.amount = amount;
  }
  setCategories(categories) {
    this.categories = categories;
  }
  setIsComment(isComment) {
    this.isComment = isComment;
  }

  getProductInfo() {
    return new ProductInfo(this.id, this.name, this.price, this.author, this.summary, this.amount, this.categories, this.isComment);
  }

  static getCreator() {
    return new ProductInfoCreator();
  }
}

export default ProductInfoCreator.getCreator;
