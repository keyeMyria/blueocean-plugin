import React, { Component, PropTypes } from 'react';
import { Icon } from '@jenkins-cd/design-language';
import Autocomplete from 'react-autocomplete';

/**
 * Simple column filter
 *
 * FIXME: Replace react-autocomplete which is broken WRT scrolling, with JDL dropdown
 */
export class ColumnFilter extends Component {
    constructor(props) {
        super(props);
        this.state = { value: props.value, originalValue: props.value ? props.value : '', visible: false };
    }

    componentWillReceiveProps(newProps) {
        if (this.state.value !== newProps.value) {
            this.setState({ value: newProps.value });
        }
    }

    onChange(event, value) {
        const { onChange } = this.props;
        this.setState({ value });
        // only update on enter press or click
        if (event.type === 'select'
            || event.type === 'blur'
            || (event.type === 'keypress' && event.key === 'Enter')) {
            this.setState({ originalValue: value });
            onChange(value);
            setTimeout(() => {
                this.refs.autocomplete.refs.input.blur();
            }, 0);
        }
    }

    clearInput() {
        this.onChange({ type: 'select' }, '');
    }

    focus(e) {
        this.setState({ focused: true });
        e.target.select();
    }

    blur = e => {
        const targetElem = e.target;
        const hoveredElemArray = document.querySelectorAll(':hover');
        const hoveredElem = hoveredElemArray[hoveredElemArray.length - 1];

        this.setState({ focused: false });
        if (targetElem.value === '' && hoveredElem && hoveredElem.className !== 'item selected') {
            this.setState({ value: this.state.originalValue });
        }
    }

    // hack due to strange behavior of triggering onChange from autocomplete when
    // clicking on the input when the dropdown is open and an item is selected
    preventStupidInput(e) {
        if (this.state.visible && e.target.tagName && e.target.tagName.toLowerCase() === 'input') {
            this.refs.autocomplete._ignoreClick = true;
        }
    }

    handleEmptyEnterPressBetter(event) {
        if (this.state.visible && event.key === 'Enter' && this.state.value === '') {
            this.clearInput();
        }
    }

    render() {
        const { placeholder, options } = this.props;
        const { value, focused } = this.state;

        const wrapperStyle = {
            display: 'inline-block',
            width: '100%',
        };

        return (<div className={`ColumnFilter ${value ? '' : 'empty'} ${focused ? 'focused' : ''}`}>
            <Autocomplete
                wrapperStyle={wrapperStyle}
                ref="autocomplete"
                value={value}
                inputProps={{
                    className: 'autocomplete',
                    name: 'Filter',
                    placeholder: focused ? '' : placeholder,
                    onMouseDown: e => this.preventStupidInput(e),
                    onKeyDown: e => this.handleEmptyEnterPressBetter(e),
                    onFocus: e => this.focus(e),
                    onBlur: e => this.blur(e) }}
                menuStyle={{
                    position: 'fixed',
                    overflow: 'auto',
                    maxHeight: '50%' }}
                items={options}
                autoHighlight
                getItemValue={(item) => item}
                shouldItemRender={(item, v) => item.toLowerCase().indexOf(v.toLowerCase()) >= 0}
                onChange={(event, v) => this.setState({ value: v }) || this.onChange(event, v)}
                onSelect={v => this.setState({ value: v }) || this.onChange({ type: 'select' }, v)}
                onMenuVisibilityChange={() => this.setState({ visible: !this.state.visible })}
                renderItem={(item, selected) => (
                  <div className={selected ? 'item selected' : 'item'} key={item} title={item}>{item}</div>
                )}
            />
            <span className="Icon-filter">
                <Icon icon="ContentFilterList" size={15} style={{ verticalAlign: 'top' }} />
            </span>
            <span className="Icon-clear" onClick={() => this.clearInput()}>
                <Icon icon="ContentClear" size={15} style={{ verticalAlign: 'top' }} />
            </span>
          </div>);
    }
}

ColumnFilter.propTypes = {
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.object,
    options: PropTypes.array,
};
