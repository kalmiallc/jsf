import { Injectable }                                                      from '@angular/core';
import { HttpClient, HttpHeaders }                                         from '@angular/common/http';
import { api, getSkipAuthOption, HttpOptionsInterface, setSkipAuthOption } from './api.util';

/**
 * Helper class for making API calls, with limited options. If you need full http options support use HttpClient directly!
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(public http: HttpClient) { }

  public ping() {
    return this.http.get(api('health'), getSkipAuthOption());
  }

  getOptWithClient(options: HttpOptionsInterface = {}) {
    options.headers = options.headers || new HttpHeaders();
    options.headers = options.headers.set('X-Client-Key', `example`);
    return options;
  }

  get(path: string, options?: HttpOptionsInterface) {
    options = this.getOptWithClient(options);
    return this.http.get(api(path), options);
  }

  post(path: string, body: any | null, options?: HttpOptionsInterface) {
    options = this.getOptWithClient(options);
    return this.http.post(api(path), body, options);
  }

  put(path: string, body: any | null, options?: HttpOptionsInterface) {
    options = this.getOptWithClient(options);
    return this.http.put(api(path), body, options);
  }

  delete(path: string, options?: HttpOptionsInterface) {
    options = this.getOptWithClient(options);
    return this.http.delete(api(path), options);
  }

  getNoAuth(path: string, options?: HttpOptionsInterface) {
    options = setSkipAuthOption(options);
    return this.http.get(api(path), options);
  }

  postNoAuth(path: string, body: any | null, options?: HttpOptionsInterface) {
    options = setSkipAuthOption(options);
    return this.http.post(api(path), body, options);
  }

  putNoAuth(path: string, body: any | null, options?: HttpOptionsInterface) {
    options = setSkipAuthOption(options);
    return this.http.put(api(path), body, options);
  }

  deleteNoAuth(path: string, options?: HttpOptionsInterface) {
    options = setSkipAuthOption(options);
    return this.http.delete(api(path), options);
  }
}
