import { resizeImage, calculateAspectRatioFit } from 'utils/imageManipulation';

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
        yield [[rx, ry, rw, rh], [sw, sh]];
      }
    }
  }
}

function path(region, size): string {
  return `/${region.join(',')}/${size[0]},/0/native.jpg`;
}

export default class IIIFStatic {
  public src: HTMLImageElement;
  public tilesize: number;

  constructor(src: HTMLImageElement, tilesize: number = 512) {
    this.src = src;
    this.tilesize = tilesize;
  }

  public async generate(img: HTMLImageElement) {
    const { width, height } = img;
    const tileWidth = this.tilesize;
    const tileHeight = this.tilesize;
    let sf = 1;
    const scaleFactors: number[] = [sf];
    for (let j = 0; j < 30; j++) {
      sf = 2 * sf;
      if (tileWidth * sf > width && tileHeight * sf > height) {
        break;
      }
      scaleFactors.push(sf);
    }
    const res: any[] = [];
    const now = new Date();
    console.log('start', now, 'scaleFactors', scaleFactors);
    for (const [region, size] of staticPartialTileSizes(width, height, this.tilesize, scaleFactors)) {
      res.push(
        await this.generateTile(
          region,
          size as [number, number],
        ),
      );
    }
    const ratio = calculateAspectRatioFit(
      width, height, 480, 512,
    );
    res.push(await this.generateTile(
      [0, 0, width, height],
      [ratio.width, ratio.height],
    ));
    const past = new Date();
    console.log('end', past);
    return res;
  }

  private async generateTile(region: 'full' | number[], size: [number, number]) {
    const url = path(region, size);
    const img = await resizeImage(this.src, region, size, url);
    return [
      url,
      img,
    ];
  }
}
