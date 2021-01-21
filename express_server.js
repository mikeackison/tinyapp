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
  b6UTxQ: { longURL: "https://www.lighthouselabs.ca/", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  jfsd43: { longURL: "https://repl.it/", userID: "494e44"}
};


// TODO file fo helper functions
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}


const emailExists = (email) => {
  for (let userId in users) {
    if(users[userId].email === email) {
      return true
    }
  }
}

const isFeildBlank = (email, password) => {
  if (email === '' || password === '') {
    return true
  } 
}

// Create a function named urlsForUser(id) which returns
// the URLs where the userID is equal to the id of the currently logged-in user.

const urlsForUser = (id) => {
  //pass in the id of the current user
  // create a new object
  const userUrlDatabase = {}

  for (let url in urlDatabase) {
  // loop through the urlDatabase object for all the urls
    if(urlDatabase[url].userID === id) {
  // if the key[value].userID matches the curerent user id
  // return all of the matching values (only matching), put the urlDatabase into the new userUrlDatabse
      userUrlDatabase[url] = urlDatabase[url]
    } 
  }
  return userUrlDatabase
}


const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "m@a.com",
    password: "12345678"
  },
  "494e44": {
    id: "494e44",
    email: "j@b.ca",
    password: "12345678"
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
  let userID = request.cookies['user_id']
  

  // function returns a new object with the urls; pass that into templateVars
  const templateVars = { 
    urls: urlsForUser(userID),
    user: users[userID]
  };

  response.render("urls_index", templateVars);
});



// order matters, needs to be defined BEFORE the next route.
// routes should be ordered from most specific to least specific.



app.get('/urls/new', (request, response) => {
  let userID = request.cookies['user_id']
  // console.log(userID)

  // if user is not logged in trying to access url page
  // redirect to login
  // we know they are logged in based on the cookies
  if (userID !== undefined) {
    const templateVars = { user: users[request.cookies['user_id']]};
    response.render('urls_new', templateVars);
  } else {
    response.redirect("/login")
  }

});

app.get("/urls/:shortURL", (request, response) => {

  let currentUserId = users[request.cookies['user_id']]
  console.log(currentUserId.id)


 
  const templateVars = { 
    user: users[request.cookies['user_id']], 
    shortURL: request.params.shortURL, 
    longURL: urlDatabase[request.params.shortURL].longURL 
  };

  console.log(templateVars)
  response.render("urls_show", templateVars);
  // console.log('request.params', request.params)
  // console.log('request.params.shortURL', request.params.shortURL)
  // console.log('urlDatabase[request.params.shortURL]', urlDatabase[request.params.shortURL])
  
  
});

app.get("/u/:shortURL", (request, response) => {
  // console.log('request.params.shortURL', request.params.shortURL);

  const longURL = urlDatabase[request.params.shortURL].longURL;

  response.redirect(longURL);
});




// receives a POST request to /urls it responds with a redirection to
// /urls/:shortURL, where shortURL is the random string we generated.
app.post("/urls", (request, response) => {
  let userID = request.cookies['user_id']

  // console.log(request.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();

  urlDatabase[shortURL] = {longURL: request.body.longURL, userID}
 

  console.log(urlDatabase);
  // console.log('request.body.longURL', request.body.longURL)

  // need to redirect
  response.redirect(`/urls/${shortURL}`);
});


// to delete
app.post("/urls/:shortURL/delete", (request, response) => {
  let userID = request.cookies['user_id']
  const urlToDelete = request.params.shortURL;

  if (urlDatabase[urlToDelete].userID === userID) {
  delete urlDatabase[urlToDelete];
  }

  response.redirect('/urls/');
});


// update edit
app.post("/urls/:shortURL/", (request, response) => {
  let userID = request.cookies['user_id']


  const shortURL = request.params.shortURL;

  // urlDatabase[shortURL] = request.body.longURL;
  urlDatabase[shortURL] = {longURL: request.body.longURL, userID}

  response.redirect('/urls');
});





// login updated
app.post("/login", (request, response) => {
  
  let email = request.body.email
  let password = request.body.password

  if (!emailExists(email)) {
    response.status(403).send("Input Error")
    return
  } 

    for (let user in users) {
      if (users[user].email === email && users[user].password === password) {
        response.cookie("user_id", users[user].id);
        response.redirect('/urls');
        return
      } 
    }
    response.status(403).send("Input Error")
    return
});

// login page
app.get('/login', (request, response) => {


const templateVars = { user: users[request.cookies['user_id']]};
response.render('login_form', templateVars)
});

// logout & cookies
app.post("/logout", (request, response) => {

  response.clearCookie("user_id");
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


  if (isFeildBlank(incomingEmail, incomingPassword)) {
    response.status(400).send("Invaild Entry")
  }
  else if (emailExists(incomingEmail)) {
    response.status(400).send("Email already exists")

  } else {

  //add the user to the user object. 
  // create new object to add
  const newUser = {
    id: incomingID,
    email: incomingEmail,
    password: incomingPassword
  };

  users[incomingID] = newUser;

  // console.log(users);

  response.cookie("user_id", incomingID);

  // Redirect the user to the /urls page.
  response.redirect('/urls');

  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

