const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM

import { bookService } from '../services/book.service.js'
import { LongTxt } from "../cmps/LongTxt.jsx"
import { AddReview } from "../cmps/AddReview.jsx"
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function BookDetails() {
    const [book, setBook] = useState(null)
    const [nextBookId, setNextBookId] = useState(null)
    const [prevBookId, setPrevBookId] = useState(null)

    const params = useParams()
    const navigate = useNavigate()
    const bookId = params.bookId

    useEffect(() => {
        if (!bookId) return
        loadBook()
    }, [bookId])

    function loadBook() {
        bookService.get(bookId)  
            .then(book => {
                setBook(book)
                setNextBookId(book.nextBookId)
                setPrevBookId(book.prevBookId)
            })
            .catch(err => {
                console.error('Failed to load book:', err)
                showErrorMsg('Failed to load book')
                navigate('/book')
            })
    }

    function onNavigate(newBookId) {
        navigate(`/book/${newBookId}`)
    }

    function onBack() {
        navigate('/book')
    }
    function getReadingDifficulty(pageCount) {
        if (pageCount > 500) return "Epic Journey"
        if (pageCount > 200) return "Weekend Read"
        if (pageCount < 100) return "Quick Read"
        return "Standard Read"
    }

    function getBookAge() {
        const currYear = new Date().getFullYear()
        const age = currYear - book.publishedDate
        if (age > 10) return "📚 Classic Edition"
        if (age < 1) return "✨ Fresh Off the Press"
        return `📖 Published ${age} years ago`
    }

    function getPriceStyle() {
        const { amount } = book.listPrice
        if (amount > 150) return "premium-price"
        if (amount < 20) return "bargain-price"
        return "regular-price"
    }

    function onAddReview(review) {
        bookService.addReview(bookId, review)
            .then(updatedBook => {
                setBook(updatedBook)
                showSuccessMsg("Review added successfully!")
            })
            .catch(() => showErrorMsg("Failed to add review"))
    }

    function onRemoveReview(reviewId) {
        bookService.removeReview(bookId, reviewId)
            .then(updatedBook => {
                setBook(updatedBook)
                showSuccessMsg("Review removed successfully!")
            })
            .catch(() => showErrorMsg("Failed to remove review"))
    }

    if (!book) return <div>Loading...</div>

    return (
        <div className="book-view">
            <header className="book-header">
                <h1>{book.title}</h1>
                {book.subtitle && <h2>{book.subtitle}</h2>}
            </header>

            <div className="book-content">
                <div className="book-image-container">
                    <img src={book.thumbnail} alt={book.title} />
                    {book.listPrice.isOnSale && (
                        <div className="sale-banner">On Sale!</div>
                    )}
                </div>

                <div className="book-info">
                    <div className="info-section">
                        <label>Written by</label>
                        <span>{book.authors.join(" & ")}</span>
                    </div>

                    <div className="info-section">
                        <label>Publication</label>
                        <span>{getBookAge()}</span>
                    </div>

                    <div className="info-section">
                        <label>Reading Time</label>
                        <span>{getReadingDifficulty(book.pageCount)} ({book.pageCount} pages)</span>
                    </div>

                    <div className="info-section">
                        <label>Language</label>
                        <span>{book.language.toUpperCase()}</span>
                    </div>

                    <div className="info-section">
                        <label>Genre</label>
                        <span>{book.categories.join(" | ")}</span>
                    </div>

                    <div className={`info-section price ${getPriceStyle()}`}>
                        <label>Price</label>
                        <span>{book.listPrice.amount} {book.listPrice.currencyCode}</span>
                    </div>

                    <div className="book-description info-section">
                        <label>About this Book</label>
                        <LongTxt txt={book.description} length={150} />
                    </div>
                </div>
            </div>

            <div className="book-navigation">
                <button 
                    onClick={() => onNavigate(prevBookId)} 
                    className="nav-btn prev"
                    disabled={!prevBookId}
                >
                    ← Previous Book
                </button>
                <button onClick={onBack} className="nav-btn back">
                    Back to List
                </button>
                <button 
                    onClick={() => onNavigate(nextBookId)} 
                    className="nav-btn next"
                    disabled={!nextBookId}
                >
                    Next Book →
                </button>
            </div>

            <div className="reviews-list">
                <h3>Reviews</h3>
                <AddReview onAddReview={onAddReview} />
                
                {book.reviews && book.reviews.length > 0 ? (
                    <ul>
                        {book.reviews.map((review, idx) => (
                            <li key={review.id || idx} className="review-item">
                                <div className="reviewer-name">By: {review.fullname}</div>
                                <div className="review-meta">
                                    <span>{'⭐'.repeat(review.rating)}</span>
                                    <span> • </span>
                                    <span>{new Date(review.readAt).toLocaleDateString()}</span>
                                </div>
                                {review.text && <p className="review-text">{review.text}</p>}
                                <button 
                                    className="delete-review-btn"
                                    onClick={() => onRemoveReview(review.id)}
                                >
                                    Delete Review
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No reviews yet - Be the first to review!</p>
                )}
            </div>
        </div>
    )
}