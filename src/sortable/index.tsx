import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

export interface SortableProps {
  onSortEnd?: ({ oldIndex, newIndex, arrayMove }) => void;
}
export interface SortableState {}

const SortableWrap = SortableContainer(({ children }) => children);
const SortableItem = SortableElement(({ children }) => children);

/**
 * @class Sortable
 * @extends Component
 */
class Sortable extends React.PureComponent<SortableProps, SortableState> {
  static Item: typeof Item;
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.onSortEnd &&
      this.props.onSortEnd({
        oldIndex,
        newIndex,
        arrayMove: items => arrayMove(items, oldIndex, newIndex)
      });
  };
  render() {
    return (
      <SortableWrap {...this.props} onSortEnd={this.onSortEnd}>
        {React.Children.only(this.props.children)}
      </SortableWrap>
    );
  }
}

export interface ItemProps {
  children: React.ReactElement;
  index: number;
}
export interface ItemState {}

class Item extends React.Component<ItemProps, ItemState> {
  render() {
    const { index, ...props } = this.props;
    return (
      <SortableItem index={index} {...props}>
        {this.props.children}
      </SortableItem>
    );
  }
}

Sortable.Item = Item;
export default Sortable;
