const { Outlet, NavLink } = ReactRouterDOM

export function About() {
    return (
        <section className="about">
            <h1 className="animate__animated animate__fadeIn">About Us</h1>
            
            <nav className="about-nav">
                <NavLink to="team">Our Team</NavLink>
                <NavLink to="goal">Our Goal</NavLink>
            </nav>

            <Outlet />
        </section>
    )
}