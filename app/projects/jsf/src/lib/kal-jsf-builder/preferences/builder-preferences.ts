export const preferences = new class {
  // auto reload
  ar: boolean;
  // show items
  si: boolean;
  // inspector view
  iv: 'UI' | 'JSON';

  constructor() {
    // check if there are settings in localstorage
    const existingSettings = this.fromLocalStorage();
    if (existingSettings) {
      this.ar = existingSettings.autoReload;
      this.si = existingSettings.showItems;
      this.iv = existingSettings.inspectorView;
    }
    this.ar = typeof this.ar !== undefined ? this.ar : false;
    this.si = typeof this.si !== undefined ? this.si : true;
    this.iv = this.iv || 'JSON';
  }

  // get and set preferences
  get autoReload() {
    return this.ar;
  }

  set autoReload(val) {
    this.ar = val;
    this.toLocalStorage();
  }

  get showItems() {
    return this.si;
  }

  set showItems(val) {
    this.si = val;
    this.toLocalStorage();
  }

  get inspectorView() {
    return this.iv;
  }

  set inspectorView(val) {
    this.iv = val;
    this.toLocalStorage();
  }

  // local storage functions
  getPropertiesJsonString() {
    return JSON.stringify({
      autoReload   : this.ar,
      showItems    : this.si,
      inspectorView: this.iv
    })
  }

  toLocalStorage() {
    localStorage.setItem('jsf-builder-preferences', this.getPropertiesJsonString());
  }

  fromLocalStorage() {
    return JSON.parse(localStorage.getItem('jsf-builder-preferences'));
  }
};
