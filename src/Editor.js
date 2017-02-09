import React, { Component } from 'react';
import {
    Editor,
    EditorState,
    RichUtils,
    Modifier,
} from 'draft-js';
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
    { label: '"', style: 'blockquote' },
    { label: '*', style: 'unordered-list-item' },
    { label: '1.', style: 'ordered-list-item' },
    { label: '</>', style: 'code-block' },
];

const BlockStyleControls = (props) => {
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

function insertNewline(editorState) {
    var contentState = Modifier.splitBlock(
        editorState.getCurrentContent(),
        editorState.getSelection()
    );
    return EditorState.push(editorState, contentState, 'split-block');
}

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editorState: props.page || EditorState.createEmpty()
        };

        this.onChange = (editorState, focus) => {
            props.onChange({ editorState });
            this.setState({
                editorState
            }, () => {
                setTimeout(() => this.refs.editor.focus(), 0);
            });
        };

        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.toggleBlockType  = this.toggleBlockType.bind(this);
        this.onTab            = this.onTab.bind(this);
        this.onReturn         = this.onReturn.bind(this);
    }

    componentWillReceiveProps({ page }) {
        if (page !== this.props.page) {
            this.onChange(page || EditorState.createEmpty());
        }
    }

    handleKeyCommand(command) {
        const { editorState } = this.state;
        console.log(command);
        const newState = RichUtils.handleKeyCommand(editorState, command);
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

    onReturn(e) {
        const { editorState } = this.state;
        const block = RichUtils.getCurrentBlockType(editorState);

        // reset block style if it was a header
        if (block.indexOf('header') === 0) {
            e.preventDefault();
            const cleanEditor = RichUtils.toggleBlockType(insertNewline(editorState), block);
            this.onChange(cleanEditor);
            return 'handled';
        }

        // TODO: clean 'list' style if the bullet is empty (only bullet)

        return 'not-handled';
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
                    handleReturn={ this.onReturn }
                    onTab={ this.onTab }
                    />
            </div>
        );
    }
}
