import { Link } from 'react-router-dom'
import './ProductCard.css'

const StarIcon = ({ filled, half }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#FFC633' : half ? 'url(#half)' : 'none'} stroke="#FFC633" strokeWidth="1.5">
        {half && (
            <defs>
                <linearGradient id="half">
                    <stop offset="50%" stopColor="#FFC633" />
                    <stop offset="50%" stopColor="transparent" />
                </linearGradient>
            </defs>
        )}
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

function StarRating({ rating }) {
    return (
        <div className="star-rating">
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={rating >= star} half={rating >= star - 0.5 && rating < star} />
                ))}
            </div>
            <span className="rating-count">{rating.toFixed(1)}/5</span>
        </div>
    )
}

export default function ProductCard({ id = 1, image, name, rating, price, originalPrice, discount, badge }) {
    return (
        <Link to={`/product/${id}`} className="product-card">
            <div className="product-card-img-wrap">
                {badge && <span className="product-badge">{badge}</span>}
                <img src={image} alt={name} className="product-card-img" loading="lazy" />
            </div>
            <div className="product-card-info">
                <h3 className="product-card-name">{name}</h3>
                <StarRating rating={rating} />
                <div className="product-card-price">
                    <span className="price-current">৳{price}</span>
                    {originalPrice && (
                        <>
                            <span className="price-original">৳{originalPrice}</span>
                            <span className="price-discount">-{discount}%</span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    )
}
