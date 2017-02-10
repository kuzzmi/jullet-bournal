import React, { Component } from 'react';
import './App.css';

import Editor from './Editor.js';

import { EditorState } from 'draft-js';

class App extends Component {
    state = {
        pages: {},
        pageId: 0,
    };

    getPage = () => this.state.pages[this.state.pageId];

    prevPage = () => this.setState({ pageId: this.state.pageId - 1 });

    nextPage = () => this.setState({ pageId: this.state.pageId + 1 });

    createPage = ({ editorState }) => {
        const { pageId, pages } = this.state;
        this.setState({
            pages: {
                ...pages,
                [pageId + 1]: editorState,
            },
            pageId: pageId + 1,
        });
    }

    savePage = ({ editorState }) => {
        const { pageId, pages } = this.state;
        this.setState({
            pages: {
                ...pages,
                [pageId]: editorState,
            },
        });
    }

    goToPage = pageId => this.setState({ pageId });

    renderPages = () => {
        const { pageId, pages } = this.state;

        return (
            <ul>
            { Object.keys(pages).map((id, i) => {
                return (
                    <li key={ i } onClick={ () => this.goToPage(id) }>
                    { pageId === id && '>' } Note #{ i }
                    </li>
                );
            })}
            </ul>
        );
    }

    render() {
        const page = this.getPage();
        return (
            <div className="App">
                <div>
                    <div>
                        <button onClick={ this.prevPage }>Prev</button>
                        <button onClick={ this.nextPage }>Next</button>
                    </div>
                    { this.renderPages() }
                </div>
                <Editor
                    page={ page }
                    onCreatePage={ this.createPage }
                    onChange={ this.savePage }
                    />
            </div>
        );
    }
}

export default App;
