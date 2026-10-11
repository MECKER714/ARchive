import { assetUrl } from '@/data/paths';
let load: Promise<void> | undefined;
export function loadViewer() {
  return load ??= import('@google/model-viewer').then(({ ModelViewerElement }) => {
    // Configure before mounting any model-viewer, including uploaded previews.
    ModelViewerElement.dracoDecoderLocation = assetUrl('vendor/draco/');
    ModelViewerElement.ktx2TranscoderLocation = assetUrl('vendor/basis/');
    ModelViewerElement.meshoptDecoderLocation = assetUrl('vendor/meshopt_decoder.js');
    ModelViewerElement.lottieLoaderLocation = assetUrl('vendor/lottie-disabled.js');
  }).catch(error => { load = undefined; throw error; });
}
