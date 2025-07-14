const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Get username and password from request body
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username) {
    return res.status(400).json({message: "Username is required"});
  }
  
  if (!password) {
    return res.status(400).json({message: "Password is required"});
  }
  
  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({message: "Username already exists"});
  }
  
  // Add new user to users array
  users.push({
    username: username,
    password: password
  });
  
  // Return success message
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Send the books list as a neatly formatted JSON response
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;
  
  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Return the book details
    res.send(JSON.stringify(books[isbn], null, 4));
  } else {
    // Return error message if book not found
    return res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Obtain the author from request parameters
  const author = req.params.author;
  
  // Get all the keys for the 'books' object
  const bookKeys = Object.keys(books);
  
  // Array to store matching books
  let matchingBooks = [];
  
  // Iterate through the 'books' array & check if author matches
  bookKeys.forEach(key => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      // Add the book with its key to the result
      matchingBooks.push({
        isbn: key,
        ...books[key]
      });
    }
  });
  
  // Check if any books were found
  if (matchingBooks.length > 0) {
    // Return the matching books
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    // Return error message if no books found for this author
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Obtain the title from request parameters
  const title = req.params.title;
  
  // Get all the keys for the 'books' object
  const bookKeys = Object.keys(books);
  
  // Array to store matching books
  let matchingBooks = [];
  
  // Iterate through the 'books' array & check if title matches
  bookKeys.forEach(key => {
    if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
      // Add the book with its key to the result
      matchingBooks.push({
        isbn: key,
        ...books[key]
      });
    }
  });
  
  // Check if any books were found
  if (matchingBooks.length > 0) {
    // Return the matching books
    res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
    // Return error message if no books found with this title
    return res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Get the book reviews based on ISBN provided in the request parameters
  const isbn = req.params.isbn;
  
  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Return the reviews for the book
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    // Return error message if book not found
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;

// Task 10: Get the list of books available in the shop using async-await
public_users.get('/async', async function (req, res) {
  try {
    // Using Promise to simulate async operation
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(books);
        }, 100); // Simulate async delay
      });
    };
    
    const allBooks = await getBooks();
    res.send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    res.status(500).json({message: "Error retrieving books", error: error.message});
  }
});

// Task 11: Get book details based on ISBN using async-await
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    
    // Using Promise to simulate async operation
    const getBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (books[isbn]) {
            resolve(books[isbn]);
          } else {
            reject(new Error("Book not found"));
          }
        }, 100); // Simulate async delay
      });
    };
    
    const book = await getBookByISBN(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

// Task 12: Get book details based on Author using async-await
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    
    // Using Promise to simulate async operation
    const getBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const bookKeys = Object.keys(books);
          let matchingBooks = [];
          
          bookKeys.forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
              matchingBooks.push({
                isbn: key,
                ...books[key]
              });
            }
          });
          
          if (matchingBooks.length > 0) {
            resolve(matchingBooks);
          } else {
            reject(new Error("No books found by this author"));
          }
        }, 100); // Simulate async delay
      });
    };
    
    const matchingBooks = await getBooksByAuthor(author);
    res.send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

// Task 13: Get book details based on Title using async-await
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    
    // Using Promise to simulate async operation
    const getBooksByTitle = (title) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const bookKeys = Object.keys(books);
          let matchingBooks = [];
          
          bookKeys.forEach(key => {
            if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
              matchingBooks.push({
                isbn: key,
                ...books[key]
              });
            }
          });
          
          if (matchingBooks.length > 0) {
            resolve(matchingBooks);
          } else {
            reject(new Error("No books found with this title"));
          }
        }, 100); // Simulate async delay
      });
    };
    
    const matchingBooks = await getBooksByTitle(title);
    res.send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});
