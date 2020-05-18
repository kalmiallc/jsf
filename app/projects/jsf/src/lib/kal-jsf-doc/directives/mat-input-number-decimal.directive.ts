import { Directive, HostListener, ElementRef, OnInit, forwardRef, Self, Input } from '@angular/core';
import { NgControl }                                                                              from '@angular/forms';
import { DecimalPipe }                                                                            from '@angular/common';
import { isString }                                                                               from 'lodash';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

const thousandSeparator = (1111).toLocaleString().replace(/1/g, '');
const decimalSeparator = (1.1).toLocaleString().replace(/1/g, '');

function padEnd(val: string, size: number) {
  while (val.length < size) {
    val = val + '0';
  }
  return val;
}

function padStart(val: string, size: number) {
  while (val.length < size) {
    val = '0' + val;
  }
  return val;
}

@Directive({
  selector: 'input[matInputNumberDecimal]',
  providers: [
    { provide: MAT_INPUT_VALUE_ACCESSOR,
      useExisting: MatInputNumberDecimalDirective},
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatInputNumberDecimalDirective),
      multi: true,
    }

  ]
})
export class MatInputNumberDecimalDirective {

  private _value: string | null;

  @Input('jsfNumberInputAutoCorrectMinDecimalDigits') minDecimalDigits: number;
  @Input('jsfNumberInputAutoCorrectMaxDecimalDigits') maxDecimalDigits: number;

  constructor(private elementRef: ElementRef<HTMLInputElement>,
  ) {}

  get value(): string | null {
    return this._value;
  }

  @Input('value')
  set value(value: string | null) {
    this._value = value;
    this.formatValue(value);
  }

  private formatValue(value: string | null) {
    if (value === '') {
      return;
    }
    if (value !== null && value !== undefined) {
      // let selectionStart = null;
      // if (this.minDecimalDigits && options && options.write) {
      //   // WHY? selectionStart/selectionEnd on input type=“number” no longer allowed in Chrome
      //   this.elementRef.nativeElement.setAttribute('type', 'text');
      //   console.log(this.elementRef.nativeElement.selectionStart);
      //   selectionStart = this.elementRef.nativeElement.selectionStart + 1;
      //   this.elementRef.nativeElement.setAttribute('type', 'number');
      // }

      // [integerPart, fractionalPart]
      const valueParts = value.toString().split('.');
      const isNegative = (+ value) < 0;

      valueParts[0] = (+ valueParts[0]).toString();
      if (isNegative && !valueParts[0].startsWith('-')) {
        valueParts[0] = '-' + valueParts[0];
      }

      if (this.minDecimalDigits) {
        if (valueParts.length === 1) {
          valueParts.push('');
        }
        valueParts[1] = padEnd(valueParts[1], this.minDecimalDigits);
      }

      this.elementRef.nativeElement.value = valueParts.join('.');
      // if (selectionStart !== null) {
      //   this.elementRef.nativeElement.setAttribute('type', 'text');
      //   this.elementRef.nativeElement.setSelectionRange(selectionStart, selectionStart);
      //   this.elementRef.nativeElement.setAttribute('type', 'number');
      // }
    } else {
      this.elementRef.nativeElement.value = '';
    }
  }

  private unFormatValue() {
    const value = this.elementRef.nativeElement.value;
    this._value = value.replace(/[^\d.-]/g, '');
    if (value) {
      this.elementRef.nativeElement.value = this._value;
    } else {
      this.elementRef.nativeElement.value = '';
    }
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value) {
    this._value = value.replace(/[^\d.-]/g, '');
    // here to notify Angular Validators.
    // Note we need to explicitly pass undefined here instead of an empty string, or it will get converted to 0!
    this._onChange(this._value || void 0);
  }

  @HostListener('blur')
  _onBlur() {
    this.formatValue(this._value); // add commas
  }

  @HostListener('focus')
  onFocus() {
    this.unFormatValue(); // remove commas for editing purpose
  }

  _onChange(value: any): void {}

  writeValue(value: any) {
    this._value = value;

    if (this.elementRef.nativeElement !== document.activeElement) {
      this.formatValue(this._value); // format Value
    }
  }

  registerOnChange(fn: (value: any) => void) {
    this._onChange = fn;
  }

  registerOnTouched() {
  }
}
