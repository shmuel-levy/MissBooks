import { AppHeader } from "./cmps/AppHeader.jsx"
import { Home } from "./pages/Home.jsx"
import { About } from "./pages/AboutUs.jsx"
import { BookIndex } from "./pages/BookIndex.jsx"

const { useState } = React

export function App() {
    const [page, setPage] = useState('home')

    function onSetPage(newPage) {
        setPage(newPage)
    }

    return (
        <section className="app">
            <AppHeader onSetPage={onSetPage} />
            <main className="main-layout">
                {page === 'home' && <Home />}
                {page === 'about' && <About />}
                {page === 'book' && <BookIndex />}
            </main>
        </section>
    )
}