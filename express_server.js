const PORT = 8080; //default port *be sure old test is not running anymore!
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

const app = express();


app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// TODO file fo helper functions
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

const emailLookup = (email, password) => {
  // TODO if email exists?
  if (email === '' || password === '') {
    return true

  } 
  // incoming email; does the key exist?
  for (let userId in users) {
    if(users[userId].email === email) {
      return true
    }
  }
}


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
  }
};



// registers a handler on the root path, "/".
app.get('/', (request, response) => {
  response.send('Hello There!');
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});


// when we call response.render we need to specify the template, and the object of the variables
// this is server side rendering
app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase, user: users[request.cookies['user_id']] };
  response.render("urls_index", templateVars);
});



// order matters, needs to be defined BEFORE the next route.
// routes should be ordered from most specific to least specific.
app.get('/urls/new', (request, response) => {
  const templateVars = { user: users[request.cookies['user_id']]};
  response.render('urls_new', templateVars);

});

app.get("/urls/:shortURL", (request, response) => {
  const templateVars = { user: users[request.cookies['user_id']], shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };

  response.render("urls_show", templateVars);
  // console.log('request.params', request.params)
  // console.log('request.params.shortURL', request.params.shortURL)
  // console.log('urlDatabase[request.params.shortURL]', urlDatabase[request.params.shortURL])
});

app.get("/u/:shortURL", (request, response) => {
  console.log('request.params.shortURL', request.params.shortURL);

  const longURL = urlDatabase[request.params.shortURL];

  response.redirect(longURL);
});


// receives a POST request to /urls it responds with a redirection to
// /urls/:shortURL, where shortURL is the random string we generated.
app.post("/urls", (request, response) => {
  console.log(request.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();

  urlDatabase[shortURL] = request.body.longURL;
  // console.log(urlDatabase);
  // console.log('request.body.longURL', request.body.longURL)

  // need to redirect
  response.redirect(`/urls/${shortURL}`);
});


// to delete
app.post("/urls/:shortURL/delete", (request, response) => {

  const urlToDelete = request.params.shortURL;
  delete urlDatabase[urlToDelete];
  response.redirect('/urls/');
  // response.send("ok delete test")
});


// update
app.post("/urls/:shortURL/", (request, response) => {
  const shortURL = request.params.shortURL;

  urlDatabase[shortURL] = request.body.longURL;
  response.redirect('/urls');
});

// login & cookies
app.post("/login", (request, response) => {

  console.log(request.body);

  const username = request.body.username;
  response.cookie("username", username);
  // response.send(`This is your login ${username}`) //testing the page path is okay
  response.redirect('/urls');
});

// logout & cookies
app.post("/logout", (request, response) => {

  response.clearCookie("username");
  response.redirect('/urls');
});

// register
app.get('/register', (request, response) => {
  const templateVars = { user: request.user };
  response.render("register_page", templateVars);

});


// register
// add a new user object to the global users object.
app.post('/register', (request, response) => {

  // form sends back body to parse
  const incomingEmail = request.body.email;
  const incomingPassword = request.body.password;
  // Generate a random user ID,
  const incomingID = generateRandomString();


  if (emailLookup(incomingEmail, incomingPassword)) {
    response.status(400).send("Invaild Entry")
  } else {

  //add the user to the user object. 
  // create new object to add
  const newUser = {
    id: incomingID,
    email: incomingEmail,
    password: incomingPassword
  };

  users[incomingID] = newUser;

  console.log(users);

  // set a user_id cookie containing the user's newly generated ID.
  const username = request.body.username;
  // console.log("user_id", users[incomingID])
  response.cookie("user_id", incomingID);

  // Redirect the user to the /urls page.
  response.redirect('/urls');

  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});







// const emailLookup = (email, password) => {
//   // TODO if email exists?
//   if (email === '' || password === '') {
//     response.status(400).send('Empty string')
//   } 
//   // incoming email; does the key exist?
//   for (let userId in users) {
//     if(users[userId].email === email) {
//       response.status(400).send('User exits')
//     }
//   }
// }