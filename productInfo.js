class ProductInfo {
  constructor(id, name, author, summary, amount, categories) {
    this.id = id;                 // unique for each product
    this.name = name;
    this.author = author;
    this.summary = summary;
    this.amount = amount;         // available amount
    this.categories = categories; // array
  }
}

class ProductInfoCreator {
  constructor() {
    this.id = null;
    this.name = null;
    this.author = null;
    this.summary = null;
    this.amount = null;
    this.categories = null;
  }

  setId(id) {
    this.id = id;
  }
  setName(name) {
    this.name = name;
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

  getProductInfo() {
    return new ProductInfo(this.id, this.name, this.author, this.summary, this.amount, this.categories);
  }

  static getCreator() {
    return new ProductInfoCreator();
  }
}

export default ProductInfoCreator.getCreator;
