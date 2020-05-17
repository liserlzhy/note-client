import React from 'react'
import { inlineStyleButtons, blockTypeButtons } from './constants'
import { RichUtils } from 'draft-js'
import './style.less'

function EditorToolBar(props) {
  const { editorState, updateEditorState } = props

  const renderInlineStyleButton = (value, style, icon) => {
    const currentInlineStyle = editorState.getCurrentInlineStyle()
    let className = ''
    if (currentInlineStyle.has(style)) {
      className = 'active'
    }
    return (
      <div key={style} className={`icon-container ${className}`} data-style={style} onMouseDown={toggleInlineStyle}>
        {icon ? <i className={`iconfont ${icon}`} /> : value}
      </div>
    )
  }  

  const renderBlockButton = (value, block, icon) => {
    const currentBlockType = RichUtils.getCurrentBlockType(editorState)
    let className = ''
    if (currentBlockType === block) {
      className = 'active'
    }

    return (
      <span key={block} className={`icon-container ${className}`} data-block={block} onMouseDown={toggleBlockType}>
        {icon ? <i className={`iconfont ${icon}`} /> : value}
      </span>
    )
  }

  const toggleInlineStyle = (event) => {
    event.preventDefault()
    let style = event.currentTarget.getAttribute('data-style')
    updateEditorState(RichUtils.toggleInlineStyle(editorState, style))
  }
  
  const toggleBlockType = (event) => {
    event.preventDefault()
    let block = event.currentTarget.getAttribute('data-block')
    updateEditorState(RichUtils.toggleBlockType(editorState, block))
  }
  
  return (
    <div className="toolbar">
      { inlineStyleButtons.map(button => renderInlineStyleButton(button.value, button.style, button.icon))}
      { blockTypeButtons.map(button => renderBlockButton(button.value, button.block, button.icon))}
    </div>
  )
}

export default EditorToolBar
