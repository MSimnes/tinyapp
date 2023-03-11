const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

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
      return user;
    }
  }
  return null;
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {

};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// display list of shortened urls
app.get('/urls', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render('urls_index', templateVars);
});

// update database and redirect to the id's own page
app.post('/urls', (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`urls/${newId}`);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {user};
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render('urls_show', templateVars);
});

// render register page
app.get('/register', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {user};
  res.render('urls_register', templateVars);
});

// generate unique id, create new user, add new user to users, save cookies
app.post('/urls/register', (req, res) => {
  const {email, password} = req.body;
  // console.log("email ", email);
  if (email === "" || password === "") {
    res.status(400).send('Please fill in all fields');
    return;
  } else if (userLookup(email)) {
    res.status(400).send("Email already exists");
    return;
  } else;
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie('user_id', id);
  // console.log("id", id,);
  // console.log("users[id] ", users[id]);
  // console.log("Current users object", users);
  res.redirect('/urls');
});

// redirect to actual site of long URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// route for delete button and removal from database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// route to update longURL from form input and redirect to index
app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
});

// route for login redirect to index
app.post('/urls/login', (req, res) => {
  const username = req.body.id;
  res.cookie('username', username).redirect('/urls');
});

// route for logout redierct to index
app.post('/urls/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/urls');
});