const PORT = 8080; //default port *be sure old test is not running anymore!
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

const app = express();


app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}




// needs to come before routes
// wlll convert the request body from a buffer into a string that we can read.
// then add dat to the request under the key body

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// registers a handler on the root path, "/".
app.get('/', (request, response) => {
  response.send('Hello There!');
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get('/hello' ,(request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});


// when we cal response.render we need to specify the template, and the object of the variables
// this is server side rendering
app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase, username: request.cookies["username"] };
  response.render("urls_index", templateVars);
});



// order matters, needs to be defined BEFORE the next route.
// routes should be ordered from most specific to least specific.
app.get('/urls/new', (request, response) => {

  const templateVars = { username: request.cookies["username"] };
  response.render('urls_new', templateVars);
  
});

app.get("/urls/:shortURL", (request, response) => {
  const templateVars = { username: request.cookies["username"], shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };

  
  response.render("urls_show", templateVars);
  // console.log('request.params', request.params)
  // console.log('request.params.shortURL', request.params.shortURL)
  // console.log('urlDatabase[request.params.shortURL]', urlDatabase[request.params.shortURL])
});

app.get("/u/:shortURL", (request, response) => {
  console.log('request.params.shortURL',request.params.shortURL)

  const templateVars = { username: request.cookies["username"] };

  const longURL = urlDatabase[request.params.shortURL]
  
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
  response.redirect(`/urls/${shortURL}`)
});


// to delete
app.post("/urls/:shortURL/delete", (request, response) => {

  const urlToDelete = request.params.shortURL;
  delete urlDatabase[urlToDelete]
  response.redirect('/urls/')
  // response.send("ok delete test")
});


// update
app.post("/urls/:shortURL/", (request, response) => {
  const shortURL = request.params.shortURL;

  urlDatabase[shortURL] = request.body.longURL;
  response.redirect('/urls')

});

// login & cookies
app.post("/login", (request, response) => {
  
  console.log(request.body)

  const username = request.body.username
  response.cookie("username", username)
  // response.send(`This is your login ${username}`) //testing the page path is okay

  // const templateVars = {
  //   username: request.cookies["username"],
  // };
  // response.render("urls_index", templateVars);

  response.redirect('/urls')
});

// logout & cookies
app.post("/logout", (request, response) => {

  response.clearCookie("username")
  response.redirect('/urls')
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});

