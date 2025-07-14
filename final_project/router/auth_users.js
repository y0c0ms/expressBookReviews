const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Check if the username is valid (not empty and exists in users array)
  return username && users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Check if username and password match the one we have in records
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Validate user credentials
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Get review from request query
  const username = req.session.authorization.username; // Get username from session
  
  // Check if review is provided
  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Add or modify the review
  // If the same user posts a different review on the same ISBN, it should modify the existing review
  // If another user logs in and posts a review on the same ISBN, it will get added as a different review under the same ISBN
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({message: "Review added/modified successfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Get username from session
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Check if user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found for this user"});
  }
  
  // Delete the review (filter & delete the reviews based on the session username)
  delete books[isbn].reviews[username];
  
  return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
