import React from 'react';
import { Sortable } from '@afe/vesta-dragdrop';

export default class SortableSimple extends React.PureComponent {
  state = {
    items: Array.from({ length: 10 }).map((item, index) => `Item ${index}`)
  };
  onSortEnd = ({ arrayMove }) => {
    this.setState(({ items }) => ({
      items: arrayMove(items)
    }));
  };
  render() {
    return (
      <Sortable onSortEnd={this.onSortEnd}>
        <ul>
          {this.state.items.map((value, index) => (
            <Sortable.Item key={value} index={index}>
              <li className="m-list-item">{value}</li>
            </Sortable.Item>
          ))}
        </ul>
      </Sortable>
    );
  }
}
