import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LocalFile} from '../app/components/upload-asset/local-file';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
@Injectable({ providedIn: 'root' })
export class RecognitionApi {

  constructor(private http: HttpClient) {}

  public recognize(
    front: LocalFile,
    back: LocalFile,
  ): Observable<string> {
    const formData: FormData = new FormData();
    if (front?.originalFile) formData.append('front_image', front?.originalFile, front?.originalFile?.name);
    if (back?.originalFile) formData.append('back_image', back?.originalFile, back?.originalFile.name);
    return this.http.post<string>('http://54.226.146.162:5000/predict', formData);
  }

}
