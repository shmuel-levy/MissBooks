import { BookPreview } from "./BookPreview.jsx";

export function BookList({ books, onSelectBook, onRemoveBook }) {
    return (
        <ul className="book-list clean-list">
            {books.map((book, idx) => (
                <li key={book.id}>
                    <BookPreview 
                        book={book}
                        idx={idx + 1}
                        onSelectBook={() => onSelectBook(book.id)}
                    />
                    <button onClick={() => onSelectBook(book.id)}>Select</button>
                    <button onClick={() => onRemoveBook(book.id)}>Delete</button>
                </li>
            ))}
        </ul>
    )
}
