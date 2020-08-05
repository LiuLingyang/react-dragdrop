import React from 'react';
import { Sortable } from '@afe/vesta-dragdrop';

export default class SortableSimple extends React.PureComponent {
  state = {
    items: Array.from({ length: 30 }).map((item, index) => `Item ${index}`)
  };
  onSortEnd = ({ arrayMove }) => {
    this.setState(({ items }) => ({
      items: arrayMove(items)
    }));
  };
  render() {
    return (
      <Sortable axis="xy" onSortEnd={this.onSortEnd}>
        <ul style={{ display: 'flex', flexWrap: 'wrap', width: 800 }}>
          {this.state.items.map((value, index) => (
            <Sortable.Item key={value} index={index}>
              <li
                className="m-list-item"
                style={{
                  width: 150,
                  margin: 5
                }}
              >
                {value}
              </li>
            </Sortable.Item>
          ))}
        </ul>
      </Sortable>
    );
  }
}
