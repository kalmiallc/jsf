import { JsfBuilder }                                                 from '../jsf-builder';
import { JsfLayoutPreferencesInterface }                              from '../../layout/layouts';
import {
  isItemsLayout,
  JsfAbstractLayout,
  JsfUnknownLayout
}                                                                     from '../../layout';
import { compact, get }                                               from 'lodash';
import { isI18nObject, JsfTranslatableMessage, JsfTranslationServer } from '../../translations';
import { BehaviorSubject, Subject }                                   from 'rxjs';
import { layoutClickHandlerService }                                  from '../util/layout-click-handler.service';
import { JsfLayoutOnClickInterface }                                  from '../../layout/interfaces/layout-on-click.interface';
import { PropStatus }                                                 from '../interfaces';
import { takeUntil }                                                  from 'rxjs/operators';
import { jsfEnv }                                                     from '../../jsf-env';

/**
 * Used for __id.
 */
let uniqIdCount    = 0;
const uniqIdPrefix = 'L' + (+new Date()) + '_';

export interface JsfLayoutBuilderOptionsInterface {
  index?: number | string;
  docDefPath: string;
}

export abstract class JsfAbstractLayoutBuilder<LayoutType extends JsfAbstractLayout> {

  id: string;
  idGroup: string;
  docDefPath: string;

  public layout: LayoutType;
  public rootBuilder: JsfBuilder;
  public parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>;

  public preferences: JsfLayoutPreferencesInterface;

  protected unsubscribe: Subject<void> = new Subject();

  abstract get type(): string;

  abstract get enabled(): boolean;

  protected _visible = new BehaviorSubject(true);
  get visible(): boolean {
    return this._visible.getValue();
  }

  get visibleObservable() {
    return this._visible.asObservable();
  }

  /**
   * These are the default supported fields which will be extracted for translation.
   * You can specify custom fields to use by using the `translatableFields` property
   * in the layout schema.
   */
  private readonly translatableFields = [
    'title',
    'placeholder'
  ];


  /**
   * Example:
   * arrayPropMap = {
   *   'users[]': '@001'
   * }
   */
  public arrayPropMap: { [propKey: string]: string } = {};

  /**
   * Important: keys in DESC order by length.
   *
   * Example:
   * - a.b.c[].d
   * - a.b.c[]
   * - a.b
   * - a
   */
  public arrayPropKeys: string[] = [];

  constructor(
    layout: LayoutType,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface) {
    this.layout     = layout;
    this.docDefPath = options.docDefPath;
    this.computeId(parentBuilder, options);
    this.rootBuilder   = rootBuilder;
    this.parentBuilder = parentBuilder;
    this.resetItemsPropMap(arrayPropMap);

    if (!jsfEnv.isApi && jsfEnv.__uuid) {
      if (!layout.__uuid || !layout.__uuid.startsWith(uniqIdPrefix)) {
        layout.__uuid = uniqIdPrefix + (++uniqIdCount);
      }
    }
  }

  private computeId(parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>, options: JsfLayoutBuilderOptionsInterface) {
    if (!parentBuilder) {
      this.id = 'root-layout';
      return;
    }

    const indexPostfix = options.index !== undefined ? `[${ options.index }]` : '';
    if (this.layout.id) {
      this.idGroup = this.layout.id;
      this.id      = this.layout.id + indexPostfix;
      return;
    }

    const type   = (this.layout['type'] || '') + indexPostfix;
    const chunks = [type, this.layout['key']];
    this.id      = parentBuilder.id + '.' + chunks.filter(x => !!x).join('::');
  }

  onDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  updateStatus() {
    this.updateVisibilityStatus();
    this.subscribeForEvents();
  }

  /**
   * Set visibility flag.
   * Intentionally protected, since _visible can be overwritten any time by events. So nobody accidentally changes
   * status.
   */
  protected setVisibility(value: boolean) {
    if (this.visible !== value) {
      this._visible.next(value);
    }
  }

