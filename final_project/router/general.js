const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();




public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
 
   
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
 
   
    const userExists = users.some(user => user.username === username);
 
    if (userExists) {
      return res.status(409).json({ message: "Username already exists." });
    }
 


    users.push({ username, password });
 
    return res.status(201).json({ message: "User registered successfully." });
  });


  public_users.get('/promise-books', (req, res) => {
    axios.get('http://localhost:5000/')
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});

  
 
// Get the book list available in the shop
public_users.get('/', function(req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
  });
 


  public_users.get('/axios/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject('Book not found');
      }
    })
    .then(bookDetails => {
      res.status(200).json(bookDetails);
    })
    .catch(error => {
      res.status(404).json({ message: error });
    });
  });


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function(req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
 
    if (book) {
      return res.status(200).send(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });


  public_users.get('/axios/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const matchingBooks = await new Promise((resolve, reject) => {
            const results = [];

            for (let key in books) {
                if (books[key].author.toLowerCase() === author.toLowerCase()) {
                    results.push({ isbn: key, ...books[key] });
                }
            }

            if (results.length > 0) {
                resolve(results);
            } else {
                reject("No books found by that author.");
            }
        });

        return res.status(200).json(matchingBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


 
// Get book details based on author
public_users.get('/author/:author', function(req, res) {
    const author = req.params.author.toLowerCase();
    const matchingBooks = [];
 
   
    for (let key in books) {
      if (books[key].author.toLowerCase() === author) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
 
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  });
 


// Route to get book details by title using Axios + async/await
public_users.get('/axios/title/:title', async (req, res) => {
    try {
      const titleParam = req.params.title.toLowerCase();
      
      // Use Axios to fetch the full book list
      const response = await axios.get('http://localhost:5000/');
      const booksData = response.data;
  
      // Search for books with matching title
      const matchingBooks = Object.values(booksData).filter(book =>
        book.title.toLowerCase() === titleParam
      );
  
      if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
      } else {
        res.status(404).json({ message: "No books found with that title." });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', function(req, res) {
    const title = req.params.title.toLowerCase();
    const matchingBooks = [];
 
   
    for (let key in books) {
      if (books[key].title.toLowerCase() === title) {
        matchingBooks.push({ isbn: key, ...books[key] });
      }
    }
 
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  });
 


//  Get book review
public_users.get('/review/:isbn', function(req, res) {
    const isbn = req.params.isbn;
   
    const book = books[isbn];
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
 


module.exports.general = public_users;


