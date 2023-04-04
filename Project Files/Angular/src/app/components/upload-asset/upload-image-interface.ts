/**
 * This interface is used to pass the file list to the parent component
 */

import {LocalFile} from './local-file';

export interface UploadImageInterface {
  fileList(f: LocalFile[], id?: number): void;
}
