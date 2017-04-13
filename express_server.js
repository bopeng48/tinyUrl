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
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "ran1": {
    id: "ran1",
    email: "1@1.com",
    password: "1"
  }
}







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
  let templateVars = {
  username: req.cookies["user_id"],
  // ... any other vars
  };
  res.render("urls_index.ejs", {templateVar: urlDatabase},templateVars);
});




function generateRandomString() {
  var length = 6;
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

app.get("/urls/new", (req, res) => {

  let templateVars = {
  username: req.cookies["user_id"],
  // ... any other vars
};
console.log(req.cookies["user_id"]);
  res.render("urls_new",templateVars);
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
  // let templateVar = { shortURL: req.params.id};  not used
  let templateVars = {
  username: req.cookies["user_id"],
  // ... any other vars
};

  res.render("urls_show.ejs", templateVars,{ shortURL: req.params.id, longURL: urlDatabase[req.params.id]});
});

app.post("/urls/:id", (req, res) => {
  console.log("in here");
  let short = req.params.id;
  let newUrl = req.body.longURL;
  console.log("short url is ",short ,"new url is ",newUrl);
  urlDatabase[short] = newUrl;
  res.redirect("/urls/"+short);
});






app.get("/login", (req, res) => {

  console.log("*** in get /login ***");
  console.log("req.cookies is ",req.cookies);

  let user = users[req.cookies.user_id];



  let templateVars = {
    username: user
  // ... any other vars
  };


  console.log("currently "+templateVars.username+" is logged in");
  res.render("./partials/_header.ejs",templateVars);
})





// this function handles the authetification process
app.post("/login", (req, res) => {

  console.log("in post /login")


  let userName = req.body.username;
  let password = req.body.password;

  console.log("password entered is",password);

  for(let k in users) {
    if(users[k]["email"] === userName) {
      console.log("username authetification success");
      console.log(users[k]);
      console.log(users[k]["password"], typeof users[k]["password"]);
      if(users[k]["password"] === password) {
        console.log("passWord authetification success");
        res.cookie('user_id',k);
        console.log("login sucess");
        res.redirect("/");
        } else {
          res.status(404).send("password don't match");
        }
      }
    }
  res.status(404).send("entered incorrect credentials");
})











app.post("/logout/:username", (req, res) => {
  let user = req.params.user_id;
  console.log(user, "is trying to log out");
  console.log(typeof user);
  res.clearCookie("user_id",user);
  console.log(user, "is looged out");
  res.redirect("/login");
})


// handling registration

function createUser(inputID,inputEmail,inputPassword){
  let user = {
    id: inputID,
    email: inputEmail,
    password: inputPassword
  };
  return user;
}

app.get("/register", (req, res) => {
  res.render("./urls_register.ejs");
})

app.post("/register", (req, res)=> {
  let email = req.body.email;
  let password = req.body.password;

  if(email ==="" || password ==="") {
    res.status(404).send("fields can't be empty");
  }

  for(var key in users) {
    console.log(typeof users[key], users[key]);
    if(users[key].email === email) {
      res.status(404).send("you've already registered");
    }
  }

  console.log("there's no duplicate");






  let id = generateRandomString();

  users[id] = createUser(id,email,password);
  res.cookie("user_id",id);
  console.log(users[id]);
  console.log(users);

  res.redirect("/");
})










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});