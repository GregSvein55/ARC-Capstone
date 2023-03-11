import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BaseComponent} from '../../../base/base-component';
import {RecognizerViewModel} from './recognizer-view-model';
import {UploadImageInterface} from '../upload-asset/upload-image-interface';
import {LocalFile} from '../upload-asset/local-file';


/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 * 
 *  
 * Modified by: Greg Sveinbjornson
 * Date: 2023-03-11
 *
 */
@Component({
  selector: 'app-recognizer',
  templateUrl: './recognizer.component.html',
  styleUrls: ['./recognizer.component.scss'],
  providers: [RecognizerViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecognizerComponent extends BaseComponent implements UploadImageInterface {

  constructor(public viewModel: RecognizerViewModel) {
    super();
  }

  // This function is called when the user selects an image to upload
  fileList(f: LocalFile[], id?: number) {
    if (id === 0) {
      this.viewModel.connectToFrontPhoto(f?.[0]);
    } else if (id === 1) {
      this.viewModel.connectToBackPhoto(f?.[0]);
    }
  }

  // This function is used to format the response from the API
  formatResponse(response: string): string {
    if (!response) {
      return '';
    }
    
    const result = JSON.parse(response);
    const formattedOutput = `
      Brand: ${result.brand}
      Product: ${result.product}
      THC: ${result.thc}
      CBD: ${result.cbd}
      Strain: ${result.strain}
      Confidence: ${result.confidence}
    `;
    
    return formattedOutput;
  }

}
