import {Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2} from '@angular/core';
import {AppService} from '../../s-service/app.service';
import {HttpService} from '../../s-service/http.service';
import {SmxModal} from '../../smx-component/smx-modal/smx-modal.module';
import {PopueComponent} from '../../data/modal/data-popue.component';
import {ToastConfig, ToastType, ToastService} from '../../smx-unit/smx-unit.module';
import {LocalStorage} from '../../s-service/local.storage';
@Component({
  selector: 'app-prop-panel',
  templateUrl: './prop-panel.component.html',
  styleUrls: ['./prop-panel.component.scss']
})
export class PropPanelComponent implements OnInit, AfterViewInit {
  @Input() plotInfo?: any;
  @Input() plotId: any;
  @Input() updteKeyId: any;
  @Input() interFaceList: any;
  @Input() plotInfo_keys: any;
  @Output() changeWords = new EventEmitter();

  description = '这是描述';
  showTitle = false;
  showDesc = false;
  showAttr = [false];
  showName = [false];
  uploadMax = 10;
  showImg = false;
  isVisible = false;
  viewImgUrl = '';
  closeUpload = true;
  showIconNext = true;
  showIconPrev = false;
  interval: any;
  scrollDistance = 0;
  imgWidth = 75;
  visitInfo: any;
  plotInfo_keys_name: any;
  plotInfo_keys_value: any;
  info: any;


  constructor(
    private modalService: SmxModal,
    private renderer2: Renderer2,
    private elementRef: ElementRef,
    private appService: AppService,
    private httpService: HttpService,
    private toastService: ToastService,
    private ls: LocalStorage
  ) {

  }

  ngOnInit() {
    this.visitInfo = this.ls.getObject('visitInfo');
    this.info = this.ls.getObject('visitInfo');
  }

  ngAfterViewInit() {

  }

  // 标题输入框内容发生变化
  titleChange(item: any) {
    if (item.name === '') {
      item.name = '标绘信息名称';
    }
    this.changePlotInformation();
  }

  // 文本框内容变化
  descChange(item: any) {
    if (item.description === '') {
      item.description = '标绘信息描述';
    }
    this.changePlotInformation();
  }

  // 上传图片
  receiveUploadEnd(data: any) {
    if (this.plotInfo && this.plotInfo.content.img && this.plotInfo.content.img.length >= this.uploadMax) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '最多上传10张图片', 2000);
      this.toastService.toast(toastCfg);
    } else {
    const name = data.name;
    this.httpService.makeFileRequest('/upload/1.0.0/mapplot/uploadFile', {forceDelete: true}, [data.file[0]])
        .subscribe(
          (data: any) => {
            if (data.status > 0) {
              const url = '/uploadfile/' + data.data.upload_file.uploads;
              const img = this.plotInfo.content.img;
              if (img) {
                this.plotInfo.content.img.push({
                  name : name,
                  url : url
                });
              } else {
                this.plotInfo.content.img = [{
                  name : name,
                  url : url
                }];
              }
              this.moveRight(this.plotInfo.content.img.length * this.imgWidth);
              this.changePlotInformation();
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
              this.toastService.toast(toastCfg);
            }
          },
          error => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
            this.toastService.toast(toastCfg);
          }
        );
    }
  }

  // 上传图片-删除图片
  deleteImg(data: any, index: any) {
    const postData = {
      pic_url : data.url,
      type : 1
    };
    postData[this.updteKeyId] = this.plotInfo[this.updteKeyId];
    this.httpService.getData(postData, true, 'mapplot', 'deleteFile', '')
      .subscribe(
        (data: any) => {
          if ((data as any).data.result <= 0) {
            const toast = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toast);
            return;
          }
          const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除图片成功!', 2000);
          this.toastService.toast(toastCfg);
          this.plotInfo.content.img.splice(index, 1);
          this.changePlotInformation();
          return;
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

  // 上传图片-查看上传图片
  viewImg(imgFile: string) {
    this.viewImgUrl = imgFile;
    this.isVisible = true;
  }


  // 上传图片-关闭图片弹框
  closeView(): void {
    this.viewImgUrl = '';
    this.isVisible = false;
  }

  // 上传图片- 向右滑动事件
  moveRight(itemDistance: any) {
    if (!this.interval) {
      const e = document.getElementById('img-conatiner');
      const imgWrapWidth = e.clientWidth;


      let totalMove;
      totalMove = this.plotInfo.content.img.length * this.imgWidth - imgWrapWidth;
      this.interval = setInterval(() => {
        if (e.scrollLeft < totalMove && e.scrollLeft < (this.scrollDistance + itemDistance)) {
          e.scrollLeft = e.scrollLeft + 6;
        } else {
          if (e.scrollLeft === totalMove) {
            this.showIconNext = false;
          }
          if (!this.showIconPrev) {
            this.showIconPrev = true;
          }
          clearInterval(this.interval);
          this.interval = null;
        }
      }, 20);
      this.scrollDistance = e.scrollLeft;
    }
  }

  moveLeft() {
    if (!this.interval) {
      const e = document.getElementById('img-conatiner');
      this.interval = setInterval(() => {
        if (e.scrollLeft > 0 && e.scrollLeft > this.scrollDistance - this.imgWidth) {
          e.scrollLeft = e.scrollLeft - 6;
        } else {
          if (e.scrollLeft === 0) {
            this.showIconPrev = false;
          }
          if (!this.showIconNext) {
            this.showIconNext = true;
          }
          clearInterval(this.interval);
          this.interval = null;
        }
      }, 30);
      this.scrollDistance = e.scrollLeft;
    }
  }

  //保留属性名称变化之前的名称
  nameChangename(index: any, event: any) {
    this.plotInfo_keys_name = event.target.value;
  }
  selectname(index: any, event: any){
    this.plotInfo_keys_name = event.target.value;
  }

  // 属性名称内容变化--Ljy
  nameChange(index: any, event: any) {
    if (event.target.value === '') {
      event.target.value = this.plotInfo_keys_name;
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '"属性名称"不能为空', 2000);
      this.toastService.toast(toastCfg);
      return;
    }else if (this.plotInfo_keys_name === event.target.value) {
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '"属性名称"未做修改', 2000);
      this.toastService.toast(toastCfg);
      return;
    }else if (this.plotInfo.content.hasOwnProperty(event.target.value)) {
      const value = event.target.value;
      event.target.value = this.plotInfo_keys_name;
      this.plotInfo_keys[index].name = event.target.value;
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '属性名称' + value + '重复', 2000);
      this.toastService.toast(toastCfg);
      return;
    }else{
      // const value = this.plotInfo.content[this.plotInfo_keys[index].value];
      const value = this.plotInfo_keys[index].value;
      delete this.plotInfo.content[this.plotInfo_keys_name];
      this.plotInfo.content[event.target.value] = value;
      this.plotInfo_keys[index] = {name: event.target.value, value: value };
      let a = "";

      // this.plotInfo.content.keys = this.plotInfo_keys);
      this.plotInfo_keys.forEach((v: any) => {
        a = a + ',' + v.name;
      });
      this.plotInfo.content.keys = a.substr(1);
    }
    // this.plotInfo.content.customInfo[index].name = event.target.value;
    this.changePlotInformation();
    this.showName[index] = false;
  }

  //保留属性值变化之前的值
  attrChangeattr(index: any, event: any) {
    this.plotInfo_keys_value = event.target.value;
  }
  selectvalue(index: any, event: any) {
    this.plotInfo_keys_value = event.target.value;
  }

  // 属性值内容变化--Ljy
  attrChange(index: any, event: any) {
    if (event.target.value === '') {
      event.target.value = this.plotInfo_keys_value;
      const toastCfg = new ToastConfig(ToastType.WARNING, '', '"属性值"不能为空', 2000);
      this.toastService.toast(toastCfg);
      return;
    }
    this.plotInfo.content[this.plotInfo_keys[index].name] = event.target.value;
    this.plotInfo_keys[index].value = event.target.value;
    // this.plotInfo.content.customInfo[index].value = event.target.value;
    this.changePlotInformation();
  }

  // 删除某个添加的属性--Ljy
  clearAttr(index: any) {
    delete this.plotInfo.content[this.plotInfo_keys[index].name];
    this.plotInfo_keys.splice(index, 1);
    let a = '';
    this.plotInfo_keys.forEach((v: any) => {
      a = a + ',' + v.name;
    });
    this.plotInfo.content.keys = a.substr(1);
    this.changePlotInformation();
  }


  // 添加属性信息--按钮--Ljy
  addAttribute() {
    const addA = this.plotInfo.content.keys;
    if (addA) {
      if (this.plotInfo.content.hasOwnProperty('属性名称')) {
        const toastCfg = new ToastConfig(ToastType.WARNING, '', '请修改"属性名称"后再添加属性!', 2000);
        this.toastService.toast(toastCfg);
        // alert('失败！');
        return;
      } else {
        this.plotInfo.content.keys = addA + ',属性名称';
        this.plotInfo.content['属性名称'] = '属性值';
        this.plotInfo_keys.push({name: '属性名称', value: '属性值'});
      }
    } else {
      this.plotInfo.content.keys = '属性名称';
      this.plotInfo.content['属性名称'] = '属性值';
      this.plotInfo_keys = [{name: '属性名称', value: '属性值'}];
    }
    this.changePlotInformation();
  }


  // 获取geojson--Ljy
  getGeojson() {
    const key_config = {
      create: {
        title: '获取geojson',
        type: 0,
        url: '89ae7869-4904-4c78-a80e-69815e924de3',
        modal: {
          type: 21,
          config: {
            title: '获取geojson',
            independence: 1
          }
        }
      }
    };
    const geoJson = {
      geometry: this.plotInfo.st_asgeojson,
      properties: {
        content: this.plotInfo.content,
        description: this.plotInfo.description,
        geom: 'geom',
        mode_type: this.plotInfo.mode_type,
        name:  this.plotInfo.name,
        style:  this.plotInfo.style,
        user_id :  this.plotInfo.user_id
      },
      type: 'Feature'
    };
    geoJson[this.updteKeyId] = this.plotInfo[this.updteKeyId];
    const modalRef = this.modalService.open(PopueComponent, {backdrop: 'static', centered: true, enterKeyId: 'smx-popule'});
    modalRef.componentInstance.type = 21;
    modalRef.componentInstance.keyConfig = key_config.create.modal.config;
    modalRef.componentInstance.modalData = JSON.stringify(geoJson, null, 1);

  }

  // 修改标绘信息（修改标绘名，修改标绘描述，添加，修改，删除属性信息）--Ljy
  changePlotInformation() {
    const postData = {
      name: this.plotInfo.name,
      description: this.plotInfo.description,
      content: this.plotInfo.content,
      geom: this.plotInfo.st_asgeojson,
      style: this.plotInfo.style,
      mode_type: this.plotInfo.mode_type
    };
    postData[this.updteKeyId] = this.plotInfo[this.updteKeyId];
    this.httpService.getData(postData, true, 'execute', this.interFaceList.update, '')
      .subscribe(
        (data: any) => {
          if (data.status > 0) {
            this.changeWords.emit(this.plotInfo.description);
            // const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '修改成功！', 2000);
            // this.toastService.toast(toastCfg);
          } else {
            const toastCfg = new ToastConfig(ToastType.ERROR, '', '操作失败，请稍后再试!', 2000);
            this.toastService.toast(toastCfg);
          }
        },
        error => {
          const toastCfg = new ToastConfig(ToastType.ERROR, '', '发送请求失败，请检查网络', 2000);
          this.toastService.toast(toastCfg);
        });
  }

}
