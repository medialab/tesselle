import { resizeImage, calculateAspectRatioFit } from 'utils/imageManipulation';
import { last } from 'ramda';
import Slideshow from './Slideshow';
import { typesToExtensions } from 'utils/';

export const generateInfo = (slideshow: Slideshow, scaleFactors) => {

  return {
    '@context': 'http://library.stanford.edu/iiif/image-api/1.1/context.json',
    '@id': slideshow.image.id,
    'formats': [typesToExtensions(slideshow.image.file.type)],
    'height': slideshow.image.height,
    'profile': 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0',
    'qualities': ['default'],
    'scale_factors': scaleFactors,
    'tile_height': 512,
    'tile_width': 512,
    'width': slideshow.image.width,
  };
};

export function* staticPartialTileSizes(width: number, height: number, tilesize: number, scaleFactors: number[]) {
  for (const sf of scaleFactors) {
    // Size of the image raster.
    const rts = tilesize * sf;
    // If a scale factor returns is to high, skip it.
    if (rts > width && rts >= height) {
      continue;
    }
    // Number of tiles on X (cols)
    const xt = Math.floor((width - 1) / rts) + 1;
    // Number of tiles on Y (rows)
    const yt = Math.floor((height - 1) / rts) + 1;
    // Start matrice with cols.
    for (let nx = 0; nx <= xt; nx++) {
      // X Start point.
      const rx = nx * rts;
      // X End point.
      let rxe = rx + rts;
      // Image is not a sf multiple, we need to check for the end of the image.
      if (rxe > width) {
        rxe = width;
      }
      // Raster final width.
      const rw = rxe - rx;
      // End file width.
      const sw = Math.floor(((rw + sf) - 1) / sf);
      // Matrice rows.
      for (let ny = 0; ny < yt; ny++) {
        // Y Start point.
        const ry = ny * rts;
        // End point.
        let rye = ry + rts;
        // Check image's height
        if (rye > height) {
          rye = height;
        }
        // Raster height.
        const rh = rye - ry;
        // End file height.
        const sh = Math.floor(((rh + sf) - 1) / sf);
        yield [[rx, ry, rw, rh], [sw, sh], sf] as [[number, number, number, number], [number, number], number];
      }
    }
  }
}

export function path(region, size): string {
  return `/${region.join(',')}/${size[0]},/0/native.jpg`;
}

export function scaleFactorsCreator(tileWidth, width, tileHeight, height) {
  let sf = 1;
  const scaleFactors: number[] = [sf];
  for (let j = 0; j < 30; j++) {
    sf = 2 * sf;
    if (tileWidth * sf > width && tileHeight * sf > height) {
      break;
    }
    scaleFactors.push(sf);
  }
  return scaleFactors;
}

interface GenerateImageOptions {
  tileSize: number;
  scaleFactors?: number[];
}

export type FuturImageParsing = Promise<File>;
type ScaleFactor = number;

export function* generate(
  img,
  options: GenerateImageOptions,
): IterableIterator<[string, FuturImageParsing, ScaleFactor]> {
  const { width, height } = img;
  const { tileSize } = options;
  const scaleFactors: number[] = options.scaleFactors ? options.scaleFactors : scaleFactorsCreator(
    tileSize,
    width,
    tileSize,
    height,
  );
  for (const [region, size, sf] of staticPartialTileSizes(width, height, tileSize, scaleFactors)) {
    yield [
      path(region, size),
      resizeImage(img, region, size),
      sf,
    ];
  }
  const ratio = calculateAspectRatioFit(
    width, height, 480, 512,
  );
  const lastRegion = [0, 0, width, height];
  const lastSize: [number, number] = [ratio.width, ratio.height];
  yield [
    path(lastRegion, lastSize),
    resizeImage(
      img,
      lastRegion,
      lastSize,
    ),
    last(scaleFactors),
  ];
}
