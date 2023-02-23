import {Subject, Subscription} from 'rxjs';
import {Injectable, OnDestroy} from '@angular/core';

/**
 * Create by: Kevin Baker
 * Date: 2023-02-14
 *
 * Takes care of destroy lifecycle, so you don't need to add 'implements OnDestroy'.
 * If you need to override ngOnDestroy functionality, just override destroy() function.
 *
 * example of override inside parent class:
 *
 * destroy() {
 *     super.destroy();
 *     // Your override code goes below
 *     resizeObserver?.disconnect();
 * }
 */
@Injectable()
export class Subscribable implements OnDestroy {

  onDestroy = new Subject<boolean>();
  subscriptions: Subscription[] = [];

  pushSub(s: Subscription): void {
    this.subscriptions.push(s);
  }

  destroySubs(): void {
    this.subscriptions?.forEach(subscription => subscription?.unsubscribe());
    this.subscriptions = [];
  }

  destroy(): void {
    this.onDestroy.next(true);
    this.destroySubs();
  }

  /**
   * Lifecycle hook called by angular framework when extended class dies.
   */
  ngOnDestroy(): void {
    this.destroy();
  }
}
