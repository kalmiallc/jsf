import { HttpHeaders, HttpParams } from '@angular/common/http';
import { environment }             from '../../environments/environment';

export const InterceptorSkipAuthHeader = 'X-SkipAuth-Interceptor';

export function getSkipAuthHeader() {
  return new HttpHeaders().set(InterceptorSkipAuthHeader, '');
}

export function getSkipAuthOption() {
  return {headers: getSkipAuthHeader()};
}

export function setSkipAuthOption(options?: { headers?: HttpHeaders }) {
  if (options && options.headers) {
    options.headers.set(InterceptorSkipAuthHeader, '');
    return options;
  }

  return {
    ... options,
    ... getSkipAuthOption()
  };
}

export function api(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${ environment.apiBase }/${ path }`;
}

export interface HttpOptionsInterface {
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}
