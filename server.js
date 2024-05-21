import express from "express";

const app = express();
const PORT = 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// GET
app.get("/product", (req, res) => {});

app.get("/product/:id", (req, res) => {});

app.get("/product/image/:id", (req, res) => {});

app.get("/recommendation", (req, res) => {});

app.get("/recommendation/:rank", (req, res) => {});

app.get("/comment/:id", (req, res) => {});

// POST
app.post("/register", (req, res) => {});

app.post("/login", (req, res) => {});

app.post("/product", (req, res) => {});

app.post("/cart/:account", (req, res) => {});

app.post("/purchased/:account", (req, res) => {});

app.post("/cart/change/:account", (req, res) => {});

app.post("/cart/submit/:account", (req, res) => {});

app.post("/comment/:account/:id", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
