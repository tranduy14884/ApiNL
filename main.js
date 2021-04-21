const { response } = require("express");
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const fetch = require("node-fetch");
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

// server.post("/api/accounts/register", (req, res) => {
//   const urlGetApi = "http://localhost:3000/api/accounts";

// });

server.post("/api/accounts/register", (req, res) => {
  //get data
  const useName = req.body.username;
  // res.jsonp(useName);
  const urlGetApi = "http://localhost:3000/api/accounts";
  fetch(urlGetApi)
    .then((data) => data.json())
    .then((listData) => {
      const checkUser = listData.find((item) => item.username === useName);
      // res.jsonp(checkUser);
      if (checkUser) {
        res.status(500).json("Create account failed");
      } else {
        // add data
        const data = {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          provider: "local",
          confirmed: true,
          blocked: null,
          role: 1,
        };
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };
        fetch("http://localhost:3000/api/accounts", options);
        // res.jsonp('thanh cong');
        //get data to show
        fetch(urlGetApi)
          .then((todo) => todo.json())
          .then((data) => {
            const user = data.find(
              (item) => item.username === useName
            );
            const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {});
            res.jsonp({ jwt: accessToken, user });
          });
      }
    });
});

// Use default router
server.use("/api", router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});
