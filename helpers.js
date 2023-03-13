
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return null;
};

module.exports = {
  getUserByEmail
};