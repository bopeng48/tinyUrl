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

var cookieSession = require('cookie-session')

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["banana", "mango"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


const bcrypt = require('bcrypt');

// custom middle ware for user authetification
app.use("/urls",function (req, res, next) {
  console.log("middleware ran");
  if(!req.session.user_id) {
    console.log("redirection is going to happen");
    res.redirect("/login");
    return;
  }
  next();
})

app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": {
    "longURL": "http://www.lighthouselabs.ca",
    "userID": "userRandomID"
  },
  "9sm5xK": {
    "longURL": "http://www.google.com",
    "userID": "user2RandomID"
  }
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
  },
  "UEehfW": {
    id: "UEehfW",
    email: '2@2.com',
    password: '$2a$10$BqbxO2z5ion7mfSLoyCRfO0uQhTF/tZ5vET5gEg9bahSV20PvsAnO'
  }
}


app.get("/", (req, res) => {
  console.log("--> get / ran");

  // if user has logged in, show list of saved urls, else prompt for login
  if(req.session.user_id) {
    console.log("------ leaving get /, redirecting to /urls");
    res.redirect("/urls");
  } else {
    console.log("------ ");
    res.redirect("/login");
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});



// -- get /urls , renders page to display links belong to this user

app.get("/urls", (req, res) => {


  console.log("--> get /urls ran");

  console.log("***\n");
  console.log("Database currently:", urlDatabase);
  console.log("***\n");

  console.log("----->> leaving get /urls, rendering urls_index.ejs\n");
  res.render("urls_index.ejs", {templateVar: urlDatabase, user_id :req.session.user_id});
});


// -- post /urls ,
app.post("/urls", (req, res) => {
  console.log("--> post /urls ran");

  let user = req.session.user_id;
  if(user === undefined)
  {
    res.status(404).send("you are not logged in");
  }


  // generates shorurl , store and redirect
    var shortURL = generateRandomString();
    var tempObject = {};
    tempObject["longURL"] = req.body.longURL;
    tempObject["userID"] = user;
    urlDatabase[shortURL] = tempObject;
    let add = `/urls/${shortURL}`;
    console.log(add);

  console.log("----->> leaving post /urls, redirecting to get urls/:shortURL");
  res.redirect(add);         // Respond with 'Ok' (we will replace this)
});


// utility function
function generateRandomString() {
  var length = 6;
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


// -- get /urls/new
app.get("/urls/new", (req, res) => {
  console.log("--> get /urls/new ran")

  // check if user has logged in, else user will be asked to log in
  let userid = req.session.user_id;
  if(userid === undefined) {
    res.redirect("/login");
    return;
  }

  console.log("userid is ",userid);
  console.log("users data base looks like ",users);
  console.log("user is",users[userid]);



  let userEmail = users[userid]["email"];

  console.log("----->> leaving get /urls/new , rendering urls_new.ejs\n");


  res.render("urls_new", {user_id: userEmail, logged_in:true});
});



// delete URL
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

})

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...

  console.log("/n");
  console.log("@@@@@@ in get /u/shortURL");

  // -- Initialization
  let tempShortURL = urlDatabase[req.params.shortURL];
  if(!tempShortURL) {
    console.log("loading shortURL object failed");
    console.log("---DataBase looks like shit", urlDatabase);
    console.log("req.params.shortURL is", req.params.shortURL);
  }

  console.log("short url is",req.params.shortURL);
  console.log("the data base looks like", urlDatabase);
  console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL]["longURL"];

  // append http header on to the entered address
  let header = "http://";
  let fullURL = header + longURL;
  console.log("longurl = ",longURL, "type is ",typeof longURL);
  res.redirect(fullURL);
});

// request routing
// this funciton is not finished



app.get("/urls/:id", (req, res) => {
  // let templateVar = { shortURL: req.params.id};  not used
  console.log("In get /urls/:id");


  let shortURL = req.params.id;

  if(urlDatabase[shortURL] === undefined) {
    res.status(404).send("this url not in database");
  }

  if(urlDatabase[shortURL]["userID"] !== req.session.user_id) {
    res.status(403).send("this link doesn't belong to you");
  }


  var first = req.params.id;
  var second = urlDatabase[req.params.id].longURL;
  console.log("first is",first);
  console.log("second is",second);
  console.log("from /urls/:id to send off to a different page");
  // console.log("req.params.id.longURL is ", req.params.id);

  // res.render("urls_new",templateVars);
  res.render("urls_show",{ shortURL: first, longURL: second });
});


app.post("/urls/:id", (req, res) => {
  console.log("##### in post /urls/:id");
  let short = req.params.id;
  let newUrl = req.body.longURL;
  console.log("short url is ",short ,"new url is ",newUrl);
  urlDatabase[short] = newUrl;
  res.redirect("/urls/"+short);
});


app.get("/login", (req, res) => {

  console.log("*** in get /login ***");

  let user = users[req.session.user_id];

  console.log(req.session.user_id);
  console.log(user);

  let loggedIn = false;
  if (user) {
    console.log("use logged in");
    loggedIn = true;
    res.render("./partials/_header.ejs", {user_id: user["email"], logged_in :loggedIn});
    return;
  }

  res.render("./partials/_header.ejs", {user_id: "Unknown", logged_in :loggedIn});



})


// User login
app.post("/login", (req, res) => {

  console.log("in post /login")


  let userName = req.body.username;
  let password = req.body.password;

  console.log("password entered is",password);

// k is the user id stored in the database
  for(let k in users) {
    if(users[k]["email"] === userName) {
      console.log("username authetification success");
      console.log(users[k]);
      console.log(users[k]["password"], typeof users[k]["password"]);
      if(bcrypt.compareSync(password, users[k]["password"]))  {
        console.log("passWord authetification success");
        req.session.user_id = k;
        console.log("login sucess");
        res.redirect("/");
        return;
        } else {
          res.status(404).send("password don't match");
        }
      }
    }
  res.status(404).send("entered incorrect credentials");
})



app.post("/logout/:user_id", (req, res) => {
  let user = req.session.user_id;
  console.log(user, "is trying to log out");
  console.log(typeof user);
  req.session = null;
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


// user regisstration
app.post("/register", (req, res)=> {

  console.log("in /register file");

  let email = req.body.email;
  let password = req.body.password;

  if(email ==="" || password ==="") {
    res.status(404).send("fields can't be empty");
  }

  console.log("filds aren't empty");

  for(var key in users) {
    console.log(typeof users[key], users[key]);
    if(users[key].email === email) {
      res.status(404).send("you've already registered");
    }
  }

  console.log("there's no duplicate");


  let hashedPW = bcrypt.hashSync(password,10);

  console.log("hashedPW is ", hashedPW);

  let id = generateRandomString();  // user id in this website

  users[id] = createUser(id,email,hashedPW);
  console.log("user profile has been created");

  req.session.user_id = id;
  console.log(users[id]);
  console.log(users);

  res.redirect("/");
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});