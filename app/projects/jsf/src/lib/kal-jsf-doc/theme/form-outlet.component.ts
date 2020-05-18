import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  SkipSelf,
  ViewChild
}                                                                from '@angular/core';
import { JsfBuilder, JsfLayoutPreferencesInterface, LayoutMode } from '@kalmia/jsf-common-es2015';
import { JsfScrollService }                                      from '../services/scroll.service';
import { BuilderDeveloperToolsInterface }                        from '../builder-developer-tools.interface';
import * as OverlayScrollbars                                    from 'overlayscrollbars';
import { OverlayScrollbarsComponent }                            from 'overlayscrollbars-ngx';

@Component({
  selector       : 'jsf-form-outlet',
  template       : `
      <!-- Delay loading of form until we receive the theme preferences -->
      <ng-container *ngIf="preferences">
          <ng-container *ngIf="innerScrollEnabled; else formTemplate">
              <overlay-scrollbars #scrollElement
                                  [options]="scrollOptions"
                                  class="jsf-form-inner-scroll-element"
                                  [class.scroll]="builder.innerScrollEnabled"
                                  [class.nativeframe]="isInsideNativeFrame()">
                  <ng-container *ngTemplateOutlet="formTemplate"></ng-container>
              </overlay-scrollbars>
          </ng-container>

          <ng-template #formTemplate>
              <form *ngIf="builder && builder.layoutBuilder" #jsfForm="ngForm">

                  <!-- Prevent implicit submission of the form -->
                  <button type="submit" disabled (click)="false;" aria-hidden="true" [hidden]="true"></button>

                  <!-- JSF form -->
                  <jsf-layout-router
                          [developerTools]="developerTools"
                          [layoutBuilder]="builder.layoutBuilder"></jsf-layout-router>
              </form>
          </ng-template>
      </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls      : ['./form-outlet.component.scss']
})
export class FormOutletComponent implements OnInit, AfterViewInit {

  @Input()
  builder: JsfBuilder;

  @Input()
  preferences: JsfLayoutPreferencesInterface;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @ViewChild('scrollElement', { read: OverlayScrollbarsComponent })
  formScrollable: OverlayScrollbarsComponent;

  public scrollOptions: OverlayScrollbars.Options;

  constructor(private scrollService: JsfScrollService,
              private cdRef: ChangeDetectorRef,
              @Optional() @SkipSelf() private parentScrollComponent: OverlayScrollbarsComponent) {
  }

  public get innerScrollEnabled() {
    return this.builder.innerScrollEnabled && !this.isInsideNativeFrame();
  }

  public isInsideNativeFrame() {
    return this.builder.hasMode(LayoutMode.Embedded);
  }

  ngOnInit() {
    // Set the theme preferences
    this.builder.layoutBuilder.preferences = this.preferences;
  }

  ngAfterViewInit() {
    // Set scroll options.
    this.scrollOptions = {
      overflowBehavior: {
        x: 'hidden',
        y: this.innerScrollEnabled ? 'scroll' : 'hidden'
      },
      resize          : 'none',
      paddingAbsolute : true
    };

    // Register the scroll element
    this.scrollService.registerFormScrollableElement(this.formScrollable || this.parentScrollComponent);

    // Trigger change detection
    this.cdRef.detectChanges();
  }
}
