import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'plotMapPipe'
})
export class PlotMapPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (args === 'name') {

      if (value === '') {
        return '';
      } else {
        return value;
      }

    }

    return null;
  }

}
