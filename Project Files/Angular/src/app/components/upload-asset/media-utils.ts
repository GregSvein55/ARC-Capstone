import {MediaType} from './media-type.enum';

/**
 * This class is used to store the file that the user has selected
 */
export class MediaUtils {

  static getMediaType(name: string | undefined): MediaType | null {
    switch (name?.split('.')?.pop()?.toLowerCase()) {
      case 'jpg':
        return MediaType.JPG;
      case 'jpeg':
        return MediaType.JPEG;
      case 'png':
        return MediaType.PNG;
      case 'gif':
        return MediaType.GIF;
      case 'mp4':
        return MediaType.MP4;
      case 'webm':
        return MediaType.WEBM;
      case 'ogg':
        return MediaType.OGV;
      case 'avi':
        return MediaType.AVI;
      case 'mpeg':
        return MediaType.MPEG;
      case 'mpg':
        return MediaType.MPG;
      case 'mov':
        return MediaType.MOV;
      case 'pdf':
        return MediaType.PDF;
      default:
        return null;
    }
  }

  static isImage(mediaType: MediaType): boolean {
    const imageTypes: MediaType[] = [MediaType.JPG, MediaType.JPEG, MediaType.PNG, MediaType.GIF];
    return imageTypes.includes(mediaType);
  }

  static isVideo(mediaType: MediaType): boolean {
    const videoTypes: MediaType[] = [MediaType.MP4, MediaType.WEBM, MediaType.OGV, MediaType.AVI,
      MediaType.MPEG, MediaType.MOV, MediaType.MPG];
    return videoTypes.includes(mediaType);
  }

  static getRefreshAssetLoadingMessage(remainingRetries: number) {
    switch (remainingRetries) {
      case 0:
        return 'Reloading Asset.';
      case 1:
        return 'Reloading Asset.';
      case 2:
        return 'Reloading Asset.';
      case 3:
        return 'Reloading Asset.';
      case 4:
        return 'Resizing Asset.';
      case 5:
        return 'Resizing Asset.';
      case 6:
        return 'Resizing Asset.';
      case 7:
        return 'Compressing Asset.';
      case 8:
        return 'Compressing Asset.';
      case 9:
        return 'Compressing Asset.';
      case 10:
        return 'Compressing Asset.';
      default:
        return `Loading Asset (${remainingRetries})`;
    }
  }

  static getRefreshMenuMediaAsset(remainingRetries: number) {
    switch (remainingRetries) {
      case 1:
        return 'Reloading Media.';
      case 2:
        return 'Reloading Media.';
      case 3:
        return 'Reloading Media.';
      case 4:
        return 'Resizing Media.';
      case 5:
        return 'Resizing Media.';
      case 6:
        return 'Resizing Media.';
      default:
        return `Compressing Media.`;
    }
  }

}
