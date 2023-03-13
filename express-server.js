const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function() {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV123456789';
  const charLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const userLookup = function(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

/**
 * Returns an object containing short URL keys and corresponding long URL values
 * for a given user ID.
 * @param {string} user_Id - User ID to match against the 'userId' property in the 'urlDatabase' object.
 * @returns {Object} An object containing short URL keys and corresponding long URL values for the given user ID.
 */
const urlsForUserId = function(userId) {
  const matchingURLsObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]['userId'] === userId) {
      matchingURLsObj[key] = urlDatabase[key]['longURL'];
    }
  }
  return matchingURLsObj;
};

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userId: 'id1'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userId: 'id2'
  },
  '9sm5xL': {
    longURL: 'http://www.bing.com',
    userId: 'id2'
  },
  '9sm5xM': {
    longURL: 'http://www.yahoo.com',
    userId: 'id2'
  }
};

// user database
const users = {

};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// display list of shortened urls
app.get('/urls', (req, res) => {
  const id = req.cookies['user_id'];
  const user = users[id];
  if (!user) {
    return res.redirect("/login");
  }
  const userSpecificUrls = urlsForUserId(id);
  const templateVars = {
    userSpecificUrls,
    user
  };
  res.render('urls_index', templateVars);
});

// update database and redirect to the id's own page
app.post('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    return res.send("Must login first.");
  }
  const newId = generateRandomString();
  const userId = req.cookies.user_id;
  const { longURL } = req.body;
  urlDatabase[newId] = {
    userId,
    longURL
  };
  res.redirect(`urls/${newId}`);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']];
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = {user};
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies['user_id']];
  const { id } = req.params;
  const urls = urlDatabase;
  // return message if id does not exist
  if (!urls[id]) {
    return res.status(404).send("URL does not exist");
  }
  // return message if not logged in
  if (!user) {
    return res.status(404).send("Please login to view URLs");
  }
  // return message if user does not own url
  if (urls[id].userId !== user.id) {
    return res.status(404).send("URL does not belong to user");
  }
  const templateVars = {
    urls,
    user,
    id,
    longURL: urlDatabase[id].longURL
  };
  res.render('urls_show', templateVars);
});

// render register page
app.get('/register', (req, res) => {
  const user = users[req.cookies['user_id']];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {user};
  return res.render('urls_register', templateVars);
});

// generate unique id, create new user, add new user to users, save cookies
app.post('/urls/register', (req, res) => {
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send('Please fill in all fields');
  }
  if (userLookup(email)) {
    return res.status(400).redirect('/login');
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    hashedPassword,
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

// render the login page
app.get('/login', (req, res) => {
  const user = users[req.cookies['user_id']];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {user};
  return res.render('urls_login', templateVars);
});

// route for login redirect to index
app.post('/urls/login', (req, res) => {
  const {email, password} = req.body;
  const user = userLookup(email);
  if (!user) {
    return res.status(403).redirect('/register');
  }
  const hashedPassword = user.hashedPassword;
  const loggedIn = bcrypt.compareSync(password, hashedPassword);
  if (!loggedIn) {
    return res.status(403).send("Wrong password!");
  } else {
    return res.cookie('user_id', user.id).redirect('/urls');
  }
});

// redirect to actual site of long URL
app.get('/u/:id', (req, res) => {
  const { id } = req.params;
  if (!urlDatabase[id]) {
    return res.send("We don't have that one yet.");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

// route for delete button and removal from database
app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.cookies['user_id']];
  const { id } = req.params;
  const urls = urlDatabase;
  // return message if id does not exist
  if (!urls[id]) {
    return res.status(404).send("URL does not exist");
  }
  // return message if not logged in
  if (!user) {
    return res.status(404).send("Please login to view URLs");
  }
  // return message if user does not own url
  if (urls[id].userId !== user.id) {
    return res.status(404).send("URL does not belong to user");
  }
  delete urlDatabase[id];
  return res.redirect('/urls');
});

// route to update longURL from form input and redirect to index
app.post('/urls/:id/update', (req, res) => {
  const user = users[req.cookies['user_id']];
  const { id } = req.params;
  const urls = urlDatabase;
  const userId = req.cookies['user_id'];
  // return message if id does not exist
  if (!urls[id]) {
    return res.status(404).send("URL does not exist");
  }
  // return message if not logged in
  if (!user) {
    return res.status(404).send("Please login to view URLs");
  }
  // return message if user does not own url
  if (urls[id].userId !== user.id) {
    return res.status(404).send("URL does not belong to user");
  }
  const { longURL } = req.body;
  urlDatabase[id] = {
    longURL,
    userId
  };
  return res.redirect('/urls');
});


// route for logout redirect to index
app.post('/urls/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/login');
});