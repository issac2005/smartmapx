import {Injectable, Injector, ComponentFactoryResolver} from '@angular/core';

import {SmxModalOptions, SmxModalConfig} from './modal-config';
import {NgbModalRef} from './modal-ref';
import {NgbModalStack} from './modal-stack';

/**
 * A service to open modal windows. Creating a modal is straightforward: create a template and pass it as an argument to
 * the "open" method!
 */
@Injectable({providedIn: 'root'})
export class SmxModal {
  constructor(
    private _moduleCFR: ComponentFactoryResolver, private _injector: Injector, private _modalStack: NgbModalStack,
    private _config: SmxModalConfig) {
  }

  /**
   * Opens a new modal window with the specified content and using supplied options. Content can be provided
   * as a TemplateRef or a component type. If you pass a component type as content, then instances of those
   * components can be injected with an instance of the SmxActiveModal class. You can use methods on the
   * SmxActiveModal class to close / dismiss modals from "inside" of a component.
   *
   * llcn update default
   */
  open(content: any, options: SmxModalOptions = {backdrop: 'static', keyboard: false, centered: true, newModal: false}): NgbModalRef {
    const combinedOptions = Object.assign({}, this._config, options);
    return this._modalStack.open(this._moduleCFR, this._injector, content, combinedOptions);
  }

  /**
   * Dismiss all currently displayed modal windows with the supplied reason.
   *
   * @since 3.1.0
   */
  dismissAll(reason?: any) {
    this._modalStack.dismissAll(reason);
  }

  /**
   * Indicates if there are currently any open modal windows in the application.
   *
   * @since 3.3.0
   */
  hasOpenModals(): boolean {
    return this._modalStack.hasOpenModals();
  }
}
