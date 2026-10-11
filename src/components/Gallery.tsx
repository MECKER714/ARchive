import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Artwork } from '@/domain/artwork';
import { samples } from '@/data/samples';
import { listArtworks } from '@/storage/artwork-store';
import { ArtworkCard } from './ArtworkCard';

export function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>(samples);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let release = () => {};
    listArtworks().then(result => {
      if (!active) { result.release(); return; }
      release = result.release; setArtworks(result.artworks);
    }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; release(); };
  }, []);
  return <main id="main" className="gallery-page">
    <section className="gallery-intro">
      <div><p className="eyebrow">AN OPEN SPACE FOR EVERY CREATION</p><h1>작품과 만나는<br /><span>새로운 거리.</span><i className="accent-dot" /></h1></div>
      <div className="intro-aside"><span className="edition">ONLINE EXHIBITION<br />VOL. 001 — 2026</span><p>당신이 있는 곳이 전시가 됩니다.<br />작품을 돌려 보고, 가까이 들여다보세요.</p><a href="#/upload" className="text-link"><Plus size={18} /> 나의 작품 추가하기</a></div>
    </section>
    <section className="collection" aria-labelledby="collection-title">
      <div className="collection-heading"><div><span className="section-index">01 / COLLECTION</span><h2 id="collection-title">열린 전시 <span>{String(artworks.length).padStart(2, '0')}</span></h2></div><p>손끝으로 만나는 입체적인 이야기</p></div>
      {error && <p className="notice" role="alert">{error} 기본 작품은 아래에서 감상할 수 있어요.</p>}
      <div className="artwork-grid">{artworks.map((artwork, index) => <ArtworkCard key={artwork.id} artwork={artwork} index={index} />)}</div>
      <div className="collection-note"><span>3D VIEWING · NO APP NEEDED</span></div>
    </section>
    <section className="upload-invitation"><span className="section-index">YOUR WORK, YOUR SPACE</span><h2>다음 작품의 자리는<br />당신을 위해 비워두었습니다.</h2><a className="button dark" href="#/upload"><Plus size={18} /> 작품 추가하기</a></section>
  </main>;
}

