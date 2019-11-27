const express = require("express");
const path = require("path");
const http = require("http");

const app = express();
const routes = require("./routes");

app.set('view engine', 'ejs');
app.set("views", path.resolve(__dirname, "app", "views"));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use("/", routes);
app.use("/files", express.static(path.resolve(__dirname, "assets")));

http.createServer(app).listen(3000, () => console.log("Teste"));
