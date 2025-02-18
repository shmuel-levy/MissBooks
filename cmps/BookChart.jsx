export function BookChart({ data }) {
    const maxValue = Math.max(...data.map(item => item.value))
    
    return (
        <div className="chart animate__animated animate__fadeIn">
            {data.map((item, idx) => (
                <div key={idx} className="chart-bar">
                    <div className="bar-label">{item.name}</div>
                    <div className="bar-container">
                        <div 
                            className="bar-fill"
                            style={{ 
                                width: `${item.value}%`,
                                backgroundColor: getBarColor(idx)
                            }}
                        >
                            {item.value}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function getBarColor(idx) {
    const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0']
    return colors[idx % colors.length]
}