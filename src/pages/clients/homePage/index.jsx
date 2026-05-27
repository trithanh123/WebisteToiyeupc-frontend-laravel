import React from "react";
import MasterLayout from "../theme/masterLayout";
import HeroBanner from "./HeroBanner";
import CategoryCards from "./sections/CategoryCards";
import ProductGrid from "./ProductGrid";
import ServiceStrip from "./sections/ServiceStrip";
import PromoBanner from "./sections/PromoBanner";
import CategoryIcons from "./sections/CategoryIcons";
import TechNews from "./sections/TechNews";
import BrandLogos from "./sections/BrandLogos";

const HomePage = () => {
  return (
    <MasterLayout title="ToiYeuPC - Trang Chủ">
      <HeroBanner />
      <CategoryCards />
      <ServiceStrip />
      <PromoBanner />
      <ProductGrid />
      <CategoryIcons />
      <TechNews />
      <BrandLogos />
    </MasterLayout>
  );
};

export default HomePage;
