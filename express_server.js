// const http = require("http");

// const PORT = 8080;

// // a function which handles requests and sends response
// function requestHandler(request, response) {
//   if (request.url == "/") {
//     response.end("Welcome!");
//   } else if (request.url == "/urls") {
//     response.end("www.lighthouselabs.ca\nwww.google.com");
//   } else {
//     response.statusCode = 404;
//     response.end("Unknown Path");
//   }
// }

// var server = http.createServer(requestHandler);  // requestHandler is a type of requestListener which i
// // automatically added to the 'request' event

// server.listen(PORT, () => {
//   console.log(`Server listening on: http://localhost:${PORT}`);
// });


var express = require("express");
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};






app.get("/", (req, res) => {
  res.end("Hello!");
});






app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


// ** I wrote this
// app.get("/urls", (req, res) => {
//   res.render('urls_index', {})
// })


app.get("/urls", (req, res) => {
  //let templateVars = { urls: urlDatabase };
  //console.log(templateVars.urls);
  // for(var k in templateVars.urls){
  //   console.log(k);
  // }
  res.render("urls_index.ejs", {templateVars: urlDatabase});
});

  // let templateVars = { urls: urlDatabase };
// console.log(templateVars.urls['b2xVn2']);
// for(var key in templateVars.urls)
// {
//   console.log(templateVars.urls[key]);
// }


function generateRandomString() {
  var length = 6;
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
    var rand = generateRandomString();
    urlDatabase[rand] = req.body.longURL;
    // debug statement to see POST parameters
    console.log(urlDatabase);
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:id/delete", (req, res) => {
  var keey = req.params.id;
  console.log("key is",keey);
  delete urlDatabase[keey];
  console.log("after deletion the data base is",urlDatabase);
  res.redirect("/urls");
})

app.post('/urls/:id/update', (req, res) => {
  console.log("trying to go to",req.params.id);
  res.redirect("/urls/"+req.params.id);
  // res.redirect("/urls/b2xVn2");
})

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  console.log(req.params.shortURL);
  let longURL = urlDatabase[req.params.shortURL];
  console.log("longurl = ",longURL);
  res.redirect(longURL);
});


// request routing

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id};

  res.render("urls_show.ejs", { shortURL: req.params.id, longURL: urlDatabase[req.params.id]});
});

app.post("/urls/:id", (req, res) => {
  console.log("in here");
  let short = req.params.id;
  let newUrl = req.body.longURL;
  console.log("short url is ",short ,"new url is ",newUrl);
  urlDatabase[short] = newUrl;
  res.redirect("/urls/"+short);
});








app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});