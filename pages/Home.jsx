export function Home() {
    return (
        <section className="home">
            <div className="content-container animate__animated animate__fadeIn">
                <h1>Welcome to Miss Books</h1>
                <div className="subtitle">Your Literary Journey Begins Here</div>
                
                <div className="features-grid">
                    <div className="feature-card animate__animated animate__fadeInUp">
                        <i className="fa-solid fa-book-open"></i>
                        <h3>Explore Books</h3>
                        <p>Discover new worlds through our collection</p>
                    </div>
                    
                    <div className="feature-card animate__animated animate__fadeInUp" style={{animationDelay: '0.2s'}}>
                        <i className="fa-solid fa-star"></i>
                        <h3>Rate & Review</h3>
                        <p>Share your thoughts with the community</p>
                    </div>
                    
                    <div className="feature-card animate__animated animate__fadeInUp" style={{animationDelay: '0.4s'}}>
                        <i className="fa-solid fa-chart-line"></i>
                        <h3>Track Stats</h3>
                        <p>Visualize your reading journey</p>
                    </div>
                </div>

                <div className="creator-section animate__animated animate__fadeInUp" style={{animationDelay: '0.6s'}}>
                    <div className="creator-card">
                        <div className="creator-content">
                            <i className="fa-solid fa-code"></i>
                            <h3>Created with ❤️ by Shmuel</h3>
                            <p>Turning book management into an art</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}