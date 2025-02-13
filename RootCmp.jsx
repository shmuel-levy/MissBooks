import { AppHeader } from "./cmps/AppHeader.jsx"
import { Home } from "./pages/Home.jsx"
import { About } from "./pages/AboutUs.jsx"
import { BookIndex } from "./pages/BookIndex.jsx"

const { useState } = React
const Router = ReactRouterDOM.HashRouter
const { Routes, Route } = ReactRouterDOM
export function App() {
    const [page, setPage] = useState('home')

    function onSetPage(newPage) {
        setPage(newPage)
    }

    return (
        <Router>
        <section className="app">
            <AppHeader onSetPage={onSetPage} />
            <main className="main-layout">
                <Routes>

                {page === 'home' && <Home />}
                {page === 'about' && <About />}
                {page === 'book' && <BookIndex />}
                </Routes>
            </main>
        </section>

        </Router>
    )
}