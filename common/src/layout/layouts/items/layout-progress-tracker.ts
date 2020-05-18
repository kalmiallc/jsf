import { JsfAbstractItemsLayout }           from '../../abstract/abstract-layout';
import { DefCategory, DefExtends, DefProp } from '../../../jsf-for-jsf/decorators';
import { JsfLayoutProgressTrackerStep }     from '../special';

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutProgressTracker extends JsfAbstractItemsLayout<'progress-tracker'> {
  @DefProp('JsfLayoutProgressTrackerStep[]')
  items: JsfLayoutProgressTrackerStep[];

  step?: number | {
    $eval: string;
    dependencies: string[]
  }; // Range 0 to n, where n is last step index

  progressTitle: string;
  progressTitleTemplateData: {
    $eval: string,
    dependencies?: string[]
  };

  constructor(data: JsfLayoutProgressTracker) {
    super();
    Object.assign(this, data);
  }
}