  subscribeForEvents() {
    if (this.layout.visibleIf && typeof this.layout.visibleIf !== 'string') {
      const dependencies = this.layout.visibleIf.dependencies || [];

      dependencies.map(path => {
        const dependencyAbsolutePath = this.abstractPathToAbsolute(path);
        this.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(status => {
            if (status.status !== PropStatus.Pending) {
              this.updateVisibilityStatus();
            }
          });
      });

      const layoutDependencies = this.layout.visibleIf.layoutDependencies || [];
      layoutDependencies.map(id => {
        this.rootBuilder.subscribeLayoutStateChange(id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(newValue => {
            this.updateVisibilityStatus();
          });
      });

      if (!dependencies.length && !layoutDependencies.length) {
        if (this.rootBuilder.warnings) {
          console.warn(`Layout '${ this.type }' [${ this.id }] uses visibleIf but has not listed any dependencies and layoutDependencies.`,
            `Visibility state will never be updated.`);
        }
      }
    }
  }

  protected updateVisibilityStatus() {
    if (this.layout.visibleIf) {

      const ctx = this.rootBuilder.getEvalContext({
        layoutBuilder: this as any
      });

      let lambda;
      if (typeof this.layout.visibleIf === 'string') {
        lambda = this.layout.visibleIf;
      } else {
        lambda = (this.layout.visibleIf as any).$evalTranspiled || this.layout.visibleIf.$eval;
      }

      try {
        const result = this.rootBuilder.runEvalWithContext(lambda, ctx);

        if (result === undefined) {
          // throw new Error(`[visibleIf] Lambda function must return a value => '${ lambda }'`);
        }

        this.setVisibility(!!result);
      } catch (e) {
        // FIXME it seems that whenever an item gets removed from an array, the onDestroy method in this class is not
        // called before the resolver emis all the status changes.
        console.error('FIXME', e);
      }
    } else {
      this.setVisibility(true);
    }
  }

  /**
   * For example converts:
   * foo[].bar   into   foo[@0].bar
   *
   * @param abstractPath
   */
  abstractPathToAbsolute(abstractPath: string): string {
    this.arrayPropKeys.forEach(key => {
      if (abstractPath.startsWith(key)) {
        abstractPath = abstractPath.replace(key, this.arrayPropMap[key]);
      }
    });
    return abstractPath;
  }

  /**
   * Return prop builder instance. If layout is inside array (or nested arrays)
   * it will return correct prop item corresponding to layout for this item.
   *
   * @param abstractPath
   */
  getPropItem(abstractPath: string) {
    return this.rootBuilder.getProp(this.abstractPathToAbsolute(abstractPath));
  }

  resetItemsPropMap(arrayPropMap: { [propKey: string]: string }) {
    this.arrayPropMap  = arrayPropMap;
    this.arrayPropKeys = Object.keys(this.arrayPropMap)
      .sort((a, b) => b.length - a.length)
  }

  setItemPropMap(propKey: string, propItemId: string) {
    this.arrayPropMap[propKey] = propItemId;
    this.arrayPropKeys         = Object.keys(this.arrayPropMap)
      .sort((a, b) => b.length - a.length)
  }

  get translationServer(): JsfTranslationServer {
    return this.rootBuilder.translationServer;
  }

  getLayoutTranslatableStrings(): JsfTranslatableMessage[] {
    return this.getLayoutTranslatableStringsInternal(this.layout);
  }

  private getLayoutTranslatableStringsInternal(layout: JsfAbstractLayout): JsfTranslatableMessage[] {
    const messages: JsfTranslatableMessage[] = [];

    const translatableFields = layout.translatableFields || this.translatableFields;

    messages.push(...compact(
      translatableFields.map(x => {
        const message = get(layout as any, x);
        if (message) {
          return isI18nObject(message) ?
                 new JsfTranslatableMessage(message.val, message.id) :
                 new JsfTranslatableMessage(message);
        }
        return null;
      })
    ));

    if (isItemsLayout(layout)) {
      for (const item of layout.items) {
        messages.push(...this.getLayoutTranslatableStringsInternal(item));
      }
    }

    return messages;
  }

  async onClick($event: any) {
    if (this.layout.onClick) {
      return this.handleOnClick(this.layout.onClick, $event);
    }
  }

  async handleOnClick(onClickData: JsfLayoutOnClickInterface | JsfLayoutOnClickInterface[], $event?: any) {
    return layoutClickHandlerService.handleOnClick(onClickData, {
      rootBuilder  : this.rootBuilder,
      layoutBuilder: this
    }, $event);
  }
}
