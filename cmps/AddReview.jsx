const { useState } = React

import { DynamicRating } from './RatingCmps.jsx'
import { showErrorMsg } from '../services/event-bus.service.js'

export function AddReview({ onAddReview }) {
    const [reviewData, setReviewData] = useState({
        fullname: '',
        rating: 5,
        readAt: new Date().toISOString().split('T')[0],
        text: ''
    })
    const [ratingType, setRatingType] = useState('stars')

    function handleChange({ target }) {
        const field = target.name
        const value = target.value
        setReviewData(prev => ({ ...prev, [field]: value }))
    }

    function handleSubmit(ev) {
        ev.preventDefault()
        if (!reviewData.fullname) {
            showErrorMsg('Please enter your name')
            return
        }
        onAddReview(reviewData)
        setReviewData({
            fullname: '',
            rating: 5,
            readAt: new Date().toISOString().split('T')[0],
            text: ''
        })
    }

    function handleRatingChange(val) {
        setReviewData(prev => ({ ...prev, rating: val }))
    }

    return (
        <div className="add-review">
            <h4>Add Review</h4>
            <form onSubmit={handleSubmit}>
                <div className="rating-type-selector">
                    <label>
                        <input 
                            type="radio" 
                            name="ratingType" 
                            value="select" 
                            checked={ratingType === 'select'}
                            onChange={(ev) => setRatingType(ev.target.value)}
                        />
                        Dropdown
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="ratingType" 
                            value="textbox" 
                            checked={ratingType === 'textbox'}
                            onChange={(ev) => setRatingType(ev.target.value)}
                        />
                        Number Input
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="ratingType" 
                            value="stars" 
                            checked={ratingType === 'stars'}
                            onChange={(ev) => setRatingType(ev.target.value)}
                        />
                        Stars
                    </label>
                </div>

                <div className="form-group">
                    <label>Full Name:</label>
                    <input 
                        type="text"
                        name="fullname"
                        value={reviewData.fullname}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Rating:</label>
                    <DynamicRating 
                        type={ratingType}
                        val={reviewData.rating}
                        onSelected={handleRatingChange}
                    />
                </div>

                <div className="form-group">
                    <label>Read At:</label>
                    <input 
                        type="date"
                        name="readAt"
                        value={reviewData.readAt}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Your Review:</label>
                    <textarea
                        name="text"
                        value={reviewData.text}
                        onChange={handleChange}
                        placeholder="Share your thoughts..."
                    ></textarea>
                </div>

                <button type="submit">Submit Review</button>
            </form>
        </div>
    )
}