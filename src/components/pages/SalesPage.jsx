import React, { useState, useEffect } from 'react';
import ProductCard from '../common/ProductCard';
import '../../styles/sales.css';
import { ProductsService } from '../../firestore-service';

function SalesPage() {
    const [discountedProducts, setDiscountedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [sortBy, setSortBy] = useState('default');

    // Завантаження продуктів зі знижкою з Firestore
    useEffect(() => {
        const fetchDiscountedProducts = async () => {
            try {
                setLoading(true);
                const productsData = await ProductsService.getDiscountedProducts();
                setDiscountedProducts(productsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching discounted products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDiscountedProducts();
    }, []);

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    // Filter products by availability
    let filteredProducts = showAvailableOnly
        ? discountedProducts.filter(product => product.available)
        : discountedProducts;

    // Sort products based on selection
    switch (sortBy) {
        case 'price-asc':
            filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
            break;
        case 'rating-asc':
            filteredProducts = [...filteredProducts].sort((a, b) => {
                // Convert rating stars to numeric values for sorting
                const ratingA = a.rating.split('').filter(char => char === '★').length;
                const ratingB = b.rating.split('').filter(char => char === '★').length;
                return ratingA - ratingB;
            });
            break;
        case 'rating-desc':
            filteredProducts = [...filteredProducts].sort((a, b) => {
                // Convert rating stars to numeric values for sorting
                const ratingA = a.rating.split('').filter(char => char === '★').length;
                const ratingB = b.rating.split('').filter(char => char === '★').length;
                return ratingB - ratingA;
            });
            break;
        default:
            // Keep default order
            break;
    }

    if (loading) {
        return <div className="loading">Loading discounted products...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div>
            <div className="filter-controls">
                <div className="filter-container">
                    <input
                        type="checkbox"
                        id="show-available-only"
                        checked={showAvailableOnly}
                        onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    />
                    <label htmlFor="show-available-only">Показувати тільки доступні товари</label>
                </div>

                <div className="sort-container">
                    <label htmlFor="sort-select">Сортувати за: </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={handleSortChange}
                    >
                        <option value="default">Без сортування</option>
                        <option value="price-asc">Ціна: Менше-Більше</option>
                        <option value="price-desc">Ціна: Більше-Менше</option>
                        <option value="rating-asc">Рейтинг: Менше-Більше</option>
                        <option value="rating-desc">Рейтинг: Більше-Менше</option>
                    </select>
                </div>
            </div>

            <section id="products" className="products">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p>No discounted products found</p>
                )}
            </section>
        </div>
    );
}

export default SalesPage;