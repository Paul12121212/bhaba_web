// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;



import React, { useState, useEffect } from 'react';  // Add useState and useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { fetchAllProducts } from './api';  // Import the API function
import ECommerceApp from './ECommerceApp';
import ProductDetailPage from './components/ProductDetailPage';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchAllProducts().then(setProducts);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ECommerceApp products={products} />} />
        <Route 
          path="/products/:productId" 
          element={<ProductDetailPage products={products} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;