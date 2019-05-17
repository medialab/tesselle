import { resizeImage, calculateAspectRatioFit } from 'utils/imageManipulation';
import { last } from 'ramda';

export const generateInfo = (img, scaleFactors, id) => {
  return {
    '@context': 'http://library.stanford.edu/iiif/image-api/1.1/context.json',
    '@id': id,
    'formats': ['jpg'],
    'height': img.height,
    'profile': 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0',
    'qualities': ['default'],
    'scale_factors': scaleFactors,
    'tile_height': 512,
    'tile_width': 512,
    'width': img.width,
  };
};

function* staticPartialTileSizes(width: number, height: number, tilesize: number, scaleFactors: number[]) {
  for (const sf of scaleFactors) {
    if (sf * tilesize > width && sf * tilesize >= height) {
      continue;
    }
    const rts = tilesize * sf;
    const xt = Math.floor((width - 1) / rts) + 1;
    const yt = Math.floor((height - 1) / rts) + 1;
    for (let nx = 0; nx <= xt; nx++) {
      const rx = nx * rts;
      let rxe = rx + rts;
      if (rxe > width) {
        rxe = width;
      }
      const rw = rxe - rx;
      const sw = Math.floor (((rw + sf) - 1) / sf);
      for (let ny = 0; ny < yt; ny++) {
        const ry = ny * rts;
        let rye = ry + rts;
        if (rye > height) {
          rye = height;
        }
        const rh = rye - ry;
        const sh = Math.floor(((rh + sf) - 1) / sf);
        // debugger
        yield [[rx, ry, rw, rh], [sw, sh], sf] as [[number, number, number, number], [number, number], number];
      }
    }
  }
}

function path(region, size): string {
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

export type FuturImageParsing = () => Promise<File>;
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
      () => resizeImage(img, region, size),
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
    () => resizeImage(
      img,
      lastRegion,
      lastSize,
    ),
    last(scaleFactors) * 2,
  ];
}
