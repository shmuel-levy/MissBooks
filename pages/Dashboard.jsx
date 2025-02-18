import { bookService } from '../services/book.service.js'
import { BookChart } from '../cmps/BookChart.jsx'
const { useState, useEffect } = React

export function Dashboard() {
    const [books, setBooks] = useState([])
    const [categoryStats, setCategoryStats] = useState([])
    const [additionalStats, setAdditionalStats] = useState(null)

    useEffect(() => {
        loadBooks()
        loadStats()
    }, [])

    function loadBooks() {
        bookService.query()
            .then(books => {
                setBooks(books)
                calculateAdditionalStats(books)
            })
    }

    function loadStats() {
        bookService.getCategoryStats()
            .then(setCategoryStats)
    }

    function calculateAdditionalStats(books) {
        if (!books.length) return

        const stats = {
            totalBooks: books.length,
            avgPrice: Math.round(books.reduce((acc, book) => acc + book.listPrice.amount, 0) / books.length),
            onSaleCount: books.filter(book => book.listPrice.isOnSale).length,
            avgPages: Math.round(books.reduce((acc, book) => acc + book.pageCount, 0) / books.length),
            languages: [...new Set(books.map(book => book.language))].length
        }
        setAdditionalStats(stats)
    }

    if (!books.length) return <div>Loading...</div>

    return (
        <section className="dashboard">
            <h1>Dashboard</h1>
            <h2>Statistics for {books.length} Books</h2>
            
            {additionalStats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Average Price</h3>
                        <p>{additionalStats.avgPrice} EUR</p>
                    </div>
                    <div className="stat-card">
                        <h3>Books on Sale</h3>
                        <p>{additionalStats.onSaleCount} Books</p>
                    </div>
                    <div className="stat-card">
                        <h3>Average Length</h3>
                        <p>{additionalStats.avgPages} Pages</p>
                    </div>
                    <div className="stat-card">
                        <h3>Languages</h3>
                        <p>{additionalStats.languages} Different</p>
                    </div>
                </div>
            )}

            <div className="category-section">
                <h3>By Category</h3>
                <div className="chart-wrapper">
                    <BookChart data={categoryStats} />
                </div>
            </div>
        </section>
    )
}