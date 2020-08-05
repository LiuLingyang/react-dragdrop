import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Draggable from '../draggable';
import './index.less';

type managerTypes = {
  startLeft: number;
  startTop: number;
  startWidth: number;
  startHeight: number;
  range?: { left: number; right: number; top: number; bottom: number };
};

const manager: managerTypes = {
  startLeft: 0,
  startTop: 0,
  startWidth: 0,
  startHeight: 0
};

export interface ResizableProps {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  range?: string | { left: number; right: number; top: number; bottom: number };
  handles?: string[];
  handleType?: string;
  delay?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactElement;
  resize?: (data: {
    sender: any;
    left: number;
    top: number;
    width: number;
    height: number;
  }) => void;
}
export interface ResizableState {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

/**
 * @class Resizable
 * @extends Component
 * @param left                => 水平位置
 * @param top                 => 垂直位置
 * @param width               => 宽度
 * @param height              => 高度
 * @param minWidth            => 最小宽度
 * @param minHeight           => 最小高度
 * @param maxWidth            => 最大宽度
 * @param maxHeight           => 最大高度
 * @param range               => 拖拽范围。值可以为一个{left,top,right,bottom}格式的对象，表示代理元素移动的上下左右边界。当值为`offsetParent`，代理元素限制在offsetParent中移动，仅适用于`position`为`absolute`的情况；当值为`parent`；当值为`window`时，拖拽时代理元素限制在window中移动，仅适用于`position`为`fixed`的情况
 * @param handles             => 句柄
 * @param handleType          => 句柄类型
 * @param delay               => 拖拽延迟时间
 * @param disabled            => 是否禁用
 * @param className           => 补充class
 * @param resize              => 调整大小时触发
 */
export default class Resizable extends React.PureComponent<ResizableProps, ResizableState> {
  static defaultProps = {
    left: 0,
    top: 0,
    width: 300,
    height: 200,
    minWidth: 0,
    minHeight: 0,
    maxWidth: Infinity,
    maxHeight: Infinity,
    range: undefined,
    handles: ['top', 'bottom', 'left', 'right', 'topleft', 'topright', 'bottomleft', 'bottomright'],
    handleType: '',
    delay: 0,
    className: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      left: props.left,
      top: props.top,
      width: props.width,
      height: props.height
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = _.throttle(this.onDrag.bind(this), this.props.delay);
  }

  onDragStart() {
    Object.assign(manager, {
      startLeft: this.state.left,
      startTop: this.state.top,
      startWidth: this.state.width,
      startHeight: this.state.height,
      range: this.getRange(ReactDOM.findDOMNode(this))
    });
  }

  onDrag(event, handle) {
    let left = manager.startLeft;
    let top = manager.startTop;
    let width = manager.startWidth;
    let height = manager.startHeight;

    if (handle.includes('left')) {
      const rangeWidth = manager.range
        ? manager.startLeft + manager.startWidth - manager.range.left
        : Infinity;
      width = manager.startWidth - event.dragX;
      width = Math.min(Math.max(this.props.minWidth, width), this.props.maxWidth, rangeWidth);
      left += manager.startWidth - width;
    }

    if (handle.includes('top')) {
      const rangeHeight = manager.range
        ? manager.startTop + manager.startHeight - manager.range.top
        : Infinity;
      height = manager.startHeight - event.dragY;
      height = Math.min(Math.max(this.props.minHeight, height), this.props.maxHeight, rangeHeight);
      top += manager.startHeight - height;
    }

    if (handle.includes('right')) {
      const rangeWidth = manager.range ? manager.range.right - manager.startLeft : Infinity;
      width = manager.startWidth + event.dragX;
      width = Math.min(Math.max(this.props.minWidth, width), this.props.maxWidth, rangeWidth);
    }

    if (handle.includes('bottom')) {
      const rangeHeight = manager.range ? manager.range.bottom - manager.startTop : Infinity;
      height = manager.startHeight + event.dragY;
      height = Math.min(Math.max(this.props.minHeight, height), this.props.maxHeight, rangeHeight);
    }

    this.setState({
      left,
      top,
      width,
      height
    });

    /**
     * @event resize 调整大小时触发
     * @property {object} sender 事件发送对象
     * @property {number} left 水平位置
     * @property {number} top 垂直位置
     * @property {number} width 宽度
     * @property {number} height 高度
     */
    this.props.resize &&
      this.props.resize({
        sender: this,
        left,
        top,
        width,
        height
      });
  }

  /**
   * @method _getRange(proxy) 获取拖拽范围
   * @private
   * @param  {Element} proxy 拖拽代理元素
   * @return {Element} 拖拽范围元素
   */
  getRange(proxy) {
    let range;

    if (typeof this.props.range === 'object') range = this.props.range;
    else if (this.props.range === 'offsetParent') {
      const offsetParent = proxy.offsetParent;
      if (offsetParent)
        range = {
          left: 0,
          top: 0,
          right: offsetParent.offsetWidth,
          bottom: offsetParent.offsetHeight
        };
      else range = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    }

    if (range) {
      range.width = range.right - range.left;
      range.height = range.bottom - range.top;
    }

    return range;
  }

  render() {
    const { handles, handleType, className, disabled } = this.props;
    const { left, top, width, height } = this.state;
    return (
      <div
        className={`m-resizable m-resizable-${handleType} ${className}`}
        style={{ left, top, width, height }}
      >
        {handles.map(handle => {
          return (
            <Draggable
              proxy=""
              disabled={disabled}
              ondragstart={this.onDragStart}
              ondrag={event => this.onDrag(event, handle)}
              key={handle}
            >
              <div className={`resizable_handle resizable_handle-${handle}`}></div>
            </Draggable>
          );
        })}
        {this.props.children}
      </div>
    );
  }
}
