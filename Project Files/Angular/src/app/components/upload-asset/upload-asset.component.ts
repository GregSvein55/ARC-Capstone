import {Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {UploadAssetViewModel} from './upload-asset-view-model';
import {UploadImageInterface} from './upload-image-interface';
import {BaseComponent} from '../../../base/base-component';

/**
 * IMPORTANT: This component is not meant to be used alone, but rather as a child 
 * component of another component.
 * 
 * This component allows you to drag and drop files into it, and notify a parent component when files
 * have changes.
 * @param parentHandler: pass your parent component in that implements this interface, so that it
 * knows when the file list has changed.
 * @param maxImages: x <= 0 means infinite, else x
 * @param allowVideo: self explanatory
 * @param allowImage: self explanatory
 */
@Component({
  selector: 'app-upload-asset',
  templateUrl: './upload-asset.component.html',
  styleUrls: ['./upload-asset.component.scss'],
  providers: [UploadAssetViewModel],
})
export class UploadAssetComponent extends BaseComponent implements OnChanges {

  @ViewChild('fileDropRef', {static: false}) fileDropEl: ElementRef | undefined;
  @Input() parentHandler: UploadImageInterface | undefined;
  @Input() allowImage: boolean = true;
  @Input() allowVideo: boolean = true;
  @Input() maxAssets: number = -1;
  @Input() displayList: boolean = true;
  @Input() isHidden: boolean = false;
  @Input() id: number = 0;
  public animating: boolean = false;

  constructor(
    public viewModel: UploadAssetViewModel,
  ) {
    super();
  }

  override setupViews = (): void => {
    super.setupViews();
    this.viewModel.id = this.id;
    this.viewModel.initMaxAssets(this.maxAssets);
    this.viewModel.initParentHandler(this.parentHandler);
    this.viewModel.initAcceptType(this.allowImage, this.allowVideo);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['maxImages']) this.viewModel.initMaxAssets(this.maxAssets);
    if (changes?.['parentHandler']) this.viewModel.initParentHandler(this.parentHandler);
    if (changes?.['allowImage']) this.viewModel.initAcceptType(this.allowImage, this.allowVideo);
    if (changes?.['allowVideo']) this.viewModel.initAcceptType(this.allowImage, this.allowVideo);
    if (changes?.['id']) this.viewModel.id = this.id;
  }

  override setupBindings = (): void => {
    super.setupBindings();
    const s = this.viewModel.resetInputState.subscribe(() => {
      if (this.fileDropEl) this.fileDropEl.nativeElement.value = '';
    });
    this.pushSub(s);
  }

  onFileDropped($event: any) {
    this.viewModel.handleUploadedFiles($event);
  }

  clear() {
    this.viewModel.clear();
  }

}
