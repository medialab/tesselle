import IIIFStatic from 'types/IIIFStatic';
// import save from 'save-file';
// import JSZip from 'jszip';
const defaultOptions = {
  dst: '/tmp',
  tilesize: 512,
};

export default async function slicer(img, opt = defaultOptions) {
  const sg = new IIIFStatic(img, opt.tilesize);
  const generated = await sg.generate(img);
  // const zip = new JSZip();
  // const images = zip.folder('images');
  // generated.forEach((file: File) => {
  //   images.file(file.name, file);
  // });
  // const content = await zip.generateAsync({type: 'blob'});
  // save(content, 'example.zip');
  return generated;
}
