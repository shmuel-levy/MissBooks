export function BookChart({ data }) {
    const maxValue = Math.max(...data.map(item => item.value))
    
    return (
        <div className="chart-container">
            <div className="chart-bars">
                {data.map((item, idx) => (
                    <div key={idx} className="chart-item">
                        <div className="bar-wrapper">
                            <div 
                                className="bar"
                                style={{ height: `${item.value}%` }}
                            >
                                <span className="bar-value">{item.value}%</span>
                            </div>
                        </div>
                        <div className="bar-label">{item.name}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

