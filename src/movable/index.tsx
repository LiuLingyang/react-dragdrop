import React from 'react';
import Draggable from '../draggable';
import manager from '../manager';
import { getComputedStyle, getSize } from '../dom';
import { DraggableData } from '../types';

export interface MovableProps {
  axis?: string;
  grid?: { x: number; y: number };
  range?: Function | string | { left?: number; right?: number; top?: number; bottom?: number };
  rangeMode?: string;
  proxy?: string | Element | Function;
  type?: string;
  trigger?: React.RefObject<HTMLDivElement>;
  value?: any;
  disabled?: boolean;
  sourceClassName?: string;
  proxyClassName?: string;
  restrict?: Function;
  children: React.ReactElement;
  ondragstart?: (data: DraggableData) => void;
  ondrag?: (data: DraggableData) => void;
  ondragend?: (data: DraggableData) => void;
}
export interface MovableState {}

/**
 * @class Movable
 * @extends Component
 * @param axis               => 拖拽代理移动时限制的轴向，`both`表示可以在任意方向上移动，`x`表示限制在水平方向上移动，`y`表示限制在垂直方向上移动
 * @param grid               => 拖拽代理移动时限制的网格。值为一个{x,y}格式的对象，表示水平方向和垂直方向网格的大小
 * @param range              => 拖拽范围。值可以为一个{left,top,right,bottom}格式的对象，表示代理元素移动的上下左右边界。当值为`offsetParent`，代理元素限制在offsetParent中移动，仅适用于`position`为`absolute`的情况；当值为`parent`；当值为`window`时，拖拽时代理元素限制在window中移动，仅适用于`position`为`fixed`的情况
 * @param rangeMode          => 拖拽范围模式，默认为`inside`，表示在拖拽范围内侧移动，`center`表示在拖拽范围边缘及内侧移动
 * 其余 api 同 Draggable
 */
export default class Movable extends React.PureComponent<MovableProps, MovableState> {
  static defaultProps = {
    proxy: 'self',
    axis: 'both',
    grid: { x: 0, y: 0 },
    range: undefined,
    rangeMode: 'inside'
  };

  constructor(props) {
    super(props);

    this.restrict = this.restrict.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
  }

  onDragStart() {
    if (manager.proxy) {
      manager.range = this.getRange(manager.proxy);
    }
  }

  /**
   * @method getRange(proxy) 获取拖拽范围
   * @private
   * @param  {Element} proxy 拖拽代理元素
   * @return {Element} 拖拽范围元素
   */
  getRange(proxy) {
    let range;

    if (typeof this.props.range === 'object') range = this.props.range;
    else if (typeof this.props.range === 'function') range = this.props.range();
    else if (this.props.range === 'offsetParent') {
      if (getComputedStyle(proxy, 'position') !== 'absolute') proxy.style.position = 'absolute';
      const offsetParent = proxy.offsetParent;
      range = Object.assign({ left: 0, top: 0 }, getSize(offsetParent, this.props.rangeMode));
    } else if (this.props.range === 'window') {
      if (getComputedStyle(proxy, 'position') !== 'fixed') proxy.style.position = 'fixed';
      range = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    }

    if (range) {
      if (range.width !== undefined && range.height !== undefined) {
        range.right = range.left + range.width;
        range.bottom = range.top + range.height;
      } else if (range.right !== undefined && range.bottom !== undefined) {
        range.width = range.right - range.left;
        range.height = range.bottom - range.top;
      }
    }

    return range;
  }

  restrict(params) {
    const next = {
      left: params.startLeft + params.dragX,
      top: params.startTop + params.dragY
    };

    //范围约束
    if (params.range) {
      if (this.props.rangeMode === 'inside') {
        const minTop = params.range.bottom - manager.proxy.offsetHeight;
        const minLeft = params.range.right - manager.proxy.offsetWidth;
        next.left = Math.min(Math.max(params.range.left, next.left), minLeft < 0 ? 0 : minLeft);
        next.top = Math.min(Math.max(params.range.top, next.top), minTop < 0 ? 0 : minTop);
      } else if (this.props.rangeMode === 'center') {
        next.left = Math.min(Math.max(params.range.left, next.left), params.range.right);
        next.top = Math.min(Math.max(params.range.top, next.top), params.range.bottom);
      } else if (this.props.rangeMode === 'outside') {
        next.left = Math.min(
          Math.max(params.range.left - manager.proxy.offsetWidth, next.left),
          params.range.right
        );
        next.top = Math.min(
          Math.max(params.range.top - manager.proxy.offsetHeight, next.top),
          params.range.bottom
        );
      }
    }

    // 网格约束
    const grid = this.props.grid;
    grid.x && (next.left = Math.round(next.left / grid.x) * grid.x);
    grid.y && (next.top = Math.round(next.top / grid.y) * grid.y);

    // 轴向约束
    if (this.props.axis === 'y') next.left = params.startLeft;
    if (this.props.axis === 'x') next.top = params.startTop;

    return next;
  }

  render() {
    return (
      <Draggable restrict={this.restrict} ondragstart={this.onDragStart} {...this.props}>
        {this.props.children}
      </Draggable>
    );
  }
}
