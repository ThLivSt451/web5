import React from 'react';
import '../../styles/about.css';

function AboutPage() {
    return (
        <div className="container">
            <section className="advantages">
                <div className="advantage advantage--first">
                    <h3>Wide assortment</h3>
                    <p>We offer not only the best sports equipment, but also products that meet the latest trends in the world of sports.
                        <br />From innovative to classic, we have everything for your active lifestyle.
                        <br />Whether you're looking for professional equipment or just want to start training, you'll find what's right for you.</p>
                </div>

                <div className="advantage advantage--second">
                    <h3>Convenient delivery</h3>
                    <p>We value your time and strive to make the purchase process as comfortable as possible. Thanks to our well-established logistics, we quickly deliver orders throughout the country.<br />
                        You can choose the most convenient way to receive the goods - courier delivery, self-pickup or postal services.</p>
                </div>

                <div className="advantage advantage--third">
                    <h3>Quality guarantee</h3>
                    <p>All products in our store are carefully selected and meet the highest quality standards.<br />
                        We work only with official suppliers and proven brands (such as Nike, Adidas, Puma and others), <br />
                        so you can be sure of the originality and durability of the products.</p>
                </div>

                <div className="advantage advantage--fourth">
                    <h3>Support</h3>
                    <p>Not sure which product is right for you? Our consultants - people who are passionate about sports and know a lot about it. <br />
                        We will help you make the right choice according to your needs, level of training and budget.<br />
                        We strive not only to sell sports equipment, but to help you reach new heights in sports and an active life. <br />
                        Thank you for choosing MoveX!</p>
                </div>

                <div className="advantage advantage--fifth">
                    <h3>Contacts</h3>
                    <p><strong>Address:</strong> Energiyna St., 15, Kyiv, Ukraine</p>
                    <p><strong>Email:</strong> movex_support@gmail.com</p>
                    <p><strong>Phone:</strong> +38 (068) 654-32-10</p>
                    <p><strong>Working hours:</strong> Mon-Sat: 9:00 - 19:00, Sun: closed</p>
                </div>
            </section>
        </div>
    );
}

export default AboutPage;