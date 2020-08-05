import React from 'react';

function pickTypes(e) {
  return e.dataTransfer ? e.dataTransfer.types : [];
}

export interface FileUploadProps {
  children: React.ReactElement;
  disabled?: boolean;
  dragOverClassName?: string;
  types?: string[];
  ondragenter?: (event) => void;
  ondragover?: (event) => void;
  ondragleave?: (event) => void;
  ondrop?: (event, files) => void;
}
export interface FileUploadState {
  over: boolean;
}

/**
 * @class FileUpload
 * @extends Component
 * @param disabled            => 是否禁用
 * @param dragOverClassName   => 拖拽在该元素上方时给该元素附加此class
 * @param ondragenter         => 拖拽进入目标元素时触发
 * @param ondragover          => 拖拽在目标元素上方时触发
 * @param ondragleave         => 拖拽离开目标元素时触发
 * @param ondrop              => 拖拽放置时触发
 */
export default class FileUpload extends React.PureComponent<FileUploadProps, FileUploadState> {
  static defaultProps = {
    disabled: false,
    dragOverClassName: 'z-dragOver',
    types: ['Files']
  };

  constructor(props) {
    super(props);
    this.state = {
      over: false
    };

    this.onDrop = this.onDrop.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
  }

  onDragEnter(e) {
    e.preventDefault();
    if (this.state.over) return;
    if (!this.allowed(pickTypes(e))) return;
    if (typeof this.props.ondragenter === 'function') this.props.ondragenter(e);
    this.setState({ over: true });
  }

  onDragOver(e) {
    e.preventDefault();
    if (!this.allowed(pickTypes(e))) return;
    if (typeof this.props.ondragover === 'function') this.props.ondragover(e);
  }

  onDragLeave(e) {
    e.preventDefault();
    if (!this.allowed(pickTypes(e))) return;
    this.setState({ over: false });
    if (typeof this.props.ondragleave === 'function') this.props.ondragleave(e);
  }

  onDrop(e) {
    e.preventDefault();
    if (!this.allowed(pickTypes(e))) return;
    this.setState({ over: false });
    if (typeof this.props.ondrop === 'function') this.props.ondrop(e, e.dataTransfer.files);
  }

  allowed(attemptingTypes) {
    if (this.props.disabled) return false;
    if (!this.props.types) return true;
    return [].concat(this.props.types).reduce((sum, type) => {
      if (attemptingTypes.indexOf(type) >= 0) return true;
      return sum;
    }, false);
  }

  render() {
    let classes = this.props.children.props.className || '';
    if (this.state.over) classes = `${classes} ${this.props.dragOverClassName}`;
    return React.cloneElement(React.Children.only(this.props.children), {
      className: classes,
      onDrop: this.onDrop,
      onDragOver: this.onDragOver,
      onDragEnter: this.onDragEnter,
      onDragLeave: this.onDragLeave,
      onDragExit: this.onDragLeave
    });
  }
}
