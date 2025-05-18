import { db } from './firebase.js';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

// Імпортуємo вихідні дані продуктів
const productsData = [
    { id: 1, name: "'Kinin' Backpack", price: 1279.00, image: "/images/good1.jpg", available: true, rating: "★★★★☆", description: "Durable and spacious backpack for daily use." },
    { id: 2, name: "'Abibas' Sneakers", price: 2199.00, oldPrice: 2799.00, image: "/images/good2.jpg", available: false, rating: "★★★★★", description: "Comfortable sneakers for sports and casual wear." },
    { id: 3, name: "'Mechanix' Gloves(Black)", price: 1219.00, image: "/images/good3.jpg", available: true, rating: "★★★★☆", description: "High-quality gloves for extreme conditions." },
    { id: 4, name: "'Kinin' Thermal Underwear", price: 1659.00, image: "/images/good4.jpg", available: true, rating: "★★★☆☆", description: "Warm thermal underwear for cold weather activities." },
    { id: 5, name: "OSPORT Fitness Carpet (Purple)", price: 1199.00, oldPrice: 1659.00, image: "/images/good5.jpg", available: false, rating: "★★★★☆", description: "Comfortable fitness carpet for yoga and exercises." },
    { id: 6, name: "OSPORT Jump Ropes", price: 679.00, image: "/images/good6.jpg", available: true, rating: "★★★★☆", description: "Professional jump ropes for cardio training." },
    { id: 7, name: "Berserk Sport Backpack", price: 1799.00, image: "/images/good7.jpg", available: true, rating: "★★★★☆", description: "Spacious sport backpack for your gear." },
    { id: 8, name: "Scitec Basic Gloves", price: 459.00, image: "/images/good8.jpg", available: true, rating: "★★★★★", description: "Comfortable gloves for weight training." },
    { id: 9, name: "Funky Grey Diawin Sneakers", price: 2799.00, image: "/images/good9.jpg", available: false, rating: "★★★★☆", description: "Stylish sneakers for everyday wear." },
    { id: 10, name: "Neo-Sport Dumbbells (2 x 1kg)", price: 256.00, oldPrice: 459.00, image: "/images/good11.jpg", available: true, rating: "★★★★☆", description: "Light dumbbells for fitness and rehabilitation." },
    { id: 11, name: "Viverra Soft ZIP Black Underwear", price: 1659.00, image: "/images/good10.jpg", available: true, rating: "★★★★☆", description: "Comfortable underwear for sports activities." },
    { id: 12, name: "Sp-Sport Jump Ropes (Green)", price: 239.00, oldPrice: 338.00, image: "/images/good12.jpg", available: false, rating: "★★☆☆☆", description: "Budget jump ropes for beginners." }
];

// Функція для заповнення колекції продуктів
export const seedProducts = async () => {
    try {
        // Використовуємо batched writes для кращої продуктивності та атомарності
        const batch = writeBatch(db);
        const productsCollection = collection(db, 'products');

        productsData.forEach((product) => {
            // Створюємо новий документ без ID, Firestore згенерує автоматично
            const productRef = doc(productsCollection);

            // В Firebase зберігаємо ID як string, а не number
            const { id, ...productWithoutId } = product;

            // Додаємо документ до batch
            batch.set(productRef, {
                ...productWithoutId,
                firestoreId: id.toString() // Додаємо оригінальний ID як поле firestoreId
            });
        });

        // Виконуємо всі операції разом
        await batch.commit();
        console.log('Database successfully seeded with products!');
        return true;
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
};

// Функція для запуску з командного рядка або з інтерфейсу
// Можна використати цю функцію в адміністративній панелі або один раз під час розробки
export const runSeeder = async () => {
    try {
        await seedProducts();
        console.log('All seeders completed successfully.');
    } catch (error) {
        console.error('Error running seeders:', error);
    }
};

// Експортуємо саму функцію для використання в інших файлах
export default runSeeder;