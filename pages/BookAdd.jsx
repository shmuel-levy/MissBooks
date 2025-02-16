const { useState, useEffect } = React
const { useNavigate } = ReactRouterDOM

import { bookService } from '../services/book.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function BookAdd() {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([])
            return
        }

        const timeout = setTimeout(() => {
            searchBooks(searchTerm)
        }, 500)

        return () => clearTimeout(timeout)
    }, [searchTerm])

    async function searchBooks(term) {
        setIsLoading(true)
        try {
            const books = await bookService.getGoogleBooks(term)
            setSearchResults(books || [])
        } catch (err) {
            console.error('Error searching books:', err)
            showErrorMsg('Failed to search books')
        } finally {
            setIsLoading(false)
        }
    }

    async function onAddBook(book) {
        try {
            await bookService.addGoogleBook(book)
            showSuccessMsg(`Book "${book.title}" added successfully`)
            navigate('/book')
        } catch (err) {
            if (err.message === 'Book already exists in collection') {
                showErrorMsg('This book is already in your collection')
            } else {
                showErrorMsg('Failed to add book')
                console.error('Error adding book:', err)
            }
        }
    }

    return (
        <section className="book-add">
            <h2>Add New Book</h2>
            
            <div className="search-container">
                <input 
                    type="text"
                    placeholder="Search Google Books..."
                    value={searchTerm}
                    onChange={(ev) => setSearchTerm(ev.target.value)}
                    className="search-input"
                />
            </div>

            {isLoading && <div className="loading">Searching...</div>}

            <ul className="book-search-results clean-list">
                {searchResults.map(book => (
                    <li key={book.id} className="book-search-item">
                        <div className="book-preview">
                            {book.thumbnail && (
                                <img src={book.thumbnail} alt={book.title} />
                            )}
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p className="authors">
                                    By: {book.authors ? book.authors.join(', ') : 'Unknown Author'}
                                </p>
                                {book.pageCount && (
                                    <p className="pages">{book.pageCount} pages</p>
                                )}
                            </div>
                        </div>
                        <button 
                            className="add-btn"
                            onClick={() => onAddBook(book)}
                            title="Add to collection"
                        >
                            +
                        </button>
                    </li>
                ))}
            </ul>

            {searchResults.length === 0 && searchTerm && !isLoading && (
                <div className="no-results">No books found</div>
            )}
        </section>
    )
}