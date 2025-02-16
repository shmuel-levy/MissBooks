import { BookList } from '../cmps/BookList.jsx'
import { BookFilter } from '../cmps/BookFilter.jsx'
import { bookService } from '../services/book.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

const { useState, useEffect } = React

export function BookIndex() {
    const [books, setBooks] = useState(null)
    const [filterBy, setFilterBy] = useState(bookService.getDefaultFilter())

    useEffect(() => {
        loadBooks()
    }, [filterBy])

    function loadBooks() {
        bookService.query(filterBy)
            .then(booksToUpdate => {
                setBooks(booksToUpdate)
            })
    }

    function onRemoveBook(bookId) {
        bookService.remove(bookId)
            .then(() => {
                showSuccessMsg('Book removed successfully!')
                setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId))
            })
            .catch(err => {
                showErrorMsg('Failed to remove book')
                console.error('Error:', err)
            })
    }

    function onSetFilterBy(filterByFromFilter) {
        setFilterBy(filterByFromFilter)
    }

    if (!books) return <div>Loading...</div>

    return (
        <section className="book-index">
            <h2>Book Shop</h2>
            <div>
                <BookFilter 
                    filterBy={filterBy}
                    onSetFilterBy={onSetFilterBy}
                />
                <BookList 
                    books={books}
                    onRemoveBook={onRemoveBook}
                />
            </div>
        </section>
    )
}