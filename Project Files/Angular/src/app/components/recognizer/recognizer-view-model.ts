import {Injectable} from '@angular/core';
import {BaseViewModel} from '../../../base/base-view-model';
import {BehaviorSubject, combineLatest, distinctUntilChanged, map, of, switchMap, take} from 'rxjs';
import {LocalFile} from '../upload-asset/local-file';
import {RecognitionApi} from '../../../api/recognition-api';
import {AnimationOptions} from 'ngx-lottie';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 * 
 * Modified by: Greg Sveinbjornson
 * Date: 2023-03-11
 * 
 */
@Injectable()
export class RecognizerViewModel extends BaseViewModel {

  constructor(private api: RecognitionApi) {
    super();
  }

  // Create a behavior subject for Lottie options with default animation path
  public lottieOptions$ = new BehaviorSubject<AnimationOptions>({ path: '/assets/FvoVgmHunM.json' });

  // Create behavior subjects for front and back photos
  private readonly _frontPhoto = new BehaviorSubject<LocalFile|undefined>(undefined);
  public readonly frontPhoto$ = this._frontPhoto as BehaviorSubject<LocalFile|undefined>;

  // Connect to the front photo behavior subject
  connectToFrontPhoto = (file: LocalFile|undefined) => this._frontPhoto.next(file);

  private readonly _backPhoto = new BehaviorSubject<LocalFile|undefined>(undefined);
  public readonly backPhoto$ = this._backPhoto as BehaviorSubject<LocalFile|undefined>;

  // Connect to the back photo behavior subject
  connectToBackPhoto = (file: LocalFile|undefined) => this._backPhoto.next(file);

  // Create observables for resetting and uploading photos
  public readonly reset$ = combineLatest([this.frontPhoto$, this.backPhoto$]).pipe(map(([f, b]) => !!f || !!b));
  public readonly upload$ = combineLatest([this.frontPhoto$, this.backPhoto$]).pipe(map(([f, b]) => !!f && !!b));

  // Create a behavior subject for tracking uploading status
  private readonly _uploading = new BehaviorSubject<boolean>(false);
  public readonly uploading$ = this._uploading as BehaviorSubject<boolean>;
  connectToUploading = (uploading: boolean) => this._uploading.next(uploading);

  public readonly buttonText$ = of('Upload');

  // Create a behavior subject for storing the API response
  private readonly _response = new BehaviorSubject<string|null>(null);
  public readonly response$ = this._response.pipe(distinctUntilChanged());

  // Connect to the response behavior subject
  connectToResponse = (response: string|null) => this._response.next(response);

  // Resets the page to default state
  reset(): void {
    this.connectToResponse(null);
    this.connectToBackPhoto(undefined);
    this.connectToFrontPhoto(undefined);
  }

  // Upload images by calling the recognition API with front and back photos
  uploadImages(): void {
    this.connectToUploading(true);
    combineLatest([this.frontPhoto$, this.backPhoto$])
      .pipe(take(1))
      .pipe(switchMap(([f, b]) => (!!f && !!b) ? this.api.recognize(f, b) : of('Please Add Front And Back Photos')))
      .pipe(take(1))
      .subscribe({
        // Success
        next: response => {
          this.connectToResponse(response);
          this.connectToUploading(false);
        },
        // Failure
        error: err => {
          this.connectToResponse(err);
          this.connectToUploading(false)
        }
      });
  }

}
