import type { Artwork } from '@/domain/artwork';
import { ModelViewer } from '@/features/viewer/ModelViewer';
export function ArtworkCard({ artwork, index }: { artwork: Artwork; index: number }) {
  return <a className="artwork-card" href={`#/artworks/${artwork.id}`}>
    <div className="card-stage" style={{ background: artwork.color || '#e7e8e1' }}>
      <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
      <ModelViewer src={artwork.modelUrl} title={artwork.title} compact />
      <span className="card-view">3D로 감상하기</span>
    </div>
    <div className="card-meta"><div><h3>{artwork.title}</h3><p>{artwork.artist}</p></div><span className="category">{artwork.category}</span></div>
  </a>;
}
