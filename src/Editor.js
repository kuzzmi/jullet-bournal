import React, { Component } from 'react';
import {
    Editor,
    EditorState,
    RichUtils,
    Modifier,
    convertFromRaw,
    getDefaultKeyBinding,
} from 'draft-js';
import './Editor.css';

import BlockStyleControls from './ToolBox.js';

function blockStyleFn(contentBlock) {
    const type = contentBlock.getType();
    switch (type) {
        case 'unstyled':
            return 'paragraph';
        default:
            return '';
    }
}

function insertNewline(editorState) {
    var contentState = Modifier.splitBlock(
        editorState.getCurrentContent(),
        editorState.getSelection()
    );
    return EditorState.push(editorState, contentState, 'split-block');
}

function keyBindingFn(e) {
    if (e.keyCode === 78 /* `N` key */ && e.nativeEvent.altKey) {
        return 'add-new-page';
    }
    return getDefaultKeyBinding(e);
}

const initialContentState = {
    entityMap: {},
    blocks: [{
        text: 'Your words',
        type: 'unstyled',
    }],
};

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editorState:
                props.page || EditorState.createWithContent(
                    convertFromRaw(initialContentState)
                )
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
        this.createPage       = this.createPage.bind(this);
    }

    componentWillReceiveProps({ page }) {
        if (page !== this.props.page) {
            this.onChange(page || EditorState.createEmpty());
        }
    }

    handleKeyCommand(command) {
        console.log(command);

        const { editorState } = this.state;

        switch (command) {
            case 'add-new-page':
                if (this.createPage()) {
                    return 'handled';
                } else {
                    break;
                }
            default:
                break;
        }

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

    createPage() {
        const { editorState } = this.state;
        const selection = editorState.getSelection();
        const block = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey());
        const start = selection.getStartOffset();
        const end = selection.getEndOffset();
        const selectedText = block.getText().slice(start, end);
        if (!selectedText) {
            return false;
        }

        const contentState = {
            entityMap: {},
            blocks: [{
                text: selectedText,
                type: 'header-one',
            }, {
                text: '',
                type: 'unstyled',
            }],
        };

        this.props.onCreatePage({
            editorState: EditorState.createWithContent(convertFromRaw(contentState))
        });

        return true;
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
                    editorState={ editorState }
                    onToggle={ this.toggleBlockType }
                    />
                <Editor
                    ref="editor"
                    editorState={ editorState }
                    handleKeyCommand={ this.handleKeyCommand }
                    keyBindingFn={ keyBindingFn }
                    blockStyleFn={ blockStyleFn }
                    onChange={ this.onChange }
                    handleReturn={ this.onReturn }
                    onTab={ this.onTab }
                    />
            </div>
        );
    }
}
