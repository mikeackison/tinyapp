const PORT = 8080; //default port
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

const {
  generateRandomString,
  emailExists,
  isFieldBlank,
  urlsForUser,
  currentUserId,
  getUserByEmail
} = require('./helpers');


app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({ extended: true }));




const urlDatabase = {
  b6UTxQ: { longURL: "https://www.lighthouselabs.ca/", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  jfsd43: { longURL: "https://repl.it/", userID: "494e44" }
};


const passwordA = "12345678";
const passwordB = "87654321";

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "m@a.com",
    password: bcrypt.hashSync(passwordA, saltRounds)
  },
  "494e44": {
    id: "494e44",
    email: "j@b.ca",
    password: bcrypt.hashSync(passwordB, saltRounds)
  }
};


// registers a handler on the root path, "/".
app.get('/', (request, response) => {
  const userID = currentUserId(request);

  if (userID === undefined) {
    response.redirect("/login");

  } else {
    response.redirect("/urls");
  }
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
  const userID = currentUserId(request);

  // function returns a new object with the urls; pass that into templateVars
  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID],
    error: null
  };
  // console.log("template Vars", templateVars);
  response.render("urls_index", templateVars);
});

// order matters, needs to be defined BEFORE the next route.
// routes should be ordered from most specific to least specific.

app.get('/urls/new', (request, response) => {
  const userID = currentUserId(request);

  // if user is not logged in trying to access url page
  // redirect to login
  // we know they are logged in based on the cookies
  if (userID !== undefined) {
    const templateVars = { user: users[request.session['user_id']] };

    response.render('urls_new', templateVars);
  } else {
    response.redirect("/login");
  }

});

app.get("/urls/:shortURL", (request, response) => {
  const userID = currentUserId(request);

  if (userID) {

    // console.log('user ID', userID)
    // console.log("this stuff url in browser:", request.params.shortURL)
    // console.log("this stuff the user ID of the url in browser:", urlDatabase[request.params.shortURL].userID)
    // const shortURLUserID =urlDatabase[request.params.shortURL].userID

    const shortURLs = Object.keys(urlDatabase);
    if (!shortURLs.includes(request.params.shortURL)) {

      response.render('urls_index', { user: userID, error: "Sorry, that's not a real URL." });

    }

    else if (userID !== urlDatabase[request.params.shortURL].userID) {

      response.render('urls_index', { user: users[userID], error: "Sorry, you don't have that URL." });

    }

    // if user id is exactly equal to the shortURL id
    else if (userID === urlDatabase[request.params.shortURL].userID) {
      const templateVars = {
        user: users[userID],
        shortURL: request.params.shortURL,
        longURL: urlDatabase[request.params.shortURL].longURL,
        error: null
      };

      //  render the page with the short url ID
      response.render("urls_show", templateVars);
      return;
      //  otherwsie, redierct to users list of urls
    } else {
      response.render('urls_show', { user: null, error: "Sorry you can 't see that." });
      return;
    }

  } else {
    console.log('You made it here')
    response.render('urls_index', { user: null, error: "Sorry, that's not a real url." });
    console.log("NO USER")
    return
  }

});

app.get("/u/:shortURL", (request, response) => {
  // console.log('request.params.shortURL', request.params.shortURL);

  const longURL = urlDatabase[request.params.shortURL].longURL;

  response.redirect(longURL);
});

// receives a POST request to /urls it responds with a redirection to
// /urls/:shortURL, where shortURL is the random string we generated.
app.post("/urls", (request, response) => {
  const userID = currentUserId(request);

  // console.log(request.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();

  urlDatabase[shortURL] = { longURL: request.body.longURL, userID };


  console.log(urlDatabase);
  // console.log('request.body.longURL', request.body.longURL)

  // need to redirect
  response.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (request, response) => {
  const userID = currentUserId(request);
  const urlToDelete = request.params.shortURL;

  if (urlDatabase[urlToDelete].userID === userID) {
    delete urlDatabase[urlToDelete];
  }

  response.redirect('/urls/');
});

// update edit
app.post("/urls/:shortURL/", (request, response) => {
  const userID = currentUserId(request);
  const shortURL = request.params.shortURL;

  // urlDatabase[shortURL] = request.body.longURL;
  urlDatabase[shortURL] = { longURL: request.body.longURL, userID };

  response.render('urls_show');

});

// login updated
app.post("/login", (request, response) => {
  // const userID = currentUserId(request);

  let email = request.body.email;
  let password = request.body.password;

  // users[user].password === password

  for (let user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      request.session['user_id'] = users[user].id;
      response.redirect('/urls');
      return;
    }
  }
  response.render('login_form', { user: null, error: "Bad username or password" })
  return;

});

// login page
app.get('/login', (request, response) => {
  const userID = currentUserId(request);

  if (userID) {
    response.redirect('/urls');

  }
  const templateVars = { user: users[request.session['user_id']] };

  response.render('login_form', templateVars);
});

// logout & cookies
app.post("/logout", (request, response) => {

  request.session = null;

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


  if (isFieldBlank(incomingEmail, incomingPassword)) {
    // response.status(400).send("Invaild Entry");
    response.render('register_page', { user: null, error: "Bad username or password" })
  } else if (emailExists(incomingEmail, users)) {
    response.render('register_page', { user: null, error: "Bad username or password" });

  } else {

    //add the user to the user object.
    // create new object to add

    // hash the password

    const newUser = {
      id: incomingID,
      email: incomingEmail,
      password: bcrypt.hashSync(incomingPassword, saltRounds)

    };

    users[incomingID] = newUser;

    // console.log(users);

    // response.cookie("user_id", incomingID); //remove
    request.session['user_id'] = incomingID;

    // Redirect the user to the /urls page.
    response.redirect('/urls');

  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

