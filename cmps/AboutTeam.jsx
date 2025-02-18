export function AboutTeam() {
    return (
        <div className="about-team animate__animated animate__fadeInRight">
            <h2><i className="fa-solid fa-users"></i> Our Team</h2>
            <p>We are passionate book lovers dedicated to bringing you the best reading experience.</p>
            
            <div className="team-members">
                <div className="team-member">
                    <i className="fa-solid fa-user-tie"></i>
                    <h3>Matan Yakir</h3>
                    <p>Founder & CEO</p>
                </div>
                <div className="team-member">
                    <i className="fa-solid fa-user-pen"></i>
                    <h3>Eliav Boaron</h3>
                    <p>Chief Editor</p>
                </div>
            </div>
        </div>
    )
}