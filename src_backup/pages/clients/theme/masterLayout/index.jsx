import React from "react";
import Header from "../header";
import Footer from "../footer";

const MasterLayout = ({ children, title = "ToiYeuPC – Cửa Hàng Máy Tính" }) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="master-layout">
      <Header />
      <main className="master-layout__content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MasterLayout;
