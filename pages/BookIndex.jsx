const { useState, useEffect } = React
const { useSearchParams } = ReactRouterDOM

import { bookService } from '../services/book.service.js'
import { BookList } from '../cmps/BookList.jsx'
import { BookFilter } from '../cmps/BookFilter.jsx'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function BookIndex() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [books, setBooks] = useState(null)
    const [filterBy, setFilterBy] = useState(bookService.getFilterFromSearchParams(searchParams))

    useEffect(() => {
        loadBooks()
    }, [filterBy])

    function loadBooks() {
        bookService.query(filterBy)
            .then(booksToUpdate => {
                setBooks(booksToUpdate)
            })
            .catch(err => {
                console.error('Error:', err)
                showErrorMsg('Cannot load books')
            })
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
        setSearchParams(filterBy)
    }

    function onRemoveBook(bookId) {
        bookService.remove(bookId)
            .then(() => {
                setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId))
                showSuccessMsg('Book removed successfully!')
            })
            .catch(err => {
                console.error('Error:', err)
                showErrorMsg('Cannot remove book')
            })
    }

    if (!books) return <div>Loading...</div>

    return (
        <section className="book-index">
            <BookFilter 
                filterBy={filterBy} 
                onSetFilterBy={onSetFilterBy}
            />
            
            <BookList 
                books={books} 
                onRemoveBook={onRemoveBook}
            />
        </section>
    )
}