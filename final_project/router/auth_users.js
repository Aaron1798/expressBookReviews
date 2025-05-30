const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];


const isValid = (username) => {
  return users.some(user => user.username === username);
};


const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};




regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;


  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }


  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username },
      "access",
      { expiresIn: '1h' }
    );


    req.session.authorization = {
      accessToken,
      username
    };


    return res.status(200).json({ message: "User successfully logged in!" });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username or password." });
  }
});




// Add a book review
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not logged in." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review for ISBN ${isbn} has been added/updated by ${username}.`,
        reviews: books[isbn].reviews
    });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not logged in." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user on the specified book." });
    }

    // ✅ Delete user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: `Review by ${username} for ISBN ${isbn} has been deleted.` });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;