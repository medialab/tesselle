const svgType = 'image/svg+xml';

const typesToExtensionsMap = {
  'image/svg+xml': 'svg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/bmp': 'bmp',
  'image/webp': 'webp',
};

export const typesToExtensions = (key) => {
  if (!typesToExtensionsMap[key]) {
    throw new Error('no types for ' + key);
  }
  return typesToExtensionsMap[key];
};

const extensionsToTypesMap = {
  svg: 'image/svg+xml',
  jpeg: 'image/jpeg',
  png: 'image/png',
  bmp: 'image/bmp',
  webp: 'image/webp',
};

export const extentionsToType = (key) => {
  if (!extensionsToTypesMap[key]) {
    throw new Error('no types for ' + key);
  }
  return extensionsToTypesMap[key];
};

export const isSvg = (file: File) => {
  return file.type === svgType;
};
