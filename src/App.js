import React, { Component } from 'react';
import './App.css';

import Editor from './Editor.js';
import { EditorState } from 'draft-js';

class App extends Component {
    state = {
        pages: {
            0: {
                id: 0,
                title: 'Hello World!',
                editorState: EditorState.createEmpty(),
            },
        },
        pageId: 0,
    };

    getPage = () => this.state.pages[this.state.pageId];

    prevPage = () => this.setState({ pageId: this.state.pageId - 1 });

    nextPage = () => this.setState({ pageId: this.state.pageId + 1 });

    createPage = page => {
        const id = page.id + 1;
        this.updatePage({ ...page, id })
    }

    updatePage = page => {
        this.setState({
            pages: {
                ...this.state.pages,
                [page.id]: {
                    ...page,
                },
            },
        });
    }

    goToPage = pageId => this.setState({ pageId });

    renderPages = () => {
        const { pageId, pages } = this.state;

        console.log(pages);

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
                <div className="grid-container">
                    <div className="prefix-10 grid-80 mobile-prefix-0 mobile-grid-100">
                        <Editor
                            page={ page }
                            onCreatePage={ this.createPage }
                            onChange={ this.updatePage }
                            />
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
