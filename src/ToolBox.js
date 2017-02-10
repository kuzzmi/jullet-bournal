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
    { label: 'H1',  style: 'header-one' },
    { label: 'H2',  style: 'header-two' },
    { label: 'H3',  style: 'header-three' },
    { label: '"',   style: 'blockquote' },
    { label: '*',   style: 'unordered-list-item' },
    { label: '1.',  style: 'ordered-list-item' },
    { label: '</>', style: 'code-block' },
];

export default (props) => {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const block = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey());
    const start = selection.getStartOffset();
    const end = selection.getEndOffset();
    const blockText = block.getText();
    const selectedText = block.getText().slice(start, end);
    const blockType = block.getType();

    const isEmptyLine =
        start === 0 &&
        start === end &&
        blockText === '';

    return (
          <div className="tools" style={{
              display: isEmptyLine ? 'flex' : 'none'
          }}>
            {
                BLOCK_TYPES.map(type =>
                    <StyleButton
                        key={type.label}
                        isActive={type.style === blockType}
                        label={type.label}
                        onToggle={props.onToggle}
                        style={type.style}
                        />)
            }
          </div>
    );
};
