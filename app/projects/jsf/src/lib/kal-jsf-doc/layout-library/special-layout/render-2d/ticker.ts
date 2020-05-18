import { Renderer } from './renderer';

export class Ticker {

  private _running: boolean;
  private _lastTick: number;

  private _tick: () => void;


  /**
   * Target framerate.
   */
  private _frameRate = 60;
  public get frameRate(): number {
    return this._frameRate;
  }

  public set frameRate(value: number) {
    this._frameRate = value;
    this._interval = 1000 / this._frameRate;
  }

  private _interval: number;

  constructor(private renderer: Renderer, private pixiTicker: PIXI.Ticker, frameRate?: number) {
    pixiTicker.stop();

    this._tick = this.updateTicker.bind(this);

    if (frameRate) {
      this.frameRate = frameRate;
    }
  }

  start() {
    this._running = true;
    this._lastTick = Date.now();
    this.updateTicker();
  }

  stop() {
    this._running = false;
  }

  forceUpdate() {
    this.pixiTicker.update();
  }

  /**
   * Update the PIXI ticker.
   */
  private updateTicker() {
    const now = Date.now();
    const delta = now - this._lastTick;

    if (delta >= this._interval) {
      this._lastTick = now - (delta % this._interval);

      if (this.renderer.running.value && this._running) {
        this.pixiTicker.update();
      }
    }

    if (this._running) {
      requestAnimationFrame(this._tick);
    }
  }
}
