// import { execute, buildInputFile, loadImageElement } from 'wasm-imagemagick';

interface Options {
  maxWidth: number;
  maxHeight: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  name?: string;
}

export function calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

export function resizeImage(img: HTMLImageElement, region, [sizeWidth, sizeHeight]: [number, number]): Promise<File> {
  const [x, y, w, h] = region;
  const drawingWidth = w;
  const drawingHeight = h;

  img.width = sizeWidth;
  img.height = sizeHeight;
  canvas.width = sizeWidth;
  canvas.height = sizeHeight;
  context.drawImage(
    img,
    x,
    y,
    drawingWidth,
    drawingHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob: Blob) => {
      resolve(
        new File(
          [blob],
          `default.jpg`,
          {type: 'image/jpeg'},
        ),
      );
    });
  });
}

async function loadImage(file: File, options: Options): Promise<File> {
  // const drawingWidth = options.right - options.left;
  // const drawingHeight = options.bottom - options.top;
  // console.log(file)
  // const res = await execute({
  //   inputFiles: [await buildInputFile((file as any).preview, file.name)],
  //   commands: [
  //     `convert ${file.name} -resize ${drawingWidth}x${drawingHeight} thumbnail.jpg`
  //   ],
  // });
  // const { outputFiles, exitCode } = res;
  // console.log(res)
  // if (exitCode) {
  //   console.log('exit code !', exitCode);
  //   debugger;
  //   throw new Error('exit code: ' + exitCode);
  // }
  // console.log('c ici poto', outputFiles);
  // await loadImageElement(outputFiles[0], document.querySelector('#quoi') as HTMLImageElement)
  // return outputFiles[0] as any;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const drawingWidth = options.right - options.left;
    const drawingHeight = options.bottom - options.top;
    const { width, height } = calculateAspectRatioFit(
      drawingWidth, drawingHeight, options.maxWidth, options.maxHeight,
    );

    img.width = width;
    img.height = height;
    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      context.drawImage(
        img,
        options.left,
        options.top,
        drawingWidth,
        drawingHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      canvas.toBlob((blob: Blob) => {
        resolve(
          new File(
            [blob],
            options.name ? options.name : file.name,
            {type: file.type},
          ),
        );
      });
    };
    img.src = window.URL.createObjectURL(file);
    img.onerror = reject;
  });
}

export default loadImage;
