import React, { Component } from 'react';

class TitleInput extends React.Component {

    handleKeyPress = e => {
        /* enter key */
        if (e.keyCode === 13) {
            e.preventDefault();

            this.props.onEnterPress(e);
        }
    };

    handleTitleChange = e => this.props.onChange(e.target.value);

    focus() {
        this.input.focus();
    }

    render() {
        const {
            onChange,
            placeholder,
            title,
        } = this.props;

        return (
            <input
                ref={ e => e && ( this.input = e ) }
                value={ title }
                placeholder="Page Title"
                className="titleInput"
                onChange={ this.handleTitleChange }
                onKeyDown={ this.handleKeyPress }
                />
        );
    }
}

export default TitleInput;
