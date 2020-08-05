import React from 'react';
import ReactDOM from 'react-dom';
import manager from '../manager';
import dom, { addEvent, removeEvent, getComputedStyle, getPosition, getSize } from '../dom';
import { DraggableData } from '../types';

export interface DraggableProps {
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
export interface DraggableState {
  proxyVisible: boolean;
}

/**
 * @class Draggable
 * @extends Component
 * @param proxy               => 拖拽代理，即拖拽时移动的元素。默认值为`clone`，拖拽时拖起自身的一个拷贝；当值为`self`，拖拽时直接拖起自身。也可以直接传入一个元素或函数
 * @param type                => 拖拽类型，droppable需接收
 * @param trigger             => 自定义拖拽节点
 * @param value               => 拖拽时需要传递的值
 * @param disabled            => 是否禁用
 * @param sourceClassName     => 拖拽时给起始元素附加此class
 * @param proxyClassName      => 拖拽时给代理元素附加此class
 * @param restrict            => 拖拽约束
 * @param ondragstart         => 拖拽开始时触发
 * @param ondrag              => 正在拖拽时触发
 * @param ondragend           => 拖拽结束时触发
 */
export default class Draggable extends React.PureComponent<DraggableProps, DraggableState> {
  customProxy: React.RefObject<HTMLDivElement>;
  droppables: any[];

  static defaultProps = {
    proxy: 'clone',
    value: undefined,
    disabled: false,
    sourceClassName: 'z-dragSource',
    proxyClassName: 'z-dragProxy'
  };

  state = {
    proxyVisible: false
  };

  constructor(props) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.cancel = this.cancel.bind(this);

    this.customProxy = React.createRef();
  }

  componentDidMount() {
    if (this.props.trigger && this.props.trigger.current) {
      addEvent(this.props.trigger.current, 'mousedown', this.onMouseDown);
    }
  }

  onMouseDown(e) {
    if (this.props.disabled) return;
    e.preventDefault(); // 阻止浏览器的默认行为

    // 鼠标坐标从MouseDown开始算，防止出现第一次移动的误差
    Object.assign(manager, {
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      startX: e.clientX,
      startY: e.clientY,
      dragX: 0,
      dragY: 0
    });

    // 绑定事件
    addEvent(document, 'mousemove', this.onMouseMove);
    addEvent(document, 'mouseup', this.onMouseUp);
  }

  onMouseMove(e) {
    e.preventDefault();

    Object.assign(manager, {
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      dragX: e.clientX - manager.startX,
      dragY: e.clientY - manager.startY
    });

    if (manager.dragging === false) this.onMouseMoveStart();
    else this.onMouseMoving(e);
  }

  /**
   * @method onMouseMoveStart(e) 处理第一次鼠标移动事件
   * @param  {MouseEvent} e 鼠标事件
   * @return {void}
   */
  onMouseMoveStart() {
    const proxy = this.getProxy();

    // 代理元素的位置从MouseMoveStart开始算，这样在MouseDown中也可以预先处理位置
    // 获取初始的left和top值
    const computedStyle = proxy ? getComputedStyle(proxy) : {};
    if (!computedStyle.left || computedStyle.left === 'auto') computedStyle.left = '0px';
    if (!computedStyle.top || computedStyle.top === 'auto') computedStyle.top = '0px';

    Object.assign(manager, {
      dragging: true,
      proxy,
      value: this.props.value,
      type: this.props.type,
      startLeft: +computedStyle.left.slice(0, -2),
      startTop: +computedStyle.top.slice(0, -2),
      droppable: undefined
    });

    manager.left = manager.startLeft;
    manager.top = manager.startTop;

    this.dragStart();
  }

  /**
   * @method onMouseMoving(e) 处理后续鼠标移动事件
   * @param  {MouseEvent} e 鼠标事件
   * @return {void}
   */
  onMouseMoving(e) {
    // 拖拽约束
    const next = this.restrict(manager);
    // 设置位置
    if (manager.proxy) {
      manager.proxy.style.left = next.left + 'px';
      manager.proxy.style.top = next.top + 'px';
    }
    // 更新当前位置
    manager.left = next.left;
    manager.top = next.top;

    this.drag();
    if (!manager.dragging) return;

    // for Droppable
    let pointElement = null;
    if (manager.proxy) {
      manager.proxy.style.display = 'none';
      pointElement = document.elementFromPoint(e.clientX, e.clientY);
      manager.proxy.style.display = '';
    } else pointElement = document.elementFromPoint(e.clientX, e.clientY);

    let pointDroppable = null;
    let droppables = manager.droppables;
    // 拖放约束
    droppables = manager.droppables.filter(droppable => {
      if (!droppable.props.types) return true;
      if (droppable.props.types.includes(this.props.type)) return true;
      return false;
    });
    // add dragTargetClassName
    droppables.forEach(droppable => {
      const target = ReactDOM.findDOMNode(droppable);
      dom.addClass(target, droppable.props.dragTargetClassName);
    });
    this.droppables = droppables;
    while (pointElement) {
      pointDroppable = droppables.find(
        droppable => ReactDOM.findDOMNode(droppable) === pointElement
      );

      if (pointDroppable) break;
      else pointElement = pointElement.parentElement;
    }

    if (manager.droppable !== pointDroppable) {
      manager.droppable && manager.droppable.dragleave(this);
      if (!manager.dragging) return;
      pointDroppable && pointDroppable.dragenter(this);
      if (!manager.dragging) return;
      manager.droppable = pointDroppable;
    }

    // dragEnter之后要dragOver
    pointDroppable && pointDroppable.dragover(this);
  }
  /**
   * @method restrict(manager) 拖拽约束函数
   * @param  {params} 拖拽参数
   * @return {left, top} 拖拽代理元素计算后的left和top位置
   */
  restrict(params) {
    if (this.props.restrict && typeof this.props.restrict === 'function') {
      return this.props.restrict(params);
    }
    return {
      left: params.startLeft + params.dragX,
      top: params.startTop + params.dragY
    };
  }

