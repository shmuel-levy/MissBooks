const { Link, NavLink } = ReactRouterDOM

export function AppHeader() {
    return (
        <header className="app-header">
            <h1>Miss Books</h1>
            <nav className="main-nav">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/book">Books</NavLink>
                <NavLink to="/book/add">Add Book</NavLink>
                <NavLink to="/about">About</NavLink>
            </nav>
        </header>
    )
}