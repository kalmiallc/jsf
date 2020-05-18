import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isI18nObject, JsfAbstractProp, JsfBuilder, JsfDefinition, JsfI18nObject }                    from '@kalmia/jsf-common-es2015';
import { uniq }                                                                                       from 'lodash';
import { FilterItemInterface }                                                                        from './filter-item.interface';
import { SortInterface }                                                                              from './sort.interface';
import { KalJsfFilterMessages }                                                                       from './kal-jsf-filter.messages';


@Component({
  selector       : 'jsf-kal-jsf-filter',
  templateUrl    : './kal-jsf-filter.component.html',
  styleUrls      : ['./kal-jsf-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KalJsfFilterComponent implements OnInit {

  onInitDone = false;

  jsfBuilder: JsfBuilder;

  allFilters: FilterItemInterface[]       = [];
  availableFilters: FilterItemInterface[] = [];
  selectedFilters: FilterItemInterface[]  = [];

  selectedSort: SortInterface;

  messages = KalJsfFilterMessages;

  get translationServer() {
    return this.jsfBuilder && this.jsfBuilder.translationServer;
  }

  /**
   * Doc
   */
  private _doc: JsfDefinition;
  get doc(): JsfDefinition {
    return this._doc;
  }

  @Input()
  set doc(value: JsfDefinition) {
    this._doc = value;
    this.rebuildOnInputChange()
      .catch(e => {
        throw e;
      });
  }

  /**
   * Modes
   */
  private _modes: string[] = [];
  get modes(): string[] {
    return this._modes;
  }

  @Input()
  set modes(modes: string[]) {
    this._modes = modes;
    this.rebuildOnInputChange()
      .catch(e => {
        throw e;
      });
  }

  @Output() queryChange = new EventEmitter<any>();
  @Output() sortChange  = new EventEmitter<any>();


  get searchableProps() {
    return this.jsfBuilder.searchableProps;
  }

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.onInitDone = true;
    this.rebuildOnInputChange()
      .catch(e => {
        throw e;
      });
  }

  jsfPathToFilterObj(path): FilterItemInterface {
    const out = {
      path,
      jsfProp: this.jsfBuilder.propBuilder.getControlByPath(path) as any,
      title  : path
    };

    if ((out.jsfProp.prop as JsfAbstractProp<any, any, any>).title) {
      out.title = (out.jsfProp.prop as any).title;
    }

    if ((out.jsfProp.prop as JsfAbstractProp<any, any, any>).searchable.title) {
      out.title = (out.jsfProp.prop as JsfAbstractProp<any, any, any>).searchable.title;
    }

    return out;
  }

  async rebuildOnInputChange() {
    if (!this.onInitDone) {
      return;
    }

    this._doc.$modes = uniq(this.modes.concat(this._doc.$modes || []));
    // this.jsfBuilder  = await JsfBuilder.create(this.doc, { skipValidation: true, withoutHandlers: true, headless: true });
    this.jsfBuilder  = await JsfBuilder.create(this.doc, { withoutHandlers: true, headless: true });

    this.allFilters       = this.searchableProps.map(x => this.jsfPathToFilterObj(x));
    this.availableFilters = Array.from(this.allFilters);

    this.cdRef.markForCheck();
  }

  selectFilter(filterItem: FilterItemInterface) {
    this.availableFilters = this.availableFilters.filter(y => y.path !== filterItem.path);
    this.selectedFilters.push(filterItem);
    this.onFilterItemQueryChange(filterItem, null);
  }

  removeFilter(filterItem: FilterItemInterface) {
    this.availableFilters.push(filterItem);
    this.selectedFilters = this.selectedFilters.filter(y => y.path !== filterItem.path);
    this.onFilterItemQueryChange(filterItem, null);
  }

  selectSort(filterItem: FilterItemInterface, direction?: 1 | -1) {
    if (!direction) {
      if (!this.selectedSort) {
        direction = 1;
      } else if (this.selectedSort.path === filterItem.path) {
        direction = this.selectedSort.direction === 1 ? -1 : 1;
      } else {
        direction = 1;
      }
    }

    this.selectedSort = {
      path: filterItem.path,
      direction
    };
    this.onSortChange();
  }

  removeSort() {
    this.selectedSort = void 0;
    this.onSortChange();
  }

  onFilterItemQueryChange(filterItem, query) {
    this.queryChange.emit(this.selectedFilters.reduce(
      (a, c) => {
        if (c.value !== undefined) {
          a[c.jsfProp.abstractPath] = c.value;
        }
        return a;
      },
      {}));
  }

  onSortChange() {
    this.sortChange.emit(this.selectedSort);
    this.cdRef.detectChanges();
  }

  i18n(source: string | JsfI18nObject): string {
    const ts = this.translationServer;
    return ts ? ts.get(source) : (isI18nObject(source) ? source.val : source);
  }
}
