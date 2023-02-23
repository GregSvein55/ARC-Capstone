import {Injectable} from '@angular/core';
import {BaseViewModel} from '../../../base/base-view-model';
import {BehaviorSubject, combineLatest, distinctUntilChanged, map, of, switchMap, take} from 'rxjs';
import {LocalFile} from '../upload-asset/local-file';
import {RecognitionApi} from '../../../api/recognition-api';
import {AnimationOptions} from 'ngx-lottie';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
@Injectable()
export class RecognizerViewModel extends BaseViewModel {

  constructor(private api: RecognitionApi) {
    super();
  }

  public lottieOptions$ = new BehaviorSubject<AnimationOptions>({ path: '/assets/FvoVgmHunM.json' });

  private readonly _frontPhoto = new BehaviorSubject<LocalFile|undefined>(undefined);
  public readonly frontPhoto$ = this._frontPhoto as BehaviorSubject<LocalFile|undefined>;
  connectToFrontPhoto = (file: LocalFile|undefined) => this._frontPhoto.next(file);

  private readonly _backPhoto = new BehaviorSubject<LocalFile|undefined>(undefined);
  public readonly backPhoto$ = this._backPhoto as BehaviorSubject<LocalFile|undefined>;
  connectToBackPhoto = (file: LocalFile|undefined) => this._backPhoto.next(file);

  public readonly reset$ = combineLatest([this.frontPhoto$, this.backPhoto$]).pipe(map(([f, b]) => !!f || !!b));
  public readonly upload$ = combineLatest([this.frontPhoto$, this.backPhoto$]).pipe(map(([f, b]) => !!f && !!b));

  private readonly _uploading = new BehaviorSubject<boolean>(false);
  public readonly uploading$ = this._uploading as BehaviorSubject<boolean>;
  connectToUploading = (uploading: boolean) => this._uploading.next(uploading);

  public readonly buttonText$ = of('Upload');

  private readonly _response = new BehaviorSubject<string|null>(null);
  public readonly response$ = this._response.pipe(distinctUntilChanged());
  connectToResponse = (response: string|null) => this._response.next(response);

  reset(): void {
    this.connectToResponse(null);
    this.connectToBackPhoto(undefined);
    this.connectToFrontPhoto(undefined);
  }

  uploadImages(): void {
    this.connectToUploading(true);
    combineLatest([this.frontPhoto$, this.backPhoto$])
      .pipe(take(1))
      .pipe(switchMap(([f, b]) => (!!f && !!b) ? this.api.recognize(f, b) : of('Please Add Front And Back Photos')))
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.connectToResponse(response);
          this.connectToUploading(false);
        },
        error: err => {
          this.connectToResponse(err);
          this.connectToUploading(false)
        }
      });
  }

}
