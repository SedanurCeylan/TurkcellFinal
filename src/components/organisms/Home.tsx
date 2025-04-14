import React from 'react'
import HomeFirst from '../molecules/HomeFirst'
import HomeSecond from '../molecules/HomeSecond'
import HomeThird from '../molecules/HomeThird'
import PageContainer from '../PageContainer'
import HomeFourth from '../molecules/HomeFourth'
import HomeFifth from '../molecules/HomeFifth'
import HomeSixth from '../molecules/HomeSixth'
import HomeSeventh from '../molecules/HomeSeventh'
import HomeEighth from '../molecules/HomeEighth'

const Home = () => {
    return (
        <div>
            <PageContainer bgColor="bg-surface">
                <HomeFirst />
            </PageContainer>
            <PageContainer bgColor="bg-white">
                <HomeSecond />
            </PageContainer>
            <PageContainer bgColor="bg-light">
                <HomeThird />
            </PageContainer>
            <PageContainer bgColor="bg-surface">
                <HomeFourth />
            </PageContainer>
            <PageContainer bgColor="bg-light">
                <HomeFifth />
            </PageContainer>
            <PageContainer bgColor="bg-surface">
                <HomeSixth />
            </PageContainer>
            <PageContainer bgColor="bg-image">
                <HomeSeventh />
            </PageContainer>
            <PageContainer bgColor="bg-foto">
                <HomeEighth />
            </PageContainer>



        </div>
    )
}

export default Home