// @ts-ignore
import buffer from 'buffer';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
export class LocalFile {
  public name: string = '';
  public type: string = '';
  public originalFile: File | undefined;
  public url: string | ArrayBuffer | undefined;
  public size: number = 0;
  public progress: number = 0;
  public success: boolean = false;
  public failed: boolean = false;
  public failureError: string = '';
  public hasPreview: boolean = false;

  isImage(): boolean {
    return this.type.match(/image\/*/) != null;
  }

  isVideo(): boolean {
    return this.type.match(/video\/*/) != null;
  }

  getName(): string | undefined {
    return this.name?.split('.')?.shift();
  }

  // converts the file to a blob
  asBlob(): Blob {
    const stripFileContents = (file: string): string => {
      const newFileContents = file.replace(/^data:image\/\w+;base64,/, '');
      return newFileContents.replace(/^data:video\/\w+;base64,/, '');
    }
    const newFileContents = stripFileContents(this.url as string);
    const buff = buffer.Buffer.from(newFileContents, 'base64');
    return new Blob([new Uint8Array(buff)]);
  }

  // converts the file to a file
  asTransferable(): File {
    return new File([this.asBlob()], this.name);
  }

}
