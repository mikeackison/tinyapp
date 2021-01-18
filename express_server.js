const express = require('express');
const app = express();
const PORT = 8080; //default port *be sure old test is not running anymore!

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// registers a handler on the root path, "/".
app.get('/', (request, response) => {
response.send('Hello There!');
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get('/hello' ,(request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n')
});

app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});


// order matters, needs to be defined BEFORE the next route.
// routes should be ordered from most specific to least specific.
app.get('/urls/new', (request, response) => {
  response.render('urls_new');
})

app.get("/urls/:shortURL", (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };
  response.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)

});