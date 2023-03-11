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
      console.log("USER obj from userLookup", users[user]);
      return users[user];
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
    //current compass directions say to send 400 and message,
    //instead i redirected to login
    res.status(400).redirect('/login');
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

// render the login page
app.get('/login', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {user};
  res.render('urls_login', templateVars);
});

// route for login redirect to index
app.post('/urls/login', (req, res) => {
  const {email, password} = req.body;
  if (userLookup(email) === null) {
    /// current compass directions say to issue 403 with a response
    /// instead I redirected to /register
    res.status(403).redirect('/register');
    return;
  }
  const user = userLookup(email);
  // console.log("user obj---", user);
  if (userLookup(email)) {
    if (password !== user.password) {
      res.status(403).send("Wrong password!");
      return;
    } else {
      res.cookie('user_id', user.id).redirect('/urls');
    }
  }
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


// route for logout redierct to index
app.post('/urls/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/login');
});