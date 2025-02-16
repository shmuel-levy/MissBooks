const { useState, useEffect } = React;
const { useNavigate } = ReactRouterDOM;

import { bookService } from "../services/book.service.js";
import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service.js";

export function BookAdd() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    authors: "",
    description: "",
    pageCount: "",
    price: "",
    isOnSale: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchBooks(searchTerm);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  function searchBooks(term) {
    setIsLoading(true);
    bookService
      .getGoogleBooks(term)
      .then((books) => {
        setSearchResults(books || []);
      })
      .catch((err) => {
        console.error("Error searching books:", err);
        showErrorMsg("Failed to search books");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onAddBook(book) {
    bookService
      .addGoogleBook(book)
      .then(() => {
        showSuccessMsg(`Book "${book.title}" added successfully`);
        navigate("/book");
      })
      .catch((err) => {
        if (err.message === "Book already exists in collection") {
          showErrorMsg("This book is already in your collection");
        } else {
          showErrorMsg("Failed to add book");
          console.error("Error adding book:", err);
        }
      });
  }

  function handleChange({ target }) {
    const field = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;

    setNewBook((prevBook) => ({
      ...prevBook,
      [field]: value,
    }));
  }

  function onSubmitForm(ev) {
    ev.preventDefault()
    
    const bookToAdd = {
        title: newBook.title,
        subtitle: '',  
        authors: newBook.authors ? newBook.authors.split(',').map(author => author.trim()) : ['Unknown Author'],
        publishedDate: new Date().getFullYear(),
        description: newBook.description || 'No description available',
        pageCount: +newBook.pageCount || 100,
        categories: ['General'],
        thumbnail: '/assets/booksImages/15.jpg',
        language: newBook.language || 'en',
        listPrice: {
            amount: +newBook.price || 0,
            currencyCode: "EUR",
            isOnSale: newBook.isOnSale
        },
        reviews: []
    }
    
    bookService.save(bookToAdd)
        .then(() => {
            showSuccessMsg('Book added successfully!')
            navigate('/book')
        })
        .catch(err => {
            showErrorMsg('Failed to add book')
            console.error('Error:', err)
        })
}

  function onGoogleSearch(ev) {
    ev.preventDefault();
    setIsLoading(true);

    bookService
      .getGoogleBooks(searchTerm)
      .then((books) => {
        setSearchResults(books || []);
      })
      .catch((err) => {
        console.error("Error searching books:", err);
        showErrorMsg("Failed to search books");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <section className="book-add">
      <h2>Add Book</h2>

      <div className="add-book-container">
        <div className="google-search-section">
          <form onSubmit={onGoogleSearch}>
            <label htmlFor="google-search" className="bold-txt">
              Google Search:
            </label>
            <div className="search-input-container">
              <input
                id="google-search"
                type="text"
                value={searchTerm}
                onChange={(ev) => setSearchTerm(ev.target.value)}
                placeholder="Insert book name"
              />
              <button>Search</button>
            </div>
          </form>

          {isLoading && <div className="loading">Searching...</div>}

          {searchResults.length > 0 && (
            <ul className="google-books-list">
              {searchResults.map((book) => (
                <li key={book.id} className="google-book-item">
                  <span>{book.title}</span>
                  <button onClick={() => onAddBook(book)}>+</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="manual-form-section">
          <form onSubmit={onSubmitForm} className="add-book-form">
            <div className="form-row">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newBook.title}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label htmlFor="language">Language:</label>
              <select
                id="language"
                name="language"
                value={newBook.language}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="he">Hebrew</option>
                <option value="sp">Spanish</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="authors">Authors:</label>
              <input
                type="text"
                id="authors"
                name="authors"
                value={newBook.authors}
                onChange={handleChange}
                placeholder="Comma separated authors"
              />
            </div>

            <div className="form-row">
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                id="description"
                name="description"
                value={newBook.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="pageCount">Number of pages:</label>
              <input
                type="number"
                id="pageCount"
                name="pageCount"
                value={newBook.pageCount}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="price">Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newBook.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-row checkbox-row">
              <label htmlFor="isOnSale">On Sale:</label>
              <input
                type="checkbox"
                id="isOnSale"
                name="isOnSale"
                checked={newBook.isOnSale}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
