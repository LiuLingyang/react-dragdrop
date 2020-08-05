import React from 'react';
import { Draggable, Droppable } from '@afe/vesta-dragdrop';

export default class DropRestrict extends React.PureComponent {
  state = {
    value1: undefined,
    value2: undefined,
    value3: undefined
  };
  render() {
    return (
      <>
        <Draggable value="success" type="success">
          <div className="u-color u-color-success">拖我</div>
        </Draggable>
        <Draggable value="warning" type="warning">
          <div className="u-color u-color-warning">拖我</div>
        </Draggable>
        <Draggable value="error" type="error">
          <div className="u-color u-color-error">拖我</div>
        </Draggable>
        <br />
        <Droppable
          types={['success']}
          ondrop={(event, value1) => {
            this.setState({ value1 });
          }}
        >
          <div className={`u-color u-color-primary u-color-${this.state.value1}`}>放到这里</div>
        </Droppable>
        <Droppable
          types={['warning']}
          ondrop={(event, value2) => {
            this.setState({ value2 });
          }}
        >
          <div className={`u-color u-color-primary u-color-${this.state.value2}`}>放到这里</div>
        </Droppable>
        <Droppable
          types={['error']}
          ondrop={(event, value3) => {
            this.setState({ value3 });
          }}
        >
          <div className={`u-color u-color-primary u-color-${this.state.value3}`}>放到这里</div>
        </Droppable>
      </>
    );
  }
}
