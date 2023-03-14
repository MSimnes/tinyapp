const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUserId } = require('../helpers.js');


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLDatabase = {
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userId: 'id2'
  },
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userId: 'id1'
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return null with an invalid email', function() {
    const user = getUserByEmail("user@notHere.com", testUsers);
    assert.equal(user, null);
  });
  it('should return null with no email provided', function() {
    const user = getUserByEmail(testUsers);
    assert.equal(user, null);
  });
  it('should return null with no database provided', function() {
    const user = getUserByEmail("user@example.com");
    assert.equal(user, null);
  });
});

describe('generateRandomString', function() {
  it('should return a random string', function() {
    const randomString1 = generateRandomString();
    const randomString2 = generateRandomString();
    assert.notEqual(randomString1, randomString2);
  });
});

describe('urlsForUserId', function() {
  it('should return object containing urls for specific user id', function() {
    const user = urlsForUserId("id2", testURLDatabase);
    const expectedObject = {
      '9sm5xK': 'http://www.google.com',
      '9sm5xL': 'http://www.bing.com',
      '9sm5xM': 'http://www.yahoo.com'
    };
    assert.deepEqual(user, expectedObject);
  });
  it('should return null when passed an ID not in the database', function() {
    const user = urlsForUserId("IdNotPresent", testURLDatabase);
    assert.equal(user, null);
  });
  it('should return null with no ID provided', function() {
    const user = urlsForUserId(testURLDatabase);
    assert.equal(user, null);
  });
  it('should return null with no database provided', function() {
    const user = urlsForUserId('id2');
    assert.equal(user, null);
  });
});