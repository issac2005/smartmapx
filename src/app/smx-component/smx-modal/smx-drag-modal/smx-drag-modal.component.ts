import {
  Component, ElementRef, OnDestroy, Input, Output, EventEmitter, Renderer2,
  ContentChildren, QueryList, ViewChild, NgZone
} from '@angular/core';
import {trigger, state, style, transition, animate, AnimationEvent} from '@angular/animations';
import {DomHandler} from '../../share/domhandler';
import {SmxFooter, SmxHeader} from '../../share/shared';
import {SmxActiveModal} from '../directive/modal-ref';

let idx = 0;

@Component({
  selector: 'smx-drag-modal',
  templateUrl: 'smx-drag-modal.component.html',
  styleUrls: ['smx-drag-modal.component.scss'],
  animations: [
    trigger('animation', [
      state('void', style({
        transform: 'scale(0.7)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'none',
        opacity: 1
      })),
      transition('* => *', animate('{{transitionParams}}'))
    ])
  ]
})
export class SmxDragModalComponent implements OnDestroy {

  visible = true;
  modal = false;   // 遮罩

  @Input() header: string;   // 表头名称

  @Input() draggable: boolean = true;   // 拖拽

  @Input() resizable: boolean = true;    // 是否可拉伸

  @Input() positionLeft: number;

  @Input() positionTop: number;

  @Input() contentStyle: any;

  @Input() closeOnEscape: boolean = false;   // 关闭按钮

  @Input() dismissableMask: boolean;

  @Input() rtl: boolean;

  @Input() closable: boolean = true;

  @Input() responsive: boolean = true;

  @Input() appendTo: any;

  @Input() style: any;

  @Input() styleClass: string;

  @Input() showHeader: boolean = true;

  @Input() breakpoint: number = 640;

  @Input() blockScroll: boolean = false;

  @Input() autoZIndex: boolean = true;

  @Input() baseZIndex: number = 0;

  @Input() minX: number = 0;

  @Input() minY: number = 0;

  @Input() focusOnShow: boolean = false;

  @Input() maximizable: boolean;      // 最大化
  @Input() minimizable: boolean;      // 最小化

  @Input() focusTrap: boolean = true;

  @Input() transitionOptions: string = '150ms cubic-bezier(0, 0, 0.2, 1)';

  closeIcon: string = 'pi pi-times';   // 去掉关闭按钮

  minimizeIcon: string = 'pi pi-window-minimize';  // 去掉输入

  maximizeIcon: string = 'pi pi-window-maximize';  // 去掉输入

  @ContentChildren(SmxHeader, {descendants: false}) headerFacet: QueryList<SmxHeader>;

  @ContentChildren(SmxFooter, {descendants: false}) footerFacet: QueryList<SmxFooter>;

  @ViewChild('titlebar', {static: false}) headerViewChild: ElementRef;

  @ViewChild('content', {static: false}) contentViewChild: ElementRef;

  @ViewChild('footer', {static: false}) footerViewChild: ElementRef;

  @Output() onShow: EventEmitter<any> = new EventEmitter();

  @Output() onHide: EventEmitter<any> = new EventEmitter();

  @Output() visibleChange: EventEmitter<any> = new EventEmitter();

  container: HTMLDivElement;

  _visible: boolean;

  dragging: boolean;

  documentDragListener: any;

  documentKeydownListener: any;

  documentDragEndListener: any;

  resizing: boolean;

  documentResizeListener: any;

  documentResizeEndListener: any;

  documentResponsiveListener: any;

  documentEscapeListener: Function;

  maskClickListener: Function;

  lastPageX: number;

  lastPageY: number;

  mask: HTMLDivElement;

  closeIconMouseDown: boolean;

  preWidth: number;

  preventVisibleChangePropagation: boolean;

  maximized: boolean;

  preMaximizeContentHeight: number;

  preMaximizeContainerWidth: number;

  preMaximizeContainerHeight: number;

  preMaximizePageX: number;

  preMaximizePageY: number;

  _width: any;

  _height: any;

  _minWidth: any;

  _minHeight: any;

  id: string = `ui-dialog-${idx++}`;
  minimizeStatus = false;

