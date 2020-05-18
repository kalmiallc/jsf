import {
  JsfLayoutAnchor,
  JsfLayoutAppBreadcrumbs,
  JsfLayoutAppPageTitle,
  JsfLayoutArrayItemAdd,
  JsfLayoutArrayItemRemove,
  JsfLayoutButton,
  JsfLayoutChartJS,
  JsfLayoutCol,
  JsfLayoutCustomComponent,
  JsfLayoutD3,
  JsfLayoutDialogActions,
  JsfLayoutDialogContent,
  JsfLayoutDiv,
  JsfLayoutDrawer,
  JsfLayoutDrawerContent,
  JsfLayoutDrawerHeader,
  JsfLayoutExpansionPanelContent,
  JsfLayoutExpansionPanelHeader,
  JsfLayoutHeading,
  JsfLayoutHr,
  JsfLayoutHtml,
  JsfLayoutIcon,
  JsfLayoutImage,
  JsfLayoutList,
  JsfLayoutListItem,
  JsfLayoutMenu,
  JsfLayoutMenuItem,
  JsfLayoutOrderSummary,
  JsfLayoutOrderSummaryLineItem,
  JsfLayoutOrderSummaryOverlay,
  JsfLayoutOrderSummaryScrollContainer,
  JsfLayoutOrderSummaryStaticContainer,
  JsfLayoutParagraph,
  JsfLayoutPoweredBy,
  JsfLayoutProgressBar,
  JsfLayoutProgressTracker,
  JsfLayoutProgressTrackerStep,
  JsfLayoutProp,
  JsfLayoutPropArray,
  JsfLayoutPropExpansionPanel,
  JsfLayoutPropTable,
  JsfLayoutRef,
  JsfLayoutRender2D,
  JsfLayoutRow,
  JsfLayoutSection,
  JsfLayoutSpan,
  JsfLayoutStep,
  JsfLayoutStepper,
  JsfLayoutSub,
  JsfLayoutSup,
  JsfLayoutTab,
  JsfLayoutTabSet
}                                                 from './layouts';
import { JsfItemsStylesBase, JsfItemsStylesFlex } from './styles';
import { JsfLayoutBadge }                         from './layouts/special/layout-badge';

export * from './jsf-layout-util';
export * from './abstract/abstract-layout';
export * from './layouts/index';
export * from './styles/index';
export * from './interfaces';

export type JsfItemsLayout =
  JsfLayoutDiv
  | JsfLayoutRow
  | JsfLayoutCol
  | JsfLayoutTabSet
  | JsfLayoutTab
  | JsfLayoutSection
  | JsfLayoutStep
  | JsfLayoutStepper
  | JsfLayoutOrderSummaryOverlay
  | JsfLayoutOrderSummary
  | JsfLayoutOrderSummaryStaticContainer
  | JsfLayoutOrderSummaryScrollContainer
  | JsfLayoutDrawer
  | JsfLayoutDrawerHeader
  | JsfLayoutDrawerContent
  | JsfLayoutExpansionPanelHeader
  | JsfLayoutExpansionPanelContent
  | JsfLayoutMenu
  | JsfLayoutMenuItem
  | JsfLayoutList
  | JsfLayoutListItem
  | JsfLayoutDialogContent
  | JsfLayoutDialogActions
  | JsfLayoutProgressTracker;

export type JsfPropLayout = JsfLayoutProp | JsfLayoutPropArray | JsfLayoutPropTable | JsfLayoutPropExpansionPanel;

export type JsfSpecialLayout =
  | JsfLayoutHr
  | JsfLayoutHeading
  | JsfLayoutSpan
  | JsfLayoutSup
  | JsfLayoutSub
  | JsfLayoutAnchor
  | JsfLayoutParagraph
  | JsfLayoutButton
  | JsfLayoutBadge
  | JsfLayoutArrayItemAdd
  | JsfLayoutArrayItemRemove
  | JsfLayoutImage
  | JsfLayoutIcon
  | JsfLayoutProgressBar
  | JsfLayoutOrderSummaryLineItem
  | JsfLayoutHtml
  | JsfLayoutD3
  | JsfLayoutChartJS
  | JsfLayoutCustomComponent
  | JsfLayoutRender2D
  | JsfLayoutAppBreadcrumbs
  | JsfLayoutAppPageTitle
  | JsfLayoutPoweredBy
  | JsfLayoutRef
  | JsfLayoutProgressTrackerStep;

export type JsfUnknownLayout = JsfItemsLayout | JsfPropLayout | JsfSpecialLayout;
export type JsfStyles = JsfItemsStylesBase & JsfItemsStylesFlex;
