const express = require('express');
const app = express();
const PORT = 8080; //default port *be sure old test is not running anymore!

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// registers a handler on the root path, "/".
app.get('/', (req, res) => {
res.send('Hello There!');

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello' ,(req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)

});