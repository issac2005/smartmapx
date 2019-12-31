import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';


@Component({
    selector: 'sta-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
    @Output() changeEvent = new EventEmitter();
    @Input() config: any;
    @Input() style: any;

    sValue: any;
    max: any;
    min: any;

    constructor() {
    }

    ngOnInit() {

        // ;
        if (this.config.componentType === 1 || this.config.componentType === 3) {  // 1-100
            this.min = this.config.start;
            this.max = this.config.stop;

            if (this.style.metadata.statistics && this.style.metadata.statistics[this.config.attribute]) {
                this.sValue = this.style.metadata.statistics[this.config.attribute];
            } else {
                this.sValue = this.config.default;
            }
        } else { // 0 -1
            this.min = this.config.start * 100;
            this.max = this.config.stop * 100;


            if (this.style.metadata.statistics && this.style.metadata.statistics[this.config.attribute]) {
                this.sValue = this.style.metadata.statistics[this.config.attribute] * 100;
            } else {
                this.sValue = this.config.default * 100;
            }
        }


    }


    // 滑动结束
    onSlideEnd(e: any) {
        if (this.config.componentType === 1 || this.config.componentType === 2) {
            if (this.config.parentKey.length === 1) {
                this.style[this.config.parentKey[0]] = this.config.componentType === 1 ? e : e / 100;
            } else if (this.config.parentKey.length === 2) {
                this.style[this.config.parentKey[0]][this.config.parentKey[1]] = this.config.componentType === 1 ? e : e / 100;
            } else {
                this.style[this.config.parentKey[0]][this.config.parentKey[1]][this.config.parentKey[2]] =
                    this.config.componentType === 1 ? e : e / 100;
            }

            // 赋回显值
            if (this.style.metadata.statistics) {
                this.style.metadata.statistics[this.config.attribute] = this.config.componentType === 1 ? e : e / 100;
            } else {
                this.style.metadata.statistics = {};
                this.style.metadata.statistics[this.config.attribute] = this.config.componentType === 1 ? e : e / 100;
            }

        } else { // source处理(聚合图) comId === 3
            this.changeEvent.emit({key: this.config.attribute, value: e});

            // 赋回显值
            if (this.style.metadata.statistics) {
                this.style.metadata.statistics[this.config.attribute] = e;
            } else {
                this.style.metadata.statistics = {};
                this.style.metadata.statistics[this.config.attribute] = e;

            }
        }

    }

}
