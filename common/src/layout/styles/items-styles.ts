// tslint:disable:max-line-length

/**
 * Base styles
 * @deprecated
 */
export abstract class JsfItemsStylesBase {
  /**
   * Display property.
   */
  display?:
    'inline' |
    'block' |
    'flex' |
    'inline-block' |
    'inline-flex' |
    'inline-grid' |
    'inline-table' |
    'contents' |
    'grid' |
    'list-item' |
    'run-in' |
    'table' |
    'table-caption' |
    'table-column-group' |
    'table-header-group' |
    'table-footer-group' |
    'table-row-group' |
    'table-cell' |
    'table-column' |
    'table-row' |
    'none' |
    'initial' |
    'inherit';

  /**
   * Flexbox grid modifier.
   * See <http://flexboxgrid.com/> for more information.
   * @deprecated Use 'row' and 'col' layout types!
   */
  grid?: string;
}


/**
 * Flex styles
 */
export abstract class JsfItemsStylesFlex {

  /**
   * This establishes the main-axis, thus defining the direction flex items are placed in the flex container.
   * Flexbox is (aside from optional wrapping) a single-direction layout concept. Think of flex items as primarily
   * laying out either in horizontal rows or vertical columns.
   * <ul>
   *  <li>row (default): left to right in ltr; right to left in rtl</li>
   *  <li>row-reverse: right to left in ltr; left to right in rtl</li>
   *  <li>column: same as row but top to bottom</li>
   *  <li>column-reverse: same as row-reverse but bottom to top</li>
   * </ul>
   */
  flexDirection?:
    'row' |
    'row-reverse' |
    'column' |
    'column-reverse';

  /**
   * By default, flex items will all try to fit onto one line. You can change that and allow the items to wrap as
   * needed with this property.
   * <ul>
   *  <li>nowrap (default): all flex items will be on one line</li>
   *  <li>wrap: flex items will wrap onto multiple lines, from top to bottom</li>
   *  <li>wrap-reverse: flex items will wrap onto multiple lines from bottom to top</li>
   * </ul>
   */
  flexWrap?:
    'nowrap' |
    'wrap' |
    'wrap-reverse';

  /**
   * This is a shorthand `flex-direction` and `flex-wrap` properties, which together define the flex container's main
   * and cross axes. Default is `row nowrap`.
   */
  flexFlow?: string;

  /**
   * This defines the alignment along the main axis. It helps distribute extra free space left over when either all the
   * flex items on a line are inflexible, or are flexible but have reached their maximum size. It also exerts some
   * control over the alignment of items when they overflow the line.
   * <ul>
   *  <li>flex-start (default): items are packed toward the start line</li>
   *  <li>flex-end: items are packed toward to end line</li>
   *  <li>center: items are centered along the line</li>
   *  <li>space-between: items are evenly distributed in the line; first item is on the start line, last item on the
   * end line</li>
   *  <li>space-around: items are evenly distributed in the line with equal space around them. Note that visually the
   * spaces aren't equal, since all the items have equal space on both sides. The first item will have one unit of
   * space against the container edge, but two units of space between the next item because that next item has its own
   * spacing that applies.</li>
   *  <li>space-evenly: items are distributed so that the spacing between any two items (and the space to the edges) is
   * equal.</li>
   * </ul>
   */
  justifyContent?:
    'flex-start' |
    'flex-end' |
    'center' |
    'space-between' |
    'space-around' |
    'space-evenly';

  /**
   * This defines the default behaviour for how flex items are laid out along the cross axis on the current line.
   * Think of it as the `justify-content` version for the cross-axis (perpendicular to the main-axis).
   * <ul>
   *  <li>flex-start: cross-start margin edge of the items is placed on the cross-start line</li>
   *  <li>flex-end: cross-end margin edge of the items is placed on the cross-end line</li>
   *  <li>center: items are centered in the cross-axis</li>
   *  <li>baseline: items are aligned such as their baselines align</li>
   *  <li>stretch (default): stretch to fill the container (still respect min-width/max-width)</li>
   * </ul>
   */
  alignItems?:
    'flex-start' |
    'flex-end' |
    'center' |
    'baseline' |
    'stretch';

  /**
   * This aligns a flex container's lines within when there is extra space in the cross-axis, similar to how
   * `justify-content` aligns individual items within the main-axis.
   * <b>Note: this property has no effect when there is only one line of flex items.</b>
   * <ul>
   *  <li>flex-start: lines packed to the start of the container</li>
   *  <li>flex-end: lines packed to the end of the container</li>
   *  <li>center: lines packed to the center of the container</li>
   *  <li>space-between: lines evenly distributed; the first line is at the start of the container while the last one
   * is at the end</li>
   *  <li>space-around: lines evenly distributed with equal space around each line</li>
   *  <li>stretch (default): lines stretch to take up the remaining space</li>
   * </ul>
   */
  alignContent?:
    'flex-start' |
    'flex-end' |
    'center' |
    'space-between' |
    'space-around' |
    'stretch';

  /**
   * By default, flex items are laid out in the source order. However, the `order` property controls the order in which
   * they appear in the flex container.
   */
  order?: number;

  /**
   * This defines the ability for a flex item to grow if necessary. It accepts a unitless value that serves as a
   * proportion. It dictates what amount of the available space inside the flex container the item should take up. If
   * all items have `flex-grow` set to 1, the remaining space in the container will be distributed equally to all
   * children. If one of the children has a value of 2, the remaining space would take up twice as much space as the
   * others (or it will try to, at least).
   * <b>Negative numbers are invalid.</b>
   *
   * Default is 0.
   */
  flexGrow?: number;

  /**
   * This defines the ability for a flex item to shrink if necessary.
   * <b>Negative numbers are invalid.</b>
   *
   * Default is 1.
   */
  flexShrink?: number;

  /**
   * This defines the default size of an element before the remaining space is distributed. It can be a length (e.g.
   * 20%, 5rem, etc.) or a keyword. The `auto` keyword means "look at my width or height property" (which was
   * temporarily done by the `main-size` keyword until deprecated). The `content` keyword means "size it based on the
   * item's content" - this keyword isn't well supported yet, so it's hard to test and harder to know what its brethren
   * `max-content`, `min-content`, and `fit-content` do.
   *
   * If set to `0`, the extra space around content isn't factored in. If set to `auto`, the extra space is distributed
   * based on its
   * `flex-grow` value.
   *
   * Default is `auto`.
   */
  flexBasis?: string | 'auto';

  /**
   * This is the shorthand for `flex-grow`, `flex-shrink` and `flex-basis` combined. The second and third parameters
   * (`flex-shrink` and
   * `flex-basis`) are optional. Default is `0 1 auto`.
   *
   * <b>It is recommended that you use this shorthand property rather than set the individual properties. The short
   * hand sets the other values intelligently.</b>
   */
  flex?: 'none' | string;

  /**
   * This allows the default alignment (or the one specified by `align-items`) to be overridden for individual flex
   * items.
   *
   * Please see the `align-items` explanation to understand the available values.
   *
   * Note that `float`, `clear` and `vertical-align` have no effect on a flex item.
   */
  alignSelf?:
    'auto' |
    'flex-start' |
    'flex-end' |
    'center' |
    'baseline' |
    'stretch';
}
