import localforage from 'localforage';

localforage.config({
  driver      : [localforage.INDEXEDDB], // Force WebSQL; same as using setDriver()
  name        : 'GLISSE ET MONTRE',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description : 'some description',
});

export default localforage;
