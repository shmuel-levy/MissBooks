import { BookList } from '../cmps/BookList.jsx'
import { BookFilter } from '../cmps/BookFilter.jsx'
import { bookService } from '../services/book.service.js'
import { BookDetails } from './BookDetails.jsx'

const { useState, useEffect } = React

export function BookIndex() {
    const [books, setBooks] = useState(null)
    const [selectedBookId, setSelectedBookId] = useState(null)
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

    function onSelectBook(bookId) {
        setSelectedBookId(bookId)
    }

    function onRemoveBook(bookId) {
        bookService.remove(bookId)
            .then(() => {
                const updatedBooks = books.filter(book => book.id !== bookId)
                setBooks(updatedBooks)
            })
    }

    function onSetFilterBy(filterByFromFilter) {
        setFilterBy(filterByFromFilter)
    }

    if (!books) return <div>Loading...</div>

    return (
        <section className="book-index">
            <h2>Book Shop</h2>
            {!selectedBookId && 
                <div>
                    <BookFilter 
                        filterBy={filterBy}
                        onSetFilterBy={onSetFilterBy}
                    />
                    <BookList 
                        books={books}
                        onSelectBook={onSelectBook}
                        onRemoveBook={onRemoveBook}
                    />
                </div>
            }
           {selectedBookId && 
    <BookDetails 
        bookId={selectedBookId}
        onBack={() => setSelectedBookId(null)}
    />
            }
        </section>
    )
}