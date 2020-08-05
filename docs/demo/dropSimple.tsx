import React from 'react';
import { Draggable, Droppable } from '@afe/vesta-dragdrop';

export default class DropSimple extends React.PureComponent {
  state = {
    value: undefined
  };
  render() {
    return (
      <>
        <Draggable value="success">
          <div className="u-color u-color-success">拖我</div>
        </Draggable>
        <Draggable value="warning">
          <div className="u-color u-color-warning">拖我</div>
        </Draggable>
        <Draggable value="error">
          <div className="u-color u-color-error">拖我</div>
        </Draggable>
        <br />
        <Droppable
          ondrop={(event, value) => {
            this.setState({ value });
          }}
        >
          <div className={`u-color u-color-primary u-color-${this.state.value}`}>放到这里</div>
        </Droppable>
      </>
    );
  }
}
