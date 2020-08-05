import React from 'react';
import { Draggable } from '@afe/vesta-dragdrop';

export default class DropNode extends React.PureComponent {
  trigger: React.RefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.trigger = React.createRef();
  }
  render() {
    return (
      <Draggable proxy="self" trigger={this.trigger}>
        <div>
          <div className="u-title" ref={this.trigger}>
            标题
          </div>
          <div className="u-color u-color-primary">请拖动标题栏</div>
        </div>
      </Draggable>
    );
  }
}
