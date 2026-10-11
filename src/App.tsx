import { useEffect, useState } from 'react';
import { Plus, ChevronLeft } from 'lucide-react';
import { Gallery } from './components/Gallery';
import { ArtworkDetail } from './features/artworks/ArtworkDetail';
import { UploadForm } from './features/upload/UploadForm';

function currentRoute() { return location.hash.slice(1) || '/'; }

export function App() {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const navigate = () => { setRoute(currentRoute()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  const path = route.split('?')[0];
  const detail = /^\/artworks\/([a-zA-Z0-9-]+)$/.exec(path);
  return <>
    <header className="site-header">
      <a className="wordmark" href="#/" aria-label="ARchive 홈">ARchive<span>®</span></a>
      <nav aria-label="메인 메뉴">
        <a href="#/" aria-current={path === '/' ? 'page' : undefined}>전시 보기</a>
        <a className="button dark header-upload" href="#/upload" aria-current={path === '/upload' ? 'page' : undefined}><Plus size={17} /> 작품 추가</a>
      </nav><span className="beta">PAGES BETA</span>
    </header>
    {path === '/' ? <Gallery /> : path === '/upload' ?
      <main className="content-page" id="main">
        <a className="back-link" href="#/"><ChevronLeft size={16} /> 열린 전시로</a>
        <p className="eyebrow">ADD TO YOUR BROWSER</p>
        <h1 className="page-title">당신의 작품을, 더 가까이.</h1>
        <p className="page-lead">3D 파일과 작품의 이야기를 이 브라우저에 보관하세요.</p>
        <p className="notice storage-notice">파일은 서버로 전송되지 않습니다. 추가한 작품은 이 기기의 이 브라우저에서만 보이며, 브라우저 데이터를 지우면 삭제됩니다. 원본 파일은 따로 보관하세요.</p>
        <UploadForm />
      </main> : detail ? <ArtworkDetail key={detail[1]} id={detail[1]} created={route.endsWith('?created=1')} /> :
        <main className="content-page no-artwork" id="main"><h1>페이지를 찾을 수 없어요.</h1><a className="button dark" href="#/">열린 전시로</a></main>}
    <footer className="site-footer"><a className="wordmark" href="#/">ARchive<span>®</span></a><p>전시는 끝나도, 작품은 계속된다.</p><span className="eyebrow">YOUR BROWSER. YOUR COLLECTION.</span></footer>
  </>;
}