  constructor(public el: ElementRef, public renderer: Renderer2, public zone: NgZone, private smxActiveModal: SmxActiveModal) {
  }

  @Input() get width(): any {
    return this._width;
  }

  set width(val: any) {
    this._width = val;
    console.warn('width property is deprecated, use style to define the width of the Dialog.');
  }

  @Input() get height(): any {
    return this._height;
  }

  set height(val: any) {
    this._height = val;
    console.warn('height property is deprecated, use style to define the height of the Dialog.');
  }

  @Input() get minWidth(): any {
    return this._minWidth;
  }

  set minWidth(val: any) {
    this._minWidth = val;
    console.warn('minWidth property is deprecated, use style to define the minWidth of the Dialog.');
  }

  @Input() get minHeight(): any {
    return this._minHeight;
  }

  set minHeight(val: any) {
    this._minHeight = val;
    console.warn('minHeight property is deprecated, use style to define the minHeight of the Dialog.');
  }

  focus() {
    const focusable = DomHandler.findSingle(this.container, 'button');
    if (focusable) {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => focusable.focus(), 5);
      });
    }
  }

  positionOverlay() {
    const viewport = DomHandler.getViewport();
    if (DomHandler.getOuterHeight(this.container) + this.contentViewChild.nativeElement.scrollHeight - this.contentViewChild.nativeElement.clientHeight > viewport.height) {
      this.contentViewChild.nativeElement.style.height = (viewport.height * .75) + 'px';
      this.container.style.height = 'auto';
    } else {
      this.contentViewChild.nativeElement.style.height = null;
      if (this.height) {
        this.container.style.height = this.height + 'px';
      }
    }

    if (this.positionLeft >= 0 && this.positionTop >= 0) {
      this.container.style.left = this.positionLeft + 'px';
      this.container.style.top = this.positionTop + 'px';
    } else if (this.positionTop >= 0) {
      this.center();
      this.container.style.top = this.positionTop + 'px';
    } else {
      this.center();
    }
  }

  close(event: Event) {
    // ;
    this.visibleChange.emit(false);
    this.smxActiveModal.dismiss();
    event.preventDefault();
  }

  center() {
    let elementWidth = DomHandler.getOuterWidth(this.container);
    let elementHeight = DomHandler.getOuterHeight(this.container);
    if (elementWidth === 0 && elementHeight === 0) {
      this.container.style.visibility = 'hidden';
      this.container.style.display = 'block';
      elementWidth = DomHandler.getOuterWidth(this.container);
      elementHeight = DomHandler.getOuterHeight(this.container);
      this.container.style.display = 'none';
      this.container.style.visibility = 'visible';
    }
    const viewport = DomHandler.getViewport();
    const x = Math.max(Math.floor((viewport.width - elementWidth) / 2), 0);
    const y = Math.max(Math.floor((viewport.height - elementHeight) / 2), 0);

    this.container.style.left = x + 'px';
    this.container.style.top = y + 'px';
  }

  enableModality() {
    if (!this.mask) {
      this.mask = document.createElement('div');
      this.mask.style.zIndex = String(parseInt(this.container.style.zIndex, 10) - 1);
      let maskStyleClass = 'ui-widget-overlay ui-dialog-mask';
      if (this.blockScroll) {
        maskStyleClass += ' ui-dialog-mask-scrollblocker';
      }
      DomHandler.addMultipleClasses(this.mask, maskStyleClass);

      if (this.closable && this.dismissableMask) {
        this.maskClickListener = this.renderer.listen(this.mask, 'click', (event: any) => {
          this.close(event);
        });
      }
      document.body.appendChild(this.mask);
      if (this.blockScroll) {
        DomHandler.addClass(document.body, 'ui-overflow-hidden');
      }
    }
  }

  disableModality() {
    if (this.mask) {
      this.unbindMaskClickListener();
      document.body.removeChild(this.mask);

      if (this.blockScroll) {
        const bodyChildren = document.body.children;
        let hasBlockerMasks: boolean;
        for (let i = 0; i < bodyChildren.length; i++) {
          const bodyChild = bodyChildren[i];
          if (DomHandler.hasClass(bodyChild, 'ui-dialog-mask-scrollblocker')) {
            hasBlockerMasks = true;
            break;
          }
        }

        if (!hasBlockerMasks) {
          DomHandler.removeClass(document.body, 'ui-overflow-hidden');
        }
      }
      this.mask = null;
    }
  }

  toggleMaximize(event) {
    if (this.maximized) {
      this.revertMaximize();
    } else {
      this.maximize();
    }

    event.preventDefault();
  }

  toggleMinimize(event?: any) {
    if (event === 'min') {
      this.container.style.display = 'none';
      this.minimizeStatus = true;
    } else {
      this.container.style.display = 'block';
      this.minimizeStatus = false;
    }

  }

  maximize() {
    this.preMaximizePageX = parseFloat(this.container.style.top);
    this.preMaximizePageY = parseFloat(this.container.style.left);
    this.preMaximizeContainerWidth = DomHandler.getOuterWidth(this.container);
    this.preMaximizeContainerHeight = DomHandler.getOuterHeight(this.container);
    this.preMaximizeContentHeight = DomHandler.getOuterHeight(this.contentViewChild.nativeElement);

    this.container.style.top = '0px';
    this.container.style.left = '0px';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    let diffHeight = parseFloat(this.container.style.top);
    if (this.headerViewChild && this.headerViewChild.nativeElement) {
      diffHeight += DomHandler.getOuterHeight(this.headerViewChild.nativeElement);
    }
    if (this.footerViewChild && this.footerViewChild.nativeElement) {
      diffHeight += DomHandler.getOuterHeight(this.footerViewChild.nativeElement);
    }
    this.contentViewChild.nativeElement.style.height = 'calc(100vh - ' + diffHeight + 'px)';

    DomHandler.addClass(this.container, 'ui-dialog-maximized');
    DomHandler.addClass(document.body, 'ui-overflow-hidden');
    this.moveOnTop();

    this.maximized = true;
  }

  revertMaximize() {
    this.container.style.top = this.preMaximizePageX + 'px';
    this.container.style.left = this.preMaximizePageY + 'px';
    this.container.style.width = this.preMaximizeContainerWidth + 'px';
    this.container.style.height = this.preMaximizeContainerHeight + 'px';
    this.contentViewChild.nativeElement.style.height = this.preMaximizeContentHeight + 'px';

    DomHandler.removeClass(document.body, 'ui-overflow-hidden');

    this.maximized = false;

    this.zone.runOutsideAngular(() => {
      setTimeout(() => DomHandler.removeClass(this.container, 'ui-dialog-maximized'), 300);
    });
  }

  unbindMaskClickListener() {
    if (this.maskClickListener) {
      this.maskClickListener();
      this.maskClickListener = null;
    }
  }

  moveOnTop() {
    if (this.autoZIndex) {
      this.container.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
    }
  }

  onCloseMouseDown(event: Event) {
    this.closeIconMouseDown = true;
  }

  initDrag(event: MouseEvent) {
    if (this.closeIconMouseDown) {
      this.closeIconMouseDown = false;
      return;
    }

    if (this.draggable) {
      this.dragging = true;
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      DomHandler.addClass(document.body, 'ui-unselectable-text');
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (this.focusTrap) {
      if (event.which === 9) {
        event.preventDefault();

        const focusableElements = (DomHandler as any).getFocusableElements(this.container);

        if (focusableElements && focusableElements.length > 0) {
          if (!document.activeElement) {
            focusableElements[0].focus();
          } else {
            const focusedIndex = focusableElements.indexOf(document.activeElement);

            if (event.shiftKey) {
              if (focusedIndex === -1 || focusedIndex === 0) {
                focusableElements[focusableElements.length - 1].focus();
              } else {
                focusableElements[focusedIndex - 1].focus();
              }
            } else {
              if (focusedIndex === -1 || focusedIndex === (focusableElements.length - 1)) {
                focusableElements[0].focus();
              } else {
                focusableElements[focusedIndex + 1].focus();
              }
            }
          }
        }
      }
    }
  }

  onDrag(event: MouseEvent) {
    if (this.dragging) {
      const containerWidth = DomHandler.getOuterWidth(this.container);
      const containerHeight = DomHandler.getOuterHeight(this.container);
      const deltaX = event.pageX - this.lastPageX;
      const deltaY = event.pageY - this.lastPageY;
      const offset = DomHandler.getOffset(this.container);
      const leftPos = offset.left + deltaX;
      const topPos = offset.top + deltaY;
      const viewport = DomHandler.getViewport();

      if (leftPos >= this.minX && (leftPos + containerWidth) < viewport.width) {
        this.container.style.left = leftPos + 'px';
      }

      if (topPos >= this.minY && (topPos + containerHeight) < viewport.height) {
        this.container.style.top = topPos + 'px';
      }

      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
    }
  }

  endDrag(event: MouseEvent) {
    if (this.draggable) {
      this.dragging = false;
      DomHandler.removeClass(document.body, 'ui-unselectable-text');
    }
  }

  initResize(event: MouseEvent) {
    if (this.resizable) {
      this.preWidth = null;
      this.resizing = true;
      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
      DomHandler.addClass(document.body, 'ui-unselectable-text');
    }
  }

  onResize(event: MouseEvent) {
    if (this.resizing) {
      const deltaX = event.pageX - this.lastPageX;
      const deltaY = event.pageY - this.lastPageY;
      const containerWidth = DomHandler.getOuterWidth(this.container);
      const containerHeight = DomHandler.getOuterHeight(this.container);
      const contentHeight = DomHandler.getOuterHeight(this.contentViewChild.nativeElement);
      const newWidth = containerWidth + deltaX;
      const newHeight = containerHeight + deltaY;
      const minWidth = this.container.style.minWidth || '200';
      const minHeight = this.container.style.minHeight || '100';
      const offset = DomHandler.getOffset(this.container);
      const viewport = DomHandler.getViewport();

      if ((!minWidth || newWidth > parseInt(minWidth, 10)) && (offset.left + newWidth) < viewport.width) {
        this.container.style.width = newWidth + 'px';
      }

      if ((!minHeight || newHeight > parseInt(minHeight, 10)) && (offset.top + newHeight) < viewport.height) {
        this.container.style.height = newHeight + 'px';
        this.contentViewChild.nativeElement.style.height = contentHeight + deltaY + 'px';
      }

      this.lastPageX = event.pageX;
      this.lastPageY = event.pageY;
    }
  }

  onResizeEnd() {
    if (this.resizing) {
      this.resizing = false;
      DomHandler.removeClass(document.body, 'ui-unselectable-text');
    }
  }

  bindGlobalListeners() {
    if (this.modal) {
      this.bindDocumentKeydownListener();
    }

    if (this.draggable) {
      this.bindDocumentDragListener();
      this.bindDocumentDragEndListener();
    }

    if (this.resizable) {
      this.bindDocumentResizeListeners();
    }

    if (this.responsive) {
      this.bindDocumentResponsiveListener();
    }

    if (this.closeOnEscape && this.closable) {
      this.bindDocumentEscapeListener();
    }
  }

  unbindGlobalListeners() {
    this.unbindDocumentDragListener();
    this.unbindDocumentKeydownListener();
    this.unbindDocumentDragEndListener();
    this.unbindDocumentResizeListeners();
    this.unbindDocumentResponsiveListener();
    this.unbindDocumentEscapeListener();
  }

  bindDocumentKeydownListener() {
    this.zone.runOutsideAngular(() => {
      this.documentKeydownListener = this.onKeydown.bind(this);
      window.document.addEventListener('keydown', this.documentKeydownListener);
    });
  }

  unbindDocumentKeydownListener() {
    if (this.documentKeydownListener) {
      window.document.removeEventListener('keydown', this.documentKeydownListener);
      this.documentKeydownListener = null;
    }
  }

  bindDocumentDragListener() {
    this.zone.runOutsideAngular(() => {
      this.documentDragListener = this.onDrag.bind(this);
      window.document.addEventListener('mousemove', this.documentDragListener);
    });
  }

  unbindDocumentDragListener() {
    if (this.documentDragListener) {
      window.document.removeEventListener('mousemove', this.documentDragListener);
      this.documentDragListener = null;
    }
  }

  bindDocumentDragEndListener() {
    this.zone.runOutsideAngular(() => {
      this.documentDragEndListener = this.endDrag.bind(this);
      window.document.addEventListener('mouseup', this.documentDragEndListener);
    });
  }

  unbindDocumentDragEndListener() {
    if (this.documentDragEndListener) {
      window.document.removeEventListener('mouseup', this.documentDragEndListener);
      this.documentDragEndListener = null;
    }
  }

  bindDocumentResizeListeners() {
    this.zone.runOutsideAngular(() => {
      this.documentResizeListener = this.onResize.bind(this);
      this.documentResizeEndListener = this.onResizeEnd.bind(this);
      window.document.addEventListener('mousemove', this.documentResizeListener);
      window.document.addEventListener('mouseup', this.documentResizeEndListener);
    });
  }

  unbindDocumentResizeListeners() {
    if (this.documentResizeListener && this.documentResizeEndListener) {
      window.document.removeEventListener('mouseup', this.documentResizeListener);
      window.document.removeEventListener('mouseup', this.documentResizeEndListener);
      this.documentResizeListener = null;
      this.documentResizeEndListener = null;
    }
  }

  bindDocumentResponsiveListener() {
    this.zone.runOutsideAngular(() => {
      this.documentResponsiveListener = this.onWindowResize.bind(this);
      window.addEventListener('resize', this.documentResponsiveListener);
    });
  }

  unbindDocumentResponsiveListener() {
    if (this.documentResponsiveListener) {
      window.removeEventListener('resize', this.documentResponsiveListener);
      this.documentResponsiveListener = null;
    }
  }

  onWindowResize() {
    if (this.maximized) {
      return;
    }

    const viewport = DomHandler.getViewport();
    const width = DomHandler.getOuterWidth(this.container);
    if (viewport.width <= this.breakpoint) {
      if (!this.preWidth) {
        this.preWidth = width;
      }
      this.container.style.left = '0px';
      this.container.style.width = '100%';
    } else {
      this.container.style.width = this.preWidth + 'px';
      this.positionOverlay();
    }
  }

  bindDocumentEscapeListener() {
    this.documentEscapeListener = this.renderer.listen('document', 'keydown', (event) => {
      if (event.which === 27) {
        if (parseInt(this.container.style.zIndex, 10) === (DomHandler.zindex + this.baseZIndex)) {
          this.close(event);
        }
      }
    });
  }

  unbindDocumentEscapeListener() {
    if (this.documentEscapeListener) {
      this.documentEscapeListener();
      this.documentEscapeListener = null;
    }
  }

  setDimensions() {
    if (this.width) {
      this.container.style.width = this.width + 'px';
    }

    if (this.height) {
      this.container.style.height = this.height + 'px';
    }

    if (this.minWidth) {
      this.container.style.minWidth = this.minWidth + 'px';
    }

    if (this.minHeight) {
      this.container.style.minHeight = this.minHeight + 'px';
    }
  }

  appendContainer() {
    if (this.appendTo) {
      if (this.appendTo === 'body') {
        document.body.appendChild(this.container);
      } else {
        DomHandler.appendChild(this.container, this.appendTo);
      }
    }
  }

  restoreAppend() {
    if (this.container && this.appendTo) {
      this.el.nativeElement.appendChild(this.container);
    }
  }

  onAnimationStart(event: AnimationEvent) {
    switch (event.toState) {
      case 'visible':
        this.container = event.element;
        this.setDimensions();
        this.onShow.emit({});
        this.appendContainer();
        this.moveOnTop();
        this.positionOverlay();
        this.bindGlobalListeners();

        if (this.maximized) {
          DomHandler.addClass(document.body, 'ui-overflow-hidden');
        }

        if (this.modal) {
          this.enableModality();
        }

        if (this.focusOnShow) {
          this.focus();
        }

        if (this.responsive) {
          this.onWindowResize();
        }
        break;

      case 'void':
        this.onContainerDestroy();
        this.onHide.emit({});
        break;
    }
  }

  onContainerDestroy() {
    this.unbindGlobalListeners();
    this.dragging = false;

    if (this.maximized) {
      DomHandler.removeClass(document.body, 'ui-overflow-hidden');
      this.maximized = false;
    }

    if (this.modal) {
      this.disableModality();
    }

    this.container = null;
  }

  ngOnDestroy() {
    if (this.container) {
      this.restoreAppend();
      this.onContainerDestroy();
    }
  }

}

