import { NgModule }                                                        from '@angular/core';
import { CommonModule }                                                    from '@angular/common';
import { JsfHorizontalStepper, JsfStep, JsfStepper, JsfVerticalStepper }   from './stepper/jsf-stepper.component';
import { JsfStepHeader }                                                   from './stepper/step-header/jsf-step-header.component';
import { MatIconModule, MatRippleModule, MatStepperModule, MatTabsModule } from '@angular/material';
import { JsfErrorMessagesComponent }                                       from './error-message/jsf-error-messages.component';
import { JsfDirectivesModule }                                             from '../../directives/jsf-directives.module';
import { JsfStepperNext, JsfStepperPrevious }                              from './stepper/jsf-stepper-button';
import { JsfOverlayComponent }                                             from './overlay/jsf-overlay.component';
import { JsfLoadingIndicatorComponent }                                    from './loading-indicator/jsf-loading-indicator.component';
import { JsfTabGroup }                                                     from './tabset/jsf-tab-group';
import { JsfTabBody, JsfTabBodyPortal }                                    from './tabset/jsf-tab-body';
import { JsfTabHeader }                                                    from './tabset/jsf-tab-header';
import { ObserversModule }                                                 from '@angular/cdk/observers';
import { PortalModule }                                                    from '@angular/cdk/portal';
import { JsfTabLabelWrapper }                                              from './tabset/jsf-tab-label-wrapper';
import { JsfTabLabel }                                                     from './tabset/jsf-tab-label';
import { JsfInkBar }                                                       from './tabset/jsf-ink-bar';
import { JsfIconComponent }                                                from './icon/jsf-icon.component';

@NgModule({
  imports     : [
    CommonModule,
    PortalModule,
    MatRippleModule,
    ObserversModule,
    MatStepperModule,
    MatTabsModule,
    MatIconModule,
    JsfDirectivesModule
  ],
  declarations: [
    JsfStep,
    JsfStepper,
    JsfStepperNext,
    JsfStepperPrevious,
    JsfHorizontalStepper,
    JsfVerticalStepper,
    JsfTabGroup,
    JsfTabBodyPortal,
    JsfTabBody,
    JsfTabLabelWrapper,
    JsfTabLabel,
    JsfTabHeader,
    JsfInkBar,
    JsfStepHeader,
    JsfErrorMessagesComponent,
    JsfOverlayComponent,
    JsfLoadingIndicatorComponent,
    JsfIconComponent
  ],
  exports     : [
    JsfStep,
    JsfStepper,
    JsfStepperNext,
    JsfStepperPrevious,
    JsfHorizontalStepper,
    JsfVerticalStepper,
    JsfTabGroup,
    JsfTabBodyPortal,
    JsfTabBody,
    JsfTabLabelWrapper,
    JsfTabLabel,
    JsfTabHeader,
    JsfInkBar,
    JsfStepHeader,
    JsfErrorMessagesComponent,
    JsfOverlayComponent,
    JsfLoadingIndicatorComponent,
    JsfIconComponent
  ]
})
export class JsfCustomComponentsModule {}
