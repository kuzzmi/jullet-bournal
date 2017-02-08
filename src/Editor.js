import React, { Component } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import './Editor.css';

function blockStyleFn(contentBlock) {
    const type = contentBlock.getType();
    switch (type) {
        case 'unstyled':
            return 'paragraph';
        default:
            return '';
    }
}

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
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
          <div className="block-tools">
            {BLOCK_TYPES.map((type) =>
              <StyleButton
                key={type.label}
                active={type.style === blockType}
                label={type.label}
                onToggle={props.onToggle}
                style={type.style}
              />
            )}
          </div>
    );
};

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editorState: EditorState.createEmpty()
        };

        this.onChange = (editorState, focus) => this.setState({
            editorState
        }, () => {
            setTimeout(() => this.refs.editor.focus(), 0);
        });
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.toggleBlockType = this.toggleBlockType.bind(this);
        this.onTab = this.onTab.bind(this);
    }

    handleKeyCommand(command) {
        console.log(command);
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    onTab(e) {
        const maxDepth = 4;
        this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
    }

    toggleBlockType(type) {
        const { editorState } = this.state;
        this.onChange(RichUtils.toggleBlockType(editorState, type));
    }

    render() {
        const { editorState } = this.state;

        return (
            <div className="Editor">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={ this.toggleBlockType }
                    />
                <Editor
                    ref="editor"
                    editorState={ editorState }
                    placeholder="Add some text..."
                    handleKeyCommand={ this.handleKeyCommand }
                    blockStyleFn={ blockStyleFn }
                    onChange={ this.onChange }
                    onTab={ this.onTab }
                    />
            </div>
        );
    }
}
