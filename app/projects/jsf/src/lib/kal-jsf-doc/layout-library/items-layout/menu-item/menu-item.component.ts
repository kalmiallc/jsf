import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }            from '@angular/core';
import { AbstractItemsLayoutComponent }                                                    from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutMenuItem, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                                                  from '@kalmia/jsf-app/lib/kal-jsf-doc/builder-developer-tools.interface';
import { takeUntil }                                                                       from 'rxjs/operators';


@Component({
  selector       : 'jsf-layout-menu-item',
  template       : `
      <!-- Items -->
      <ng-container *ngIf="hasItems">
          <mat-menu #menuItem="matMenu">
              <jsf-layout-router *ngFor="let item of layoutBuilder.items"
                                 [layoutBuilder]="item"
                                 [developerTools]="developerTools"
                                 [ngClass]="getLayoutItemClass(item)"
                                 [ngStyle]="getLayoutItemStyle(item)">
              </jsf-layout-router>
          </mat-menu>

          <button mat-menu-item
                  [matMenuTriggerFor]="menuItem"
                  [ngClass]="getLayoutInnerClass()"
                  [ngStyle]="getLayoutInnerStyle()"
                  (click)="handleLayoutClick($event)">
              <mat-icon *ngIf="icon" class="jsf-layout-menu-item-icon">{{ icon }}</mat-icon>
              <span class="jsf-layout-menu-item-title">{{ title }}</span>
              <span class="jsf-layout-menu-item-description">{{ description }}</span>
          </button>
      </ng-container>


      <!-- No items -->
      <ng-container *ngIf="!hasItems">
          <button mat-menu-item
                  [ngClass]="getLayoutInnerClass()"
                  [ngStyle]="getLayoutInnerStyle()"
                  (click)="handleLayoutClick($event)">
              <mat-icon *ngIf="icon" class="jsf-layout-menu-item-icon">{{ icon }}</mat-icon>
              <span class="jsf-layout-menu-item-title">{{ title }}</span>
              <span class="jsf-layout-menu-item-description">{{ description }}</span>
          </button>
      </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutMenuItemComponent extends AbstractItemsLayoutComponent<JsfLayoutMenuItem> implements OnInit {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;


  get hasItems(): boolean {
    return this.layoutBuilder.items && this.layoutBuilder.items.length > 0;
  }

  get icon(): string {
    return this.layout.icon;
  }

  get title(): string {
    const templateData = this.getTitleTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.title));
      return template(templateData);
    }

    return this.i18n(this.layout.title);
  }

  get description(): string {
    const templateData = this.getDescriptionTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.description));
      return template(templateData);
    }

    return this.i18n(this.layout.description);
  }

  get descriptionDependencies(): string[] {
    return this.layout.descriptionTemplateData ? this.layout.descriptionTemplateData.dependencies || [] : [];
  }

  get titleDependencies(): string[] {
    return this.layout.titleTemplateData ? this.layout.titleTemplateData.dependencies || [] : [];
  }

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    if (this.layout.descriptionTemplateData) {
      if (this.descriptionDependencies.length) {
        for (const dependency of this.descriptionDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.cdRef.detectChanges();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'menu-item' [${ this.layoutBuilder.id }] uses descriptionTemplateData but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.cdRef.detectChanges();
            }
          });
      }
    }

    if (this.layout.titleTemplateData) {
      if (this.titleDependencies.length) {
        for (const dependency of this.titleDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.cdRef.detectChanges();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'menu-item' [${ this.layoutBuilder.id }] uses titleTemplateData but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.cdRef.detectChanges();
            }
          });
      }
    }
  }

  getTitleTemplateData(): any {
    if (this.layout.titleTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.titleTemplateData as any).$evalTranspiled || this.layout.titleTemplateData.$eval, ctx);

    }
  }

  getDescriptionTemplateData(): any {
    if (this.layout.descriptionTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.descriptionTemplateData as any).$evalTranspiled || this.layout.descriptionTemplateData.$eval, ctx);

    }
  }

  async dispatchClickEvents(event: any) {
    await this.handleLayoutClick(event);
  }

}
