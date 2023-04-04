/**
 * This file contains the API connection for the recognition API
 */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LocalFile} from '../app/components/upload-asset/local-file';


@Injectable({ providedIn: 'root' })
export class RecognitionApi {

  constructor(private http: HttpClient) {}

  // This function sends the picture to the API using POST
  
  public recognize(
    front: LocalFile,
    back: LocalFile,
  ): Observable<string> {
    
    const formData: FormData = new FormData();

    if (front?.originalFile) formData.append('front_image', front?.originalFile, front?.originalFile?.name);
    if (back?.originalFile) formData.append('back_image', back?.originalFile, back?.originalFile.name);
    
    // change the IP of the API here if nessesary
    return this.http.post<string>('https://52.207.225.183:5000/predict', formData);
  }

}
