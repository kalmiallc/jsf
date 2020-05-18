import { template, TemplateExecutor } from 'lodash';

export abstract class ValidationError {

  private messageTemplate: TemplateExecutor = null;

  /**
   * Should be in format <prop>/<handler>/<code>
   */
  public abstract errorCode: string;
  /**
   * Readable error message
   */
  public abstract errorMessage: string;

  public data?: { [key: string]: any };

  constructor(data?: { [key: string]: any }) {
    this.data = data;
  }

  /**
   * Compiles the message template string
   */
  public compileMessageTemplate(): void {
    this.messageTemplate = template(this.errorMessage, {
      interpolate: /{{([\s\S]+?)}}/g
    });
  }

  /**
   * Get the interpolated error message based on values in the `data` property
   */
  public get interpolatedMessage(): string {
    if (this.messageTemplate === null) {
      this.compileMessageTemplate();
    }
    return this.data ? this.messageTemplate(this.data) : this.errorMessage;
  }

}