  onMouseUp() {
    if (manager.dragging) {
      manager.droppable && manager.droppable.drop(this);
      this.cancel();
      this.setState({ proxyVisible: false });
    }

    // 解绑事件
    removeEvent(document, 'mousemove', this.onMouseMove);
    removeEvent(document, 'mouseup', this.onMouseUp);
  }

  /**
   * @method getProxy() 获取拖拽代理
   * @return {Element} 拖拽代理元素
   */
  getProxy() {
    let proxy;
    const source = ReactDOM.findDOMNode(this);

    if (this.props.proxy === 'self') proxy = source;
    else if (this.props.proxy === 'clone') {
      proxy = source.cloneNode(true);
      this.setProxyFixed(proxy, getPosition(source));
      const size = getSize(source);
      proxy.style.width = size.width + 'px';
      proxy.style.height = size.height + 'px';
      source.parentElement.appendChild(proxy);
    } else if (typeof this.props.proxy === 'function' || React.isValidElement(this.props.proxy)) {
      proxy = ReactDOM.findDOMNode(this.customProxy.current);
      this.setProxyFixed(proxy, getPosition(source));
      this.setState({ proxyVisible: true });
    }

    proxy && this.initProxy(proxy);
    return proxy;
  }
  /**
   * @method setProxyFixed() 将拖拽代理的position设置fixed并设置初始位置
   * @param  {Element} proxy 拖拽代理元素
   * @param  {position=...} position 拖拽代理的初始位置
   * @return {void}
   */
  setProxyFixed(proxy, position = { left: 0, top: 0 }) {
    proxy.style.left = position.left + 'px';
    proxy.style.top = position.top + 'px';
    proxy.style.zIndex = '9999';
    proxy.style.position = 'fixed';
    proxy.style.display = '';
  }
  /**
   * @method initProxy() 初始化拖拽代理
   * @return {void}
   */
  initProxy(proxy) {
    // 如果position为static，则设置为relative，保证可以移动
    if (getComputedStyle(proxy, 'position') === 'static') proxy.style.position = 'relative';
  }

  /**
   * @method cancel() 取消拖拽操作
   * @return {void}
   */
  cancel() {
    this.dragEnd();

    Object.assign(manager, {
      dragging: false,
      value: undefined,
      type: undefined,
      proxy: undefined,
      range: undefined,
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      startX: 0,
      startY: 0,
      dragX: 0,
      dragY: 0,
      startLeft: 0,
      startTop: 0,
      left: 0,
      top: 0,
      droppable: undefined
    });

    // remove dragTargetClassName
    this.droppables.forEach(droppable => {
      const target = ReactDOM.findDOMNode(droppable);
      dom.delClass(target, droppable.props.dragTargetClassName);
    });
  }
  /**
   * @private
   */
  dragStart() {
    const source = ReactDOM.findDOMNode(this);
    dom.addClass(source, this.props.sourceClassName);
    manager.proxy && dom.addClass(manager.proxy, this.props.proxyClassName);

    this.props.ondragstart &&
      this.props.ondragstart(
        Object.assign(
          {
            sender: this,
            origin: this,
            source,
            cancel: this.cancel
          },
          manager
        )
      );
  }
  /**
   * @private
   */
  drag() {
    const source = ReactDOM.findDOMNode(this);
    this.props.ondrag &&
      this.props.ondrag(
        Object.assign(
          {
            sender: this,
            origin: this,
            source,
            cancel: this.cancel
          },
          manager
        )
      );
  }
  /**
   * @private
   */
  dragEnd() {
    const source = ReactDOM.findDOMNode(this);
    source && dom.delClass(source, this.props.sourceClassName);

    this.props.ondragend &&
      this.props.ondragend(
        Object.assign(
          {
            sender: this,
            origin: this,
            source
          },
          manager
        )
      );

    if (manager.proxy) {
      if (this.props.proxy === 'clone') manager.proxy.parentElement.removeChild(manager.proxy);

      dom.delClass(manager.proxy, this.props.proxyClassName);
    }
  }

  render() {
    let customProxy;
    if (typeof this.props.proxy === 'function') customProxy = this.props.proxy();
    if (React.isValidElement(this.props.proxy)) customProxy = this.props.proxy;
    return (
      <>
        {this.props.trigger
          ? React.cloneElement(React.Children.only(this.props.children))
          : React.cloneElement(React.Children.only(this.props.children), {
              onMouseDown: this.onMouseDown
            })}
        {customProxy
          ? React.cloneElement(customProxy, {
              ref: this.customProxy,
              style: {
                display: this.state.proxyVisible ? '' : 'none'
              }
            })
          : null}
      </>
    );
  }
}
