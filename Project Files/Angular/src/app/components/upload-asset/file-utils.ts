import {MediaType} from './media-type.enum';
import {LocalFile} from './local-file';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
export class FileUtils {

  static validMimeType(file: LocalFile, encodedB64: string): boolean {
    // These file signatures were sourced from: https://en.wikipedia.org/wiki/List_of_file_signatures
    const hex = this.base64ToHex(encodedB64);
    let bytes = '';
    switch (file.type) {
      case MediaType.PNG:
        bytes = hex.substring(0, 16);
        if (bytes === '89504E470D0A1A0A') {
          return true;
        }
        break;
      case MediaType.JPEG:
        bytes = hex.substring(0, 6);
        if (bytes === 'FFD8FF') {
          return true;
        }
        break;
      case MediaType.JPG:
        if (bytes === 'FFD8FF') {
          return true;
        }
        break;
      case MediaType.GIF:
        bytes = hex.substring(0, 8);
        if (bytes === '47494638') {
          return true;
        }
        break;
      case MediaType.MP4:
        bytes = hex.substring(8, 16); // MP4s have an offset of 4
        if (bytes === '66747970') {
          return true;
        }
        break;
      case MediaType.WEBM:
        bytes = hex.substring(0, 8);
        if (bytes === '1A45DFA3') {
          return true;
        }
        break;
      case MediaType.OGV:
        bytes = hex.substring(0, 8);
        if (bytes === '4F676753') {
          return true;
        }
        break;
      case MediaType.AVI:
        bytes = hex.substring(0, 8);
        if (bytes === '52494646') {
          return true;
        }
        break;
      case MediaType.MPG:
      case MediaType.MPEG:
        bytes = hex.substring(0, 8);
        if (bytes === '000001BA' || bytes === '000001B3') {
          return true;
        }
        break;
      case MediaType.MOV:
        bytes = hex.substring(0, 8);
        if (bytes === '66747970') {
          return true;
        }
        break;
    }
    return false;
  }

  // b64 must be encoded properly, cannot include 'data:image/png;base64' etc
  static base64ToHex(b64: string) {
    const raw = atob(b64);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const hex = raw.charCodeAt(i).toString(16);
      result += (hex.length === 2 ? hex : '0' + hex);
    }
    return result.toUpperCase();
  }

}
