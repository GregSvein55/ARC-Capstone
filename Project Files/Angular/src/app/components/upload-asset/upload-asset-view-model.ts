import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {UploadImageInterface} from './upload-image-interface';
import {debounceTime} from 'rxjs/operators';
import {LocalFile} from './local-file';
import {MediaType} from './media-type.enum';
import {MediaUtils} from './media-utils';
import {FileUtils} from './file-utils';
import {UploadItemInterface} from './upload-item/upload-item-interface';
import {BaseViewModel} from '../../../base/base-view-model';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
@Injectable()
export class UploadAssetViewModel extends BaseViewModel implements UploadItemInterface {

  static MAX_IMG_SIZE = 10485760; // 10 MB
  static MAX_VIDEO_SIZE = 20971520 * 5 * 10 * 2; // 2 GB

  public id: number | undefined;
  public resetInputState: Subject<boolean> = new Subject<boolean>();
  public files: LocalFile[] = [];
  public accept: string | undefined;
  public parentHandler: UploadImageInterface | undefined;
  public maxAssets: number = -1;
  public changeDetect = new Subject<boolean>();

  private uploadDebouncer: Subject<boolean> = new Subject<boolean>();

  static normalizeCharacters(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '');
  }

  constructor() {
    super();
    this.uploadDebouncer.pipe(
      debounceTime(50))
      .subscribe(_ => {
        this.uploadFiles();
      });
  }

  initMaxAssets(ma: number) {
    this.maxAssets = ma;
  }

  initParentHandler(h: UploadImageInterface | undefined) {
    if (h) this.parentHandler = h;
  }

  initAcceptType(image: boolean = true, video: boolean = true) {
    let s = '';
    if (video && image) {
      s = s.concat('video/*|image/*');
    } else if (video) {
      s = s.concat('video/*');
    } else {
      s = s.concat('image/*');
    }
    this.accept = s;
  }

  
  // Event handler for when a file is selected
  fileBrowseHandler(target: any) {
    this.handleUploadedFiles(target.files);
  }

  // Event handler for when a file is uploaded
  handleUploadedFiles(uploadedFiles: FileList) {
    Array.from(uploadedFiles).forEach(file => {
      // ensure the content type is image or video
      if (!this.properFileType(file)) {
        console.warn('Only images and videos are supported.');
        return;
      }
      this.readAsDataUrl(file);
    });
  }

  // Event handler for when a file is dropped
  private readAsDataUrl(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const f = new LocalFile();
      f.originalFile = file;
      f.name = UploadAssetViewModel.normalizeCharacters(file.name.toLowerCase()).replace(' ', '');
      f.type = file.type;
      f.size = file.size;
      f.url = event?.target?.result?.toString();
      this.prepareFilesList(new Array(f));
    };
  }

  // checking file type
  properFileType(f: File): boolean {
    const mimeType = f.type;
    if (mimeType.match(/image\/*/) !== null || mimeType.match(/video\/*/) !== null) {
      if (this.getMediaType(f) != null) {
        return true;
      }
    }
    return false;
  }

  getMediaType(f: File): MediaType | null {
    return MediaUtils.getMediaType(f.name);
  }

  prepareFilesList(files: LocalFile[]) {
    const indexesToUpload = [];
    for (const file of files) {
      if (this.isFileTooLarge(file)) {
        console.error('File too large.');
      } else if (!this.checkMimeType(file)) {
        console.error('File is corrupt: Unexpected MIME Type.', 'File Extension Error');
      } else if (!this.accept?.includes('video') && file.isVideo()) {
        // -- do nothing
      } else if (!this.accept?.includes('image') && file.isImage()) {
        // -- do nothing
      } else if (!file.success && !file.failed) {
        // if no success or failure, the file can be processed
        file.progress = 0;
        if (this.maxAssets <= 0) {
          this.files.push(file);
        } else {
          if (files.length >= this.maxAssets) {
            this.files.shift();
          }
          this.files.push(file);
        }
        indexesToUpload.push(this.files.indexOf(file));
      }
    }
    this.resetInputState.next(true);
    if (indexesToUpload.length > 0) {
      indexesToUpload.forEach(i => {
        this.files[i].progress = 100;
        this.files[i].failed = false;
        this.files[i].success = true;
      });
      this.uploadDebouncer.next(true);
    }
  }

  checkMimeType(file: LocalFile): boolean {
    const b64Url = String(file.url);
    const replacementString = 'data:' + file.type + ';base64,';
    const encodedB64 = b64Url.replace(replacementString, '');
    return FileUtils.validMimeType(file, encodedB64);
  }

  uploadFiles() {
    if (this.parentHandler) {
      // Show as successful because we will handle the upload logic elsewhere
      this.parentHandler.fileList(this.files, this.id);
      return;
    } else {
      console.error('Add parent handler for upload asset component.');
    }
    this.clear();
  }

  getPlaceholderImagePadding(index: number) {
    if (this.files[index].url && this.files[index].hasPreview) {
      return '0';
    } else {
      return '0.625rem';
    }
  }

  isFileTooLarge(f: LocalFile): boolean {
    return f.size > (f.isVideo() ? UploadAssetViewModel.MAX_VIDEO_SIZE : UploadAssetViewModel.MAX_IMG_SIZE);
  }

  // removes file from the list
  removeMe(f: LocalFile) {
    const i = this.files?.indexOf(f);
    if (i >= 0 && (this.files.length) > i) {
      this.files.splice(i, 1);
    }
    this.parentHandler?.fileList(this.files, this.id);
  }

  // removes all files from the list
  clear() {
    this.files = [];
    this.parentHandler?.fileList(this.files, this.id);
  }

}
