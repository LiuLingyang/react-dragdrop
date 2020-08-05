import { DraggableData } from './types';

const manager: DraggableData = {
  dragging: false, // 是否正在拖拽
  value: undefined, // 拖拽携带的数据
  type: undefined, // 拖拽类型
  source: undefined, // 拖拽起始元素
  proxy: undefined, // 拖拽代理元素
  screenX: 0, // 鼠标指针相对于屏幕的水平坐标
  screenY: 0, // 鼠标指针相对于屏幕的垂直坐标
  clientX: 0, // 鼠标指针相对于浏览器的水平坐标
  clientY: 0, // 鼠标指针相对于浏览器的垂直坐标
  pageX: 0, // 鼠标指针相对于页面的水平坐标
  pageY: 0, // 鼠标指针相对于页面的垂直坐标
  startX: 0, // 拖拽开始时鼠标指针的水平坐标
  startY: 0, // 拖拽开始时鼠标指针的垂直坐标
  dragX: 0, // 拖拽时鼠标指针相对于起始坐标的水平位移
  dragY: 0, // 拖拽时鼠标指针相对于起始坐标的垂直位移
  startLeft: 0, // 拖拽开始时代理元素的left值
  startTop: 0, // 拖拽开始时代理元素的top值
  left: 0, // 拖拽时代理元素的left值
  top: 0, // 拖拽时代理元素的top值
  droppable: undefined,
  droppables: [],
  range: undefined
};

export default manager;
