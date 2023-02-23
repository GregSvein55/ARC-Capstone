import {Subscribable} from './subscribable';
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Viewable} from './viewable';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 */
@Component({ template: '' })
export abstract class BaseComponent extends Subscribable implements OnInit, AfterViewInit, Viewable {
  setupViews = () => {};
  setupBindings = () => {};
  ngOnInit = (): void => this.setupViews();
  ngAfterViewInit = (): void => this.setupBindings();
}
