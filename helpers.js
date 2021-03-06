// TODO file for helper functions and export
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};


const emailExists = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      return true;
    }
  }
};


const isFieldBlank = (email, password) => {
  if (email === '' || password === '') {
    return true;
  }
};

// Create a function named urlsForUser(id) which returns
// the URLs where the userID is equal to the id of the currently logged-in user.

const urlsForUser = (id, database) => {
  //pass in the id of the current user
  // create a new object
  const userUrlDatabase = {};

  for (let url in database) {
    // loop through the urlDatabase object for all the urls
    if (database[url].userID === id) {
      // if the key[value].userID matches the curerent user id
      // return all of the matching values (only matching), put the urlDatabase into the new userUrlDatabse
      userUrlDatabase[url] = database[url];
    }
  }
  return userUrlDatabase;
};

const currentUserId = (request) => {
  let userID = request.session['user_id'];

  return userID;
};


const getUserByEmail = function(email, database) {
  // we know that the email is a key value pair inside the object;
  // the user is the key to the object with the email
  // loop thorough the object? and match the email?
  let user;
  for (let key in database) {
    if(database[key].email === email) {
      user = database[key];
      return user.id; 
    } else{
      return undefined
    }
  }
};





module.exports = { generateRandomString, emailExists, isFieldBlank, urlsForUser, currentUserId, getUserByEmail }