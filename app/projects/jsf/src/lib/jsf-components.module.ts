import { NgModule }                                   from '@angular/core';
import { CommonModule }                               from '@angular/common';
import { FormsModule }                                from '@angular/forms';
import { SharedModule }                               from './kal-jsf-doc/shared/shared.module';
import { RouterComponent }                            from './kal-jsf-doc/routers/router.component';
import { LayoutRouterComponent }                      from './kal-jsf-doc/routers/layout-router.component';
import { PropRouterComponent }                        from './kal-jsf-doc/routers/prop-router.component';
import { PropStringComponent }                        from './kal-jsf-doc/prop-library/string.component';
import { PropArrayComponent, PropArrayItemComponent } from './kal-jsf-doc/prop-library/array.component';
import { PropNumberComponent }                        from './kal-jsf-doc/prop-library/number.component';
import { PropBinaryComponent }                        from './kal-jsf-doc/prop-library/binary.component';
import { PropBooleanComponent }                       from './kal-jsf-doc/prop-library/boolean.component';
import { PropDateComponent }                          from './kal-jsf-doc/prop-library/date.component';
import { PropIdComponent }                            from './kal-jsf-doc/prop-library/id.component';
import { PropIntegerComponent }                       from './kal-jsf-doc/prop-library/integer.component';
import { PropObjectComponent }                        from './kal-jsf-doc/prop-library/object.component';
import { PropRefComponent }                           from './kal-jsf-doc/prop-library/ref.component';
import { LayoutDivComponent }                         from './kal-jsf-doc/layout-library/items-layout/div/div.component';
import { LayoutRowComponent }                         from './kal-jsf-doc/layout-library/items-layout/row/row.component';
import { LayoutColComponent }                         from './kal-jsf-doc/layout-library/items-layout/col/col.component';
import { LayoutTabSetComponent }                      from './kal-jsf-doc/layout-library/items-layout/tabset/tabset.component';
import { LayoutHeadingComponent }                     from './kal-jsf-doc/layout-library/special-layout/heading/heading.component';
import { LayoutOrderSummaryComponent }                from './kal-jsf-doc/layout-library/items-layout/order-summary/order-summary.component';
import { LayoutStepperComponent }                     from './kal-jsf-doc/layout-library/items-layout/stepper/stepper.component';
import { LayoutOrderSummaryOverlayComponent }         from './kal-jsf-doc/layout-library/items-layout/order-summary-overlay/order-summary-overlay.component';
import { LayoutOrderSummaryScrollContainerComponent } from './kal-jsf-doc/layout-library/items-layout/order-summary-scroll-container/order-summary-scroll-container.component';
import { LayoutOrderSummaryLineItemComponent }        from './kal-jsf-doc/layout-library/special-layout/order-summary-line-item/order-summary-line-item.component';
import { LayoutSpanComponent }                        from './kal-jsf-doc/layout-library/special-layout/span/span.component';
import { LayoutParagraphComponent }                   from './kal-jsf-doc/layout-library/special-layout/paragraph/paragraph.component';
import { LayoutButtonComponent }                      from './kal-jsf-doc/layout-library/special-layout/button/button.component';
import { LayoutStepperNextComponent }                 from './kal-jsf-doc/layout-library/special-layout/stepper-next/stepper-next.component';
import { LayoutStepperPreviousComponent }             from './kal-jsf-doc/layout-library/special-layout/stepper-previous/stepper-previous.component';
import { LayoutImageComponent }                       from './kal-jsf-doc/layout-library/special-layout/image/image.component';
import { LayoutHrComponent }                          from './kal-jsf-doc/layout-library/special-layout/hr/hr.component';
import { JsfCustomComponentsModule }                  from './kal-jsf-doc/layout-library/custom-components/custom-components.module';
import { LayoutOrderSummaryStaticContainerComponent } from './kal-jsf-doc/layout-library/items-layout/order-summary-static-container/order-summary-static-container.component';
import { LayoutD3Component }                          from './kal-jsf-doc/layout-library/special-layout/d3/d3.component';
import { PropTableComponent }                         from './kal-jsf-doc/prop-library/table.component';
import { LayoutHtmlComponent }                        from './kal-jsf-doc/layout-library/special-layout/html/html.component';
import { JsfDirectivesModule }                        from './kal-jsf-doc/directives/jsf-directives.module';
import { LayoutArrayItemAddComponent }                from './kal-jsf-doc/layout-library/special-layout/array-item-add/array-item-add.component';
import { LayoutArrayItemRemoveComponent }             from './kal-jsf-doc/layout-library/special-layout/array-item-remove/array-item-remove.component';
import { LayoutIconComponent }                        from './kal-jsf-doc/layout-library/special-layout/icon/icon.component';
import { LayoutRender2DComponent }                    from './kal-jsf-doc/layout-library/special-layout/render-2d/render-2d.component';
import { PropExpansionPanelComponent }                from './kal-jsf-doc/prop-library/expansion-panel.component';
import { LayoutExpansionPanelHeaderComponent }        from './kal-jsf-doc/layout-library/items-layout/expansion-panel-header/expansion-panel-header.component';
import { LayoutExpansionPanelContentComponent }       from './kal-jsf-doc/layout-library/items-layout/expansion-panel-content/expansion-panel-content.component';
import { LayoutMenuComponent }                        from './kal-jsf-doc/layout-library/items-layout/menu/menu.component';
import { LayoutMenuItemComponent }                    from './kal-jsf-doc/layout-library/items-layout/menu-item/menu-item.component';
import { LayoutAnchorComponent }                      from './kal-jsf-doc/layout-library/special-layout/anchor/anchor.component';
import { LayoutAppPageTitleComponent }                from './kal-jsf-doc/layout-library/special-layout/app-page-title/app-page-title.component';
import { LayoutAppBreadcrumbsComponent }              from './kal-jsf-doc/layout-library/special-layout/app-breadcrumbs/app-breadcrumbs.component';
import { LayoutListComponent }                        from './kal-jsf-doc/layout-library/items-layout/list/list.component';
import { LayoutDialogContentComponent }               from './kal-jsf-doc/layout-library/items-layout/dialog-content/dialog-content.component';
import { LayoutDialogActionsComponent }               from './kal-jsf-doc/layout-library/items-layout/dialog-actions/dialog-actions.component';
import { LayoutSupComponent }                         from './kal-jsf-doc/layout-library/special-layout/sup/sup.component';
import { LayoutSubComponent }                         from './kal-jsf-doc/layout-library/special-layout/sub/sub.component';
import { LayoutDrawerComponent }                      from './kal-jsf-doc/layout-library/items-layout/drawer/drawer.component';
import { LayoutDrawerHeaderComponent }                from './kal-jsf-doc/layout-library/items-layout/drawer-header/drawer-header.component';
import { LayoutDrawerContentComponent }               from './kal-jsf-doc/layout-library/items-layout/drawer-content/drawer-content.component';
import { LayoutProgressBarComponent }                 from './kal-jsf-doc/layout-library/special-layout/progress-bar/progress-bar.component';
import { LayoutProgressTrackerComponent }             from './kal-jsf-doc/layout-library/items-layout/progress-tracker/progress-tracker.component';
import { LayoutProgressTrackerStepComponent }         from './kal-jsf-doc/layout-library/special-layout/progress-tracker-step/progress-tracker-step.component';
import { LayoutPoweredByComponent }                   from './kal-jsf-doc/layout-library/special-layout/powered-by/powered-by.component';
import { LayoutChartJSComponent }                     from './kal-jsf-doc/layout-library/special-layout/chartjs/chartjs.component';
import { LayoutCustomComponentComponent }             from './kal-jsf-doc/layout-library/special-layout/custom-component/custom-component.component';
import { LayoutBadgeComponent }                       from './kal-jsf-doc/layout-library/special-layout/badge/badge.component';
import { OverlayscrollbarsModule }                    from 'overlayscrollbars-ngx';

@NgModule({
  imports     : [
    CommonModule,
    SharedModule,
    FormsModule,
    JsfCustomComponentsModule,
    JsfDirectivesModule
  ],
  declarations: [
    // Routers
    RouterComponent,
    LayoutRouterComponent,
    PropRouterComponent,

    // Prop components
    PropStringComponent,
    PropNumberComponent,
    PropArrayComponent,
    PropArrayItemComponent,
    PropBinaryComponent,
    PropBooleanComponent,
    PropDateComponent,
    PropIdComponent,
    PropIntegerComponent,
    PropObjectComponent,
    PropRefComponent,
    PropTableComponent,
    PropExpansionPanelComponent,

    // Layout components
    LayoutDivComponent,
    LayoutRowComponent,
    LayoutColComponent,
    LayoutTabSetComponent,
    LayoutStepperComponent,
    LayoutOrderSummaryComponent,
    LayoutOrderSummaryOverlayComponent,
    LayoutOrderSummaryScrollContainerComponent,
    LayoutOrderSummaryStaticContainerComponent,
    LayoutOrderSummaryLineItemComponent,
    LayoutHeadingComponent,
    LayoutSpanComponent,
    LayoutSupComponent,
    LayoutSubComponent,
    LayoutAnchorComponent,
    LayoutParagraphComponent,
    LayoutButtonComponent,
    LayoutBadgeComponent,
    LayoutStepperNextComponent,
    LayoutStepperPreviousComponent,
    LayoutArrayItemAddComponent,
    LayoutArrayItemRemoveComponent,
    LayoutImageComponent,
    LayoutIconComponent,
    LayoutProgressBarComponent,
    LayoutHrComponent,
    LayoutD3Component,
    LayoutChartJSComponent,
    LayoutCustomComponentComponent,
    LayoutRender2DComponent,
    LayoutHtmlComponent,
    LayoutExpansionPanelHeaderComponent,
    LayoutExpansionPanelContentComponent,
    LayoutDrawerComponent,
    LayoutDrawerHeaderComponent,
    LayoutDrawerContentComponent,
    LayoutMenuComponent,
    LayoutMenuItemComponent,
    LayoutListComponent,
    LayoutDialogContentComponent,
    LayoutDialogActionsComponent,
    LayoutAppPageTitleComponent,
    LayoutAppBreadcrumbsComponent,
    LayoutPoweredByComponent,
    LayoutProgressTrackerComponent,
    LayoutProgressTrackerStepComponent
  ],
  exports     : [
    // Scrollbar module
    OverlayscrollbarsModule,

    // Custom components
    JsfCustomComponentsModule,

    // Directives
    JsfDirectivesModule,

    // Routers
    RouterComponent,
    LayoutRouterComponent,
    PropRouterComponent,

    // Prop components
    PropStringComponent,
    PropNumberComponent,
    PropArrayComponent,
    PropArrayItemComponent,
    PropBinaryComponent,
    PropBooleanComponent,
    PropDateComponent,
    PropIdComponent,
    PropIntegerComponent,
    PropObjectComponent,
    PropRefComponent,
    PropTableComponent,
    PropExpansionPanelComponent,

    // Layout components
    LayoutDivComponent,
    LayoutRowComponent,
    LayoutColComponent,
    LayoutTabSetComponent,
    LayoutStepperComponent,
    LayoutOrderSummaryComponent,
    LayoutOrderSummaryOverlayComponent,
    LayoutOrderSummaryScrollContainerComponent,
    LayoutOrderSummaryStaticContainerComponent,
    LayoutOrderSummaryLineItemComponent,
    LayoutHeadingComponent,
    LayoutSpanComponent,
    LayoutSupComponent,
    LayoutSubComponent,
    LayoutAnchorComponent,
    LayoutButtonComponent,
    LayoutBadgeComponent,
    LayoutStepperNextComponent,
    LayoutStepperPreviousComponent,
    LayoutArrayItemAddComponent,
    LayoutArrayItemRemoveComponent,
    LayoutImageComponent,
    LayoutIconComponent,
    LayoutProgressBarComponent,
    LayoutHrComponent,
    LayoutD3Component,
    LayoutChartJSComponent,
    LayoutCustomComponentComponent,
    LayoutRender2DComponent,
    LayoutHtmlComponent,
    LayoutExpansionPanelHeaderComponent,
    LayoutExpansionPanelContentComponent,
    LayoutDrawerComponent,
    LayoutDrawerHeaderComponent,
    LayoutDrawerContentComponent,
    LayoutMenuComponent,
    LayoutMenuItemComponent,
    LayoutListComponent,
    LayoutDialogContentComponent,
    LayoutDialogActionsComponent,
    LayoutAppPageTitleComponent,
    LayoutAppBreadcrumbsComponent,
    LayoutPoweredByComponent,
    LayoutProgressTrackerComponent,
    LayoutProgressTrackerStepComponent
  ]
})
export class JsfComponentsModule {}
