import React from 'react';
import ReactDOM from 'react-dom';
import manager from '../manager';
import dom from '../dom';
import { DraggableData } from '../types';

export interface DroppableProps {
  disabled?: boolean;
  types?: string[];
  dragTargetClassName?: string;
  dragOverClassName?: string;
  children: React.ReactElement;
  ondragenter?: (data: DraggableData) => void;
  ondragover?: (data: DraggableData) => void;
  ondragleave?: (data: DraggableData) => void;
  ondrop?: (data: DraggableData, value: any) => void;
}
export interface DroppableState {}

/**
 * @class Droppable
 * @extends Component
 * @param disabled            => 是否禁用
 * @param types               => 可以接收的draggable类型
 * @param dragTargetClassName => 拖拽目标元素附加此class
 * @param dragOverClassName   => 拖拽在该元素上方时给该元素附加此class
 * @param ondragenter         => 拖拽进入目标元素时触发
 * @param ondragover          => 拖拽在目标元素上方时触发
 * @param ondragleave         => 拖拽离开目标元素时触发
 * @param ondrop              => 拖拽放置时触发
 */
export default class Droppable extends React.PureComponent<DroppableProps, DroppableState> {
  static defaultProps = {
    disabled: false,
    dragTargetClassName: 'z-dragTarget',
    dragOverClassName: 'z-dragOver'
  };

  constructor(props) {
    super(props);

    manager.droppables.push(this);
  }

  /**
   * @protected
   */
  componentWillUnmount() {
    manager.droppables.splice(manager.droppables.indexOf(this), 1);
  }

  /**
   * @private
   */
  dragenter(origin) {
    const target = ReactDOM.findDOMNode(this);
    dom.addClass(target, this.props.dragOverClassName);

    this.props.ondragenter &&
      this.props.ondragenter(
        Object.assign(
          {
            sender: this,
            origin,
            cancel: origin.cancel
          },
          manager
        )
      );
  }
  /**
   * @private
   */
  dragover(origin) {
    this.props.ondragover &&
      this.props.ondragover(
        Object.assign(
          {
            sender: this,
            origin,
            cancel: origin.cancel
          },
          manager
        )
      );
  }
  /**
   * @private
   */
  dragleave(origin) {
    const target = ReactDOM.findDOMNode(this);
    target && dom.delClass(target, this.props.dragOverClassName);

    this.props.ondragleave &&
      this.props.ondragleave(
        Object.assign(
          {
            sender: this,
            origin,
            cancel: origin.cancel
          },
          manager
        )
      );
  }
  /**
   * @private
   */
  drop(origin) {
    const target = ReactDOM.findDOMNode(this);
    target && dom.delClass(target, this.props.dragOverClassName);

    this.props.ondrop &&
      this.props.ondrop(
        Object.assign(
          {
            sender: this,
            origin,
            cancel: origin.cancel
          },
          manager
        ),
        manager.value
      );
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children));
  }
}
