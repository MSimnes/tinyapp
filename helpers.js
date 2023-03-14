/**
 * Returns a random string of 6 characters consisting of letters and numbers.
 * @returns {string} A randomly generated string.
 */
const generateRandomString = function() {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV123456789';
  const charLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

/**
 * Returns the user object with the given email address, or null if not found.
 * @param {string} email - The email address to search for.
 * @param {Object} database - The database object to search in.
 * @returns {Object|null} The user object if found, or null if not found.
 */

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return null;
};

/**
 * Returns an object containing short URL keys and corresponding long URL values
 * for a given user ID.
 * @param {string} userId - The user ID to match against the 'userId' property in the 'database' object.
 * @param {Object} database - The database object to search in.
 * @returns {Object|null} An object containing short URL keys and corresponding long URL values for the given user ID,
 * or null if no matching URLs are found.
 */

const urlsForUserId = function(userId, database) {
  const matchingURLsObj = {};
  for (let key in database) {
    if (database[key]['userId'] === userId) {
      matchingURLsObj[key] = database[key]['longURL'];
    }
  }
  return Object.keys(matchingURLsObj).length > 0 ? matchingURLsObj : null;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUserId
};