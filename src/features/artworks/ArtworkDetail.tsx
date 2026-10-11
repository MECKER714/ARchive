import { useEffect, useState } from 'react';
import { ChevronLeft, Download } from 'lucide-react';
import { ModelViewer } from '@/features/viewer/ModelViewer';
import { ArtworkCard } from '@/components/ArtworkCard';
import { samples } from '@/data/samples';
import { formatBytes, type Artwork } from '@/domain/artwork';
import { getArtwork } from '@/storage/artwork-store';

export function ArtworkDetail({ id, created }: { id: string; created: boolean }) {
  const [artwork, setArtwork] = useState<Artwork | null>(samples.find(a => a.id === id) || null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let release = () => {};
    getArtwork(id).then(result => {
      if (!active) { result.release(); return; }
      release = result.release; setArtwork(result.artwork);
    }).catch(error => { if (active) setError(error.message); });
    return () => { active = false; release(); };
  }, [id]);
  return <main className="content-page" id="main">
    <a href="#/" className="back-link"><ChevronLeft size={16} /> 열린 전시로</a>
    {error ? <div className="no-artwork" role="alert"><h1>작품을 열 수 없어요.</h1><p>{error}</p><a className="button dark" href="#/">열린 전시로</a></div> : !artwork ?
      <p className="notice" role="status">작품을 불러오는 중입니다.</p> : <>
        {created && <p className="notice" role="status">이 브라우저에 작품을 저장했어요. 이제 손끝으로 감상해 보세요.</p>}
        <div className="detail-grid">
          <div className="detail-stage" style={{ background: artwork.color || '#e9ebdf' }}><ModelViewer src={artwork.modelUrl} title={artwork.title} iosSrc={artwork.usdzUrl} /></div>
          <article className="detail-info"><p className="eyebrow">{artwork.sample ? 'ARCHITECTURE / COLLECTION' : 'SAVED IN THIS BROWSER'}</p><h1>{artwork.title}</h1><p className="artist">{artwork.artist}</p><p className="description">{artwork.description}</p>
            <dl className="detail-specs"><div><dt>분류</dt><dd>{artwork.category}</dd></div><div><dt>파일 형식</dt><dd>{artwork.format.toUpperCase()} · {formatBytes(artwork.size)}</dd></div><div><dt>등록일</dt><dd>{new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul' }).format(new Date(artwork.createdAt))}</dd></div><div><dt>감상 방식</dt><dd>인터랙티브 3D</dd></div></dl>
            {artwork.usdzUrl && <a href={artwork.usdzUrl} className="button" download={`${artwork.id}.usdz`}><Download size={16} /> USDZ 다운로드</a>}
            {!artwork.sample && <p className="upload-help">이 작품은 현재 브라우저에만 저장되어 있어요. 다른 기기에는 자동으로 공유되지 않습니다.</p>}
          </article>
        </div>
        <h2 className="related-heading">다른 시선으로, 다른 작품</h2><div className="artwork-grid">{samples.filter(a => a.id !== id).map((a, index) => <ArtworkCard key={a.id} artwork={a} index={index} />)}</div>
      </>}
  </main>;
}

