import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {UiSettingModalComponent} from '../setting-pick/ui-setting-modal.module';
import {SmxModal} from '../../../smx-component/smx-modal/directive/smx-modal';


@Component({
  selector: 'ui-setting-button',
  templateUrl: './setting-button.component.html',
  styleUrls: ['./setting-button.component.scss']
})
export class SettingButtonComponent implements OnInit, OnChanges {
  @Input() smxUiItem: any;
  @Input() type: any;
  @Output() onChange = new EventEmitter();

  constructor(private smxModalService: SmxModal) {
  }

  ngOnInit() {
  }

  ngOnChanges(): void {
  }

  /**
   * 打开UI设置面板
   */
  openUiPanel(item: any) {
    const outModal = this.smxModalService.open(UiSettingModalComponent, {centered: true, backdrop: 'static', enterKeyId: 'smx-uiModal'});

    let config = null;
    if (item.config && item.contnet) {

    }
    outModal.componentInstance.smxConfig = {title: 'UI类型设置'};
    outModal.componentInstance.smxData = {
      type: item.type,
      component_id: item.component_data_type_id,
      config: item.contnet || item.config
    };
    outModal.result.then(
      (result) => {
        item.type = result.type;
        item.component_data_type_id = result.component_id;
        item.config = result.config;
        this.onChange.emit(item);
      },
      (reason) => {
        console.log(reason);
      });
  }
}
