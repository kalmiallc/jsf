import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractItemsLayoutComponent }                      from '../../../abstract/items-layout.component';
import {
  isItemsLayout,
  JsfAbstractLayout,
  JsfAbstractLayoutBuilder,
  JsfItemsLayoutBuilder,
  JsfLayoutCol,
  JsfLayoutRow
}                                                            from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-row',
  template       : `
    <div class="jsf-layout-row"
         [id]="id"
         [ngClass]="getLayoutClass()"
         [ngStyle]="getLayoutStyle()"
         (click)="handleLayoutClick($event)">
      <jsf-layout-router *ngFor="let item of items"
                         [layoutBuilder]="item"
                         [developerTools]="developerTools"
                         [ngClass]="getLayoutItemClass(item)"
                         [ngStyle]="getLayoutItemStyle(item)">
      </jsf-layout-router>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutRowComponent extends AbstractItemsLayoutComponent<JsfLayoutRow> implements OnInit {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private readonly breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];

  get items() {
    return this.layoutBuilder.items;
  }

  ngOnInit() {
    if (this.layoutBuilder.rootBuilder.warnings) {
      for (const item of this.items) {
        if (item.type !== 'col') {
          console.error(`Layout 'row' [${ this.layoutBuilder.id }] contains an item of type '${ item.type }'.`,
            `This layout should only contain 'col' layout items as direct descendants.`);
        }
      }
    }
  }

  getLayoutClass(layout: JsfAbstractLayout = this.layout): string {
    const classNames = ['row'];

    // Gutters
    if (this.layout.gutters !== undefined && this.layout.gutters === false) {
      classNames.push('no-gutters');
    }

    // Horizontal alignment
    if (this.layout.horizontalAlign) {
      classNames.push(`justify-content-${ this.layout.horizontalAlign }`);
    }

    // Vertical alignment
    if (this.layout.verticalAlign) {
      classNames.push(`align-items-${ this.layout.verticalAlign }`);
    }

    // Add inner class
    if (this.htmlClass) {
      classNames.push(this.htmlClass);
    }

    return classNames.join(' ');
  }


  getLayoutItemClass(item: JsfAbstractLayoutBuilder<JsfAbstractLayout>): string {
    const classNames = [];

    if (isColLayout(item.layout)) {
      // Size
      let anySizeSpecified = false;
      for (const breakpoint of this.breakpoints) {
        const value = item.layout[breakpoint];
        if (value) {
          switch (value) {
            case 'auto':
              classNames.push(`col${ infix(breakpoint) } d${ infix(breakpoint) }-initial`);
              anySizeSpecified = true;
              break;
            case 'content':
              classNames.push(`col${ infix(breakpoint) }-auto d${ infix(breakpoint) }-initial`);
              anySizeSpecified = true;
              break;
            case 'none':
              classNames.push(`d${ infix(breakpoint) }-none`);
              anySizeSpecified = true;
              break;
            default:
              classNames.push(`col${ infix(breakpoint) }-${ value } d${ infix(breakpoint) }-initial`);
              anySizeSpecified = true;
              break;
          }
        }
      }
      // Add a default `col` class is no size was specified on the layout
      if (!anySizeSpecified) {
        classNames.push(`col`);
      }

      // Offset
      if (item.layout.offset) {
        for (const breakpoint of this.breakpoints) {
          const value = item.layout.offset[breakpoint];
          if (value !== undefined) {
            classNames.push(`offset${ infix(breakpoint) }-${ value }`);
          }
        }
      }

      // Order
      if (item.layout.order) {
        switch (item.layout.order) {
          case 'first':
            classNames.push(`order-first`);
            break;
          case 'last':
            classNames.push(`order-last`);
            break;
          default:
            for (const breakpoint of this.breakpoints) {
              const value = item.layout.order[breakpoint];
              if (value) {
                classNames.push(`order${ infix(breakpoint) }-${ value }`);
              }
            }
            break;
        }
      }

      // Vertical alignment
      if (item.layout.verticalAlign) {
        classNames.push(`align-self-${ item.layout.verticalAlign }`);
      }
    }

    // Add outer classes
    classNames.push(super.getLayoutClass(item.layout));

    return classNames.join(' ');
  }
}

function isColLayout(layout: JsfAbstractLayout): layout is JsfLayoutCol {
  return isItemsLayout(layout) && layout.type === 'col';
}

function infix(breakpoint: string): string {
  return breakpoint === 'xs' ? '' : `-${ breakpoint }`;
}
