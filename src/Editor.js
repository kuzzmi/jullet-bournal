import React, { Component } from 'react';
import {
    Editor,
    EditorState,
    RichUtils,
    Modifier,
    getDefaultKeyBinding,
} from 'draft-js';
import './Editor.css';

import BlockStyleControls from './ToolBox.js';
import TitleInput from './TitleInput.js';

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

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...props.page,
        };

        this.onChange = (editorState, focus) => {
            const { title, id } = this.state;

            props.onChange({ editorState, title, id });

            this.setState({ editorState }, () => {
                focus && setTimeout(this.focusEditor, 0);
            });
        };

        this.onChangeTitle = title => this.setState({ title });
        this.focusEditor = () => this.refs.editor.focus();

        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.toggleBlockType  = this.toggleBlockType.bind(this);
        this.onTab            = this.onTab.bind(this);
        this.onReturn         = this.onReturn.bind(this);
        this.createPage       = this.createPage.bind(this);
    }

    componentDidMount() {
        const { title } = this.state;
        if (!title) {
            this.refs.titleInput.focus();
        } else {
            this.focusEditor();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.page.id !== this.state.id) {
            this.setState({
                ...nextProps.page,
            });
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
        const { editorState, id } = this.state;
        const selection = editorState.getSelection();
        // const block = editorState
        //     .getCurrentContent()
        //     .getBlockForKey(selection.getStartKey());
        // const start = selection.getStartOffset();
        // const end = selection.getEndOffset();
        // const selectedText = block.getText().slice(start, end);

        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'LINK',
            'MUTABLE',
            { href: 'http://www.zombo.com' }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const contentStateWithLink = Modifier.applyEntity(
            contentState,
            selection,
            entityKey
        );

        // if (!selectedText) {
        //     return false;
        // }

        // this.props.onCreatePage({
        //     editorState: EditorState.createEmpty(),
        //     title: selectedText,
        //     id
        // });

        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithLink });

        this.onChange(newEditorState);

        // return true;
    }

    toggleBlockType(type) {
        const { editorState } = this.state;
        this.onChange(RichUtils.toggleBlockType(editorState, type));
    }

    render() {
        const { title, editorState } = this.state;

        return (
            <div className="Editor">
                <TitleInput
                    ref="titleInput"
                    onChange={ this.onChangeTitle }
                    title={ title }
                    onEnterPress={ this.focusEditor }
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
                // <BlockStyleControls
                //     editorState={ editorState }
                //     onToggle={ this.toggleBlockType }
                //     />
