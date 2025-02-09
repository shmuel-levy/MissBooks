export function AppHeader({ onSetPage }) {
    return (
        <header className="app-header full main-layout">
            <nav>
                <button onClick={() => onSetPage('home')}>Home</button>
                <button onClick={() => onSetPage('about')}>About</button>
                <button onClick={() => onSetPage('book')}>Books</button>
            </nav>
        </header>
    )
}