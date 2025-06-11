'use client';

import HomeHero from './_components/home-hero';
import HomeNewProduct from './_components/home-new-product/home-new-product';
import HomeClub from './_components/home-club/home-club';
import HomeCard from './_components/home-card/home-card';

export default function AppPage() {
  return (
    <>
      <HomeHero />
      <HomeNewProduct />
      <HomeClub />
      <HomeCard />
    </>
  );
}
