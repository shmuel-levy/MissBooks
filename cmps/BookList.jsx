import { BookPreview } from "./BookPreview.jsx"
const { Link } = ReactRouterDOM

export function BookList({ books, onRemoveBook }) {
    return (
        <ul className="book-list clean-list">
            {books.map((book, idx) => (
                <li key={book.id} className="animate__animated animate__fadeIn">
                    <BookPreview 
                        book={book}
                        idx={idx + 1}
                    />
                    <div className="book-actions">
                        <Link to={`/book/${book.id}`}>
                            <button>Select</button>
                        </Link>
                        <button onClick={() => onRemoveBook(book.id)}>Delete</button>
                    </div>
                </li>
            ))}
        </ul>
    )
}