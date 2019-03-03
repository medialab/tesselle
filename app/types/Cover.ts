import uuid from 'uuid';

export default class Cover {
  public id: string = uuid();
  constructor(
    public file: File,
    public width: number,
    public height: number,
    public url: string,
  ) {
  }
}
