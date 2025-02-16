const { useState } = React
const Router = ReactRouterDOM.HashRouter
const { Routes, Route } = ReactRouterDOM

import { AppHeader } from './cmps/AppHeader.jsx'
import { About } from './pages/AboutUs.jsx'
import { Home } from './pages/Home.jsx'
import { BookIndex } from './pages/BookIndex.jsx'
import { BookDetails } from './pages/BookDetails.jsx'
import { UserMsg } from './cmps/UserMsg.jsx'
import { BookEdit } from "./pages/BookEdit.jsx"
import { BookAdd } from './pages/BookAdd.jsx'


export function App() {
    return (
        <Router>
            <section className="app">
                <AppHeader />
                <main className="main-layout">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/book/edit/:bookId" element={<BookEdit />} />
                        <Route path="/book/edit" element={<BookEdit />} />
                        <Route path="/book/add" element={<BookAdd />} />
                        <Route path="/book/:bookId" element={<BookDetails />} />
                        <Route path="/book" element={<BookIndex />} />
                    </Routes>
                </main>
                <UserMsg />
            </section>
        </Router>
    )
}