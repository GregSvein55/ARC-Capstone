/**
 * This file contains the base component class for all components
 */

import {Subscribable} from './subscribable';
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Viewable} from './viewable';

@Component({ template: '' })
export abstract class BaseComponent extends Subscribable implements OnInit, AfterViewInit, Viewable {
  setupViews = () => {};
  setupBindings = () => {};
  ngOnInit = (): void => this.setupViews();
  ngAfterViewInit = (): void => this.setupBindings();
}
