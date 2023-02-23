import {LocalFile} from './local-file';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
export interface UploadImageInterface {
  fileList(f: LocalFile[], id?: number): void;
}
