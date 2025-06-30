
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ECommerceApp from './ECommerceApp';
import ProductDetailPage from './components/ProductDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ECommerceApp />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
