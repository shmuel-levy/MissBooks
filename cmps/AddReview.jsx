const { useState } = React

export function AddReview({ onAddReview }) {
    const [reviewToEdit, setReviewToEdit] = useState({
        fullname: '',
        rating: '5',
        readAt: new Date().toISOString().slice(0, 10),
        text : ''
    })

    function handleChange({ target }) {
        const field = target.name
        const value = target.value
        setReviewToEdit(prevReview => ({ ...prevReview, [field]: value }))
    }

    function onSubmitReview(ev) {
        ev.preventDefault()
        onAddReview(reviewToEdit)
        setReviewToEdit({
            fullname: '',
            rating: '5',
            readAt: new Date().toISOString().slice(0, 10)
        })
    }

    return (
        <section className="add-review">
            <h2>Add Review</h2>
            <form onSubmit={onSubmitReview} className="review-form">
                <div className="form-row">
                    <label>
                        Full Name:
                        <input 
                            type="text"
                            name="fullname"
                            value={reviewToEdit.fullname}
                            onChange={handleChange}
                            placeholder="Enter your name"
                        />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Rating:
                        <select 
                            name="rating"
                            value={reviewToEdit.rating}
                            onChange={handleChange}
                        >
                            {[1,2,3,4,5].map(num => (
                                <option key={num} value={num}>{'⭐'.repeat(num)}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Read At:
                        <input 
                            type="date"
                            name="readAt"
                            value={reviewToEdit.readAt}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="form-row">
                    <label>
                        Your Review:
                        <textarea
                            name="text"
                            value={reviewToEdit.text}
                            onChange={handleChange}
                            placeholder="Share your thoughts about this book..."
                            rows="4"
                        ></textarea>
                    </label>
                </div>

                <button className="add-review-btn">Submit Review</button>
            </form>
        </section>
    )
}