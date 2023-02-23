import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {RecognizerComponent} from './components/recognizer/recognizer.component';
import {DndDirective} from './components/upload-asset/dnd-directive';
import {UploadItemComponent} from './components/upload-asset/upload-item/upload-item.component';
import {UploadAssetComponent} from './components/upload-asset/upload-asset.component';
import {HighlightPlusModule} from 'ngx-highlightjs/plus';
import {HIGHLIGHT_OPTIONS} from 'ngx-highlightjs';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent,
    RecognizerComponent,
    UploadAssetComponent,
    UploadItemComponent,
    DndDirective
  ],
  imports: [
    BrowserModule,
    HighlightPlusModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          css: () => import('highlight.js/lib/languages/css'),
          xml: () => import('highlight.js/lib/languages/xml')
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
