import { LongTxt } from "../cmps/LongTxt.jsx"
import { bookService } from "../services/book.service.js"
import { AddReview } from '../cmps/AddReview.jsx'


const { useState, useEffect } = React

export function BookDetails({ bookId, onBack }) {
   const [book, setBook] = useState(null)

   useEffect(() => {
       loadBook()
   }, [])

   function loadBook() {
       bookService.getById(bookId)
           .then(book => setBook(book))
   }

   function getReadingDifficulty(pageCount) {
       if (pageCount > 500) return 'Epic Journey'
       if (pageCount > 200) return 'Weekend Read'
       if (pageCount < 100) return 'Quick Read'
       return 'Standard Read'
   }

   function getBookAge() {
       const currYear = new Date().getFullYear()
       const age = currYear - book.publishedDate
       if (age > 10) return '📚 Classic Edition'
       if (age < 1) return '✨ Fresh Off the Press'
       return `📖 Published ${age} years ago`
   }

   function getPriceStyle() {
       const { amount } = book.listPrice
       if (amount > 150) return 'premium-price'
       if (amount < 20) return 'bargain-price'
       return 'regular-price'
   }

   function onAddReview(review) {
    bookService.addReview(bookId, review)
        .then(updatedBook => {
            setBook(updatedBook)
            showSuccessMsg('Review added successfully!')
        })
        .catch(() => showErrorMsg('Failed to add review'))
}

function onRemoveReview(reviewId) {
    bookService.removeReview(bookId, reviewId)
        .then(updatedBook => {
            setBook(updatedBook)
            showSuccessMsg('Review removed successfully!')
        })
        .catch(() => showErrorMsg('Failed to remove review'))
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
                   {book.listPrice.isOnSale && 
                       <div className="sale-banner">
                           Special Offer!
                       </div>
                   }
               </div>

               <div className="book-info">
                   <div className="info-section">
                       <label>Written by</label>
                       <span>{book.authors.join(' & ')}</span>
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
                       <span>{book.categories.join(' | ')}</span>
                   </div>

                   <div className={`info-section price ${getPriceStyle()}`}>
                       <label>Price</label>
                       <span>{book.listPrice.amount} {book.listPrice.currencyCode}</span>
                   </div>

                   <div className="book-description">
                       <label>About this Book</label>
                       <LongTxt txt={book.description} length={150} />
                   </div>

                   <div className="book-actions">
                       {book.listPrice.isOnSale && 
                           <button className="purchase-btn">
                               Add to Cart
                           </button>
                       }
                       <div className="navigation-btns">
                           <button onClick={onBack} className="back-btn">
                               ← Return
                           </button>
                       </div>
                       <div className="book-reviews">
                <AddReview onAddReview={onAddReview} />
                
                <div className="reviews-list">
                    <h3>Reviews</h3>
                    {book.reviews && book.reviews.length > 0 ? (
                        <ul>
                            {book.reviews.map(review => (
                                <li key={review.id} className="review-item">
                                    <p>By: {review.fullname}</p>
                                    <p>Rating: {review.rating} stars</p>
                                    <p>Read at: {new Date(review.readAt).toLocaleDateString()}</p>
                                    <button onClick={() => onRemoveReview(review.id)}>
                                        Delete Review
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No reviews yet</p>
                    )}
                </div>
            </div>
                   </div>
               </div>
           </div>
       </div>
   )
}