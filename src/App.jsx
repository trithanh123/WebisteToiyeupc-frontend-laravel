import React from "react";
import RouterCustom from "./router.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { BranchProvider } from "./context/BranchContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BranchProvider>
          <RouterCustom />
        </BranchProvider>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;
