import React, { Component } from 'react';

class StyleButton extends Component {
    constructor(props) {
        super(props);
        this.onToggle = e => {
            this.props.onToggle(this.props.style);
            e.preventDefault();
        };
    }

    render() {
        const { isActive, label } = this.props;
        let className = 'styleButton';
        if (isActive) {
            className += ' active';
        }

        return (
            <span className={ className } onMouseDown={ this.onToggle }>
                { label }
            </span>
        );
    }
}


const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: '"', style: 'blockquote' },
    { label: '*', style: 'unordered-list-item' },
    { label: '1.', style: 'ordered-list-item' },
    { label: '</>', style: 'code-block' },
];

export default (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
          <div className="tools">
            {BLOCK_TYPES.map((type) =>
              <StyleButton
                key={type.label}
                isActive={type.style === blockType}
                label={type.label}
                onToggle={props.onToggle}
                style={type.style}
              />
            )}
          </div>
    );
};
