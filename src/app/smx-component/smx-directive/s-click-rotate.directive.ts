import {Directive, ElementRef, HostListener, Input, Renderer2, AfterViewInit} from '@angular/core';

@Directive({
  selector: '[SmxClickRotate]'
})
export class SClickRotateDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderer.addClass(this.elementRef.nativeElement, 'smx-rotate');
      setTimeout(() => {
        this.renderer.removeClass(this.elementRef.nativeElement, 'smx-rotate');
      }, 2000);
    }, 0);

  }


  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    this.renderer.addClass(this.elementRef.nativeElement, 'smx-rotate');
    setTimeout(() => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'smx-rotate');
    }, 2000);
  }
}
