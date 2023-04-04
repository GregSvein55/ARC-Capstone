/**
 * This file contains the interface for the upload item component
 */

import {LocalFile} from '../local-file';


export interface UploadItemInterface {
  // takes a LocalFile object or undefined and returns void.
  removeMe(f: LocalFile | undefined): void;
}
