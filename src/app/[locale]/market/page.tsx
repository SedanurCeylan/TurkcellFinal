'use client'
import MarketBanner from '../../../components/molecules/MarketBanner'

import MarketProduct from '../../../components/molecules/MarketProduct'
import PageContainer from '../../../components/PageContainer'
import React from 'react'
import HomeMarketCard from '../../../components/molecules/HomeMarketCard'

const Market = () => {
  return (
    <div>
      <PageContainer bgColor="bg-primary bg-opacity-10">
        <MarketBanner />
      </PageContainer>
      <PageContainer bgColor="bg-white">
        <HomeMarketCard />
      </PageContainer>
      <PageContainer bgColor="bg-light">
        <MarketProduct />
      </PageContainer>

    </div>
  )
}

export default Market;