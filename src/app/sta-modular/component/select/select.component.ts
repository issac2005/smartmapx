import {Component, OnInit, Output, Input, OnDestroy, EventEmitter} from '@angular/core';
import {AppService} from '../../../s-service/app.service';
import {HttpService} from '../../../s-service/http.service';


@Component({
    selector: 'sta-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit, OnDestroy {
    @Output() changeEvent = new EventEmitter();
    @Input() config: any;
    @Input() style: any;


    Array: any[];
    value: any;

    constructor(public appService: AppService, public httpService: HttpService) {
    }

    ngOnInit() {
        this.Array = this.config.value;

        // 回显
        if (this.style.metadata.statistics && this.style.metadata.statistics[this.config.attribute]) {
            this.value = this.style.metadata.statistics[this.config.attribute];
        } else {
            this.value = this.config.default;
        }
    }


    ngOnDestroy() {
    }


    checkedItem(item: any) {
        this.changeEvent.emit({key: this.config.attribute, value: item});


        // 赋回显值
        if (this.style.metadata.statistics) {
            this.style.metadata.statistics[this.config.attribute] = item;
        } else {
            this.style.metadata.statistics = {};
            this.style.metadata.statistics[this.config.attribute] = item;

        }
    }
}
