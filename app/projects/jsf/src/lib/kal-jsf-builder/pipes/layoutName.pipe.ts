import { Pipe, PipeTransform } from '@angular/core';

/*
 * Checks if layout has layout
*/
@Pipe({ name: 'layoutName' })
export class LayoutNamePipe implements PipeTransform {
  transform(node) {
    return node.layout ? node.layout.type || node.layout.key : node.type || node.key;
  }
}
