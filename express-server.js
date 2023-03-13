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
      return users[user];
    }
  }
  return null;
};

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userId: null
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userId: null
  }
};

// user database
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
  const urls = urlDatabase;
  const longURL = urls.longURL;
  const templateVars = {
    longURL,
    urls,
    user
  };
  res.render('urls_index', templateVars);
});

// update database and redirect to the id's own page
app.post('/urls', (req, res) => {
  const newId = generateRandomString();
  if (!req.cookies.user_id) {
    res.send("Must login first.");
    return;
  }
  const userId = req.cookies.user_id;
  const { longURL } = req.body;
  urlDatabase[newId] = {
    userId,
    longURL
  };
  res.redirect(`urls/${newId}`);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {user};
  if (!user) {
    res.redirect('/login');
  } else res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const { id } = req.params;
  const urls = urlDatabase;
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
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {user};
  if (user) {
    res.redirect('/urls');
  } else res.render('urls_register', templateVars);
});

// generate unique id, create new user, add new user to users, save cookies
app.post('/urls/register', (req, res) => {
  const {email, password} = req.body;
  if (email === "" || password === "") {
    return res.status(400).send('Please fill in all fields');
  } else if (userLookup(email)) {
    return res.status(400).redirect('/login');
  } else;
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

// render the login page
app.get('/login', (req, res) => {
  const user = users[req.cookies['user_id']] || null;
  const templateVars = {user};
  if (user) {
    res.redirect('/urls');
  } else res.render('urls_login', templateVars);
});

// route for login redirect to index
app.post('/urls/login', (req, res) => {
  const {email, password} = req.body;
  if (userLookup(email) === null) {
    return res.status(403).redirect('/register');
  }
  const user = userLookup(email);
  if (userLookup(email)) {
    if (password !== user.password) {
      return res.status(403).send("Wrong password!");
    } else {
      return res.cookie('user_id', user.id).redirect('/urls');
    }
  }
});

// redirect to actual site of long URL
app.get('/u/:id', (req, res) => {
  const { id } = req.params;
  if (!urlDatabase[id]) {
    return res.send("We don't have that one yet.");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// route for delete button and removal from database
app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');
});

// route to update longURL from form input and redirect to index
app.post('/urls/:id/update', (req, res) => {
  const { id } = req.params;
  const { longURL } = req.body;
  urlDatabase[id] = {
    longURL,
  };
  res.redirect('/urls');
});


// route for logout redierct to index
app.post('/urls/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/login');
});