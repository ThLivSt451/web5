import React, { useState, useEffect } from 'react';
import ProductCard from '../common/ProductCard';
import '../../styles/home.css';
import { ProductsService } from '../../firestore-service';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [sortBy, setSortBy] = useState('default');

    // Завантаження продуктів з Firestore
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const productsData = await ProductsService.getAllProducts();
                setProducts(productsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    // Filter products by availability
    let filteredProducts = showAvailableOnly
        ? products.filter(product => product.available)
        : products;

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
        return <div className="loading">Loading products...</div>;
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
                    <label htmlFor="show-available-only">Show Available Products Only</label>
                </div>

                <div className="sort-container">
                    <label htmlFor="sort-select">Sort by: </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={handleSortChange}
                    >
                        <option value="default">Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-asc">Rating: Low to High</option>
                        <option value="rating-desc">Rating: High to Low</option>
                    </select>
                </div>
            </div>

            <section id="products" className="products">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p>No products found</p>
                )}
            </section>
        </div>
    );
}

export default HomePage;