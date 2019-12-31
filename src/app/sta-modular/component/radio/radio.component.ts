import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';


@Component({
    selector: 'sta-radio',
    templateUrl: './radio.component.html',
    styleUrls: ['./radio.component.scss']
})
export class RadioComponent implements OnInit {
    @Output() changeEvent = new EventEmitter();
    @Input() config: any;
    @Input() style: any;

    sValue: any;

    constructor() {

    }

    ngOnInit() {

        if (this.style.metadata.statistics) {
            if (typeof this.style.metadata.statistics[this.config.attribute] === 'boolean') {
                this.sValue = this.style.metadata.statistics[this.config.attribute];
            } else if (this.style.metadata.statistics[this.config.attribute]) {
                this.sValue = this.style.metadata.statistics[this.config.attribute];
            } else {
                this.sValue = this.config.default;
            }
        } else {
            this.sValue = this.config.default;
        }
    }


    checkedRadio(e: any, value: any) {
        if (this.config.componentType === 2) { // 聚合数量显示
            this.changeEvent.emit({key: this.config.attribute, value: value});

        } else {
            if (typeof this.config.parentKey[0] === 'object') { // 多绑定

                for (const v of this.config.parentKey) {
                    if (v.length === 1) {
                        this.style[v[0]] = value;
                    } else if (v.length === 2) {
                        this.style[v[0]][v[1]] = value;
                    } else {
                        this.style[v[0]][v[1]][v[2]] = value;
                    }
                }
            } else { // 单绑定
                if (this.config.parentKey.length === 1) {
                    this.style[this.config.parentKey[0]] = value;
                } else if (this.config.parentKey.length === 2) {
                    if (this.style[this.config.parentKey[0]]) {
                        this.style[this.config.parentKey[0]][this.config.parentKey[1]] = value;
                    } else {
                        this.style[this.config.parentKey[0]] = {};
                        this.style[this.config.parentKey[0]][this.config.parentKey[1]] = value;
                    }

                } else {
                    if (this.style[this.config.parentKey[0]]) {
                        if (this.style[this.config.parentKey[0]][this.config.parentKey[1]]) {
                            this.style[this.config.parentKey[0]][this.config.parentKey[1]][this.config.parentKey[2]] = value;
                        } else {
                            this.style[this.config.parentKey[0]][this.config.parentKey[1]] = {};
                            this.style[this.config.parentKey[0]][this.config.parentKey[1]][this.config.parentKey[2]] = value;
                        }
                    } else {
                        this.style[this.config.parentKey[0]] = {};
                        this.style[this.config.parentKey[0]][this.config.parentKey[1]] = {};
                        this.style[this.config.parentKey[0]][this.config.parentKey[1]][this.config.parentKey[2]] = value;
                    }

                }
            }
            // 赋回显值
            if (this.style.metadata.statistics) {
                this.style.metadata.statistics[this.config.attribute] = value;
            } else {
                this.style.metadata.statistics = {};
                this.style.metadata.statistics[this.config.attribute] = value;
            }
          // todo
          // 每次点击也出发事件
          // this.changeEvent.emit({key: this.config.attribute, value: value});
        }
    }

}
