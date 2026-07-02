import React from "react";
import RouterCustom from "./router.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { BranchProvider } from "./context/BranchContext.jsx";

function App() {
  return (
    <CartProvider>
      <BranchProvider>
        <RouterCustom />
      </BranchProvider>
    </CartProvider>
  );
}

export default App;
