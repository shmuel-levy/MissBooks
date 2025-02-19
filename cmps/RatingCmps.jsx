const { useState } = React

export function RateBySelect({ val = 5, onSelected }) {
    return (
        <select 
            value={val} 
            onChange={(ev) => onSelected(+ev.target.value)}
            className="rate-select"
        >
            <option value="1">⭐</option>
            <option value="2">⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
        </select>
    )
}

export function RateByTextbox({ val = 5, onSelected }) {
    function handleChange(ev) {
        const value = Math.max(1, Math.min(5, +ev.target.value || 1))
        onSelected(value)
    }

    return (
        <input 
            type="number"
            min="1"
            max="5"
            value={val}
            onChange={handleChange}
            className="rate-textbox"
            placeholder="Rate 1-5"
        />
    )
}

export function RateByStars({ val = 5, onSelected }) {
    return (
        <div className="rate-stars">
            {[1, 2, 3, 4, 5].map((num) => (
                <button 
                    key={num}
                    onClick={() => onSelected(num)}
                    className={`star-btn ${num <= val ? 'selected' : ''}`}
                >
                    ⭐
                </button>
            ))}
        </div>
    )
}

export function DynamicRating({ type, val, onSelected }) {
    switch (type) {
        case 'select':
            return <RateBySelect val={val} onSelected={onSelected} />
        case 'textbox':
            return <RateByTextbox val={val} onSelected={onSelected} />
        case 'stars':
            return <RateByStars val={val} onSelected={onSelected} />
        default:
            return <RateByStars val={val} onSelected={onSelected} />
    }
}