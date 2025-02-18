export function AboutGoal() {
    return (
        <div className="about-goal animate__animated animate__fadeInRight">
            <h2><i className="fa-solid fa-bullseye"></i> Our Goal</h2>
            <p>Our mission is to make quality literature accessible to everyone.</p>
            
            <div className="goals-list">
                <div className="goal-item">
                    <i className="fa-solid fa-book-open"></i>
                    <h3>Promote Reading</h3>
                    <p>Making books accessible to all</p>
                </div>
                <div className="goal-item">
                    <i className="fa-solid fa-handshake"></i>
                    <h3>Support Authors</h3>
                    <p>Helping writers reach their audience</p>
                </div>
            </div>
        </div>
    )
}