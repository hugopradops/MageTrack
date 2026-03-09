import ParticleCanvas from './components/ParticleCanvas';
import TopBar from './components/TopBar';
import SaleCard from './components/SaleCard';
import ReleasesCard from './components/ReleasesCard';
import CriticScoresCard from './components/CriticScoresCard';
import NewsCard from './components/NewsCard';

export default function Home() {
  return (
    <>
      <ParticleCanvas />

      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <TopBar />

      <main className="dashboard">
        <SaleCard />
        <ReleasesCard />
        <CriticScoresCard />
        <NewsCard />
      </main>
    </>
  );
}
