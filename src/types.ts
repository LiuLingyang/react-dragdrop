export type DraggableEventHandler = (e: MouseEvent) => void;
export type EventHandler<T> = (e: T) => void | false;

export type DraggableData = {
  dragging: boolean;
  value: any;
  type: string;
  source: HTMLElement;
  proxy: HTMLElement;
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  startX: number;
  startY: number;
  dragX: number;
  dragY: number;
  startLeft: number;
  startTop: number;
  left: number;
  top: number;
  droppable: any;
  droppables: any[];
  range: Function | { left: number; right: number; top: number; bottom: number };
};
