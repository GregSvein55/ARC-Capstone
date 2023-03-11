import {LocalFile} from '../local-file';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
export interface UploadItemInterface {
  // takes a LocalFile object or undefined and returns void.
  removeMe(f: LocalFile | undefined): void;
}
