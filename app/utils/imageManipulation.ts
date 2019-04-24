interface Options {
  maxWidth: number;
  maxHeight: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

export function resizeImage(img, region, size, name) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const [x, y, w, h] = region;
    const drawingWidth = w;
    const drawingHeight = h;

    img.width = w;
    img.height = h;
    canvas.width = w;
    canvas.height = h;
    console.log('start draw');
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
    console.log('end draw', x, y, w, h);
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

function loadImage(file: File, options: Options): Promise<File> {
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
            `${file.name}-${width}x${height}-${options.right}-${options.top}-${options.bottom}-${options.left}`,
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
