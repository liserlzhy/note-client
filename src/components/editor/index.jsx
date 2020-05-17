import React, { Component } from 'react'
import { Editor, EditorState, RichUtils, KeyBindingUtil, getDefaultKeyBinding, convertToRaw, convertFromRaw, SelectionState, Modifier } from 'draft-js'
import EditorToolBar from '../editor-toolbar'
import { NavBar, Icon, Toast } from 'antd-mobile'
import { formatTime } from '../../assets/js'
import { reqAddNote, reqUpdateNote, reqGetNote } from '../../api'
import './style.less'

function keyBindingFunction(event) {

  // ctrl + x
  if (KeyBindingUtil.hasCommandModifier(event) && (event.keyCode === 88)) {
    return 'strikethrough'
  }  

  // ctrl + h
  if (KeyBindingUtil.hasCommandModifier(event) && (event.keyCode === 72)) {
    return 'highlight';
  }

  // ctrl + [
  if (KeyBindingUtil.hasCommandModifier(event) && event.keyCode === 219) {
    return 'header-one';
  }

  // ctrl + ]
  if (KeyBindingUtil.hasCommandModifier(event) && event.keyCode === 221) {
    return 'header-two';
  }

  // ctrl + 7
  if (KeyBindingUtil.hasCommandModifier(event) && event.keyCode === 55) { 
    return 'blockquote';
  }

  // ctrl + 8
  if (KeyBindingUtil.hasCommandModifier(event) && event.keyCode === 56) {
    return 'unordered-list';
  }

  // ctrl + 9
  if (KeyBindingUtil.hasCommandModifier(event) && event.keyCode === 57) {
    return 'ordered-list';
  }

  return getDefaultKeyBinding(event)

}

function moveSelectionToEnd(editorState) {
  const content = editorState.getCurrentContent()
  const blockMap = content.getBlockMap()
  const key = blockMap.last().getKey()
  const length = blockMap.last().getLength()
  const selection = new SelectionState({
      anchorKey: key,
      anchorOffset: length,
      focusKey: key,
      focusOffset: length,
  })
  return EditorState.acceptSelection(editorState, selection)
}

class ReactEditor extends Component {
  constructor(props) {
    super(props)
    this.setDomEditorRef = ref => this.domEditor = ref
    this.state = {
      editorState: EditorState.createEmpty(),
      updateTime: this.props.location.state,
      isLoading: true,
      resNoteId: ''
    }
  }

  onChange = (editorState) => {
    this.setState({ editorState })
  }

  async componentDidMount() {
    const id = this.props.match.params.id
    if (id === 'add') {
      return this.setState({
        isLoading: false
      })
    }

    const res = await reqGetNote({_id: id})
    if (res.data.err === 0) {
      const rawContentState = JSON.parse(res.data.data)
      this.setState({
        editorState:  EditorState.createWithContent(convertFromRaw(rawContentState)),
        isLoading: false
      })
    } else {
      this.props.history.replace('/404')
    }
  }

  save = async () => {
    const { editorState, resNoteId } = this.state
    let _id = this.props.match.params.id
    let category = this.props.match.params.category
    const contentState = editorState.getCurrentContent()
    const rawContentState =  convertToRaw(contentState)
    const empty = rawContentState.blocks.every(row => row.text.trim() === '')

    if (empty) return  Toast.info('empty !!!', 1);

    if (_id === 'add' ) {
      if (category === '全部分类') category = '未分类'
      if (!resNoteId) {
        const res = await reqAddNote({ rawContentState: JSON.stringify(rawContentState), category })
        if (res.data.err === 0) {
          this.setState({ resNoteId: res.data.data })
          return Toast.success('添加成功', 1, ()=>{}, false)
        }
        return 
      } else {
        _id = resNoteId
      }
    } 

    const res = await reqUpdateNote({ _id, rawContentState: JSON.stringify(rawContentState) })
    if (res.data.err === 0) return Toast.success('更新成功', 1)

    Toast.fail('保存失败', 1);
    
  }

  updateEditorState = (editorState) => this.setState({editorState})
  // 键盘监听
  handleKeyCommand = (command) => {
    let editorState = RichUtils.handleKeyCommand(this.state.editorState, command)

    if (!editorState && command === 'strikethrough') {
      editorState = RichUtils.toggleInlineStyle(this.state.editorState, 'STRIKETHROUGH')
    }

    if (!editorState && command === 'header-one') {
      editorState = RichUtils.toggleBlockType(this.state.editorState, 'header-one')
    }

    if (!editorState && command === 'header-two') {
      editorState = RichUtils.toggleBlockType(this.state.editorState, 'header-two')
    }

    if (!editorState && command === 'blockquote') {
      editorState = RichUtils.toggleBlockType(this.state.editorState, 'blockquote');
    }

    if (!editorState && command === 'ordered-list') {
      editorState = RichUtils.toggleBlockType(this.state.editorState, 'ordered-list-item');
    }

    if (!editorState && command === 'unordered-list') {
      editorState = RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item');
    }

    if (!editorState && command === 'highlight') {
      editorState = RichUtils.toggleInlineStyle(this.state.editorState, 'HIGHLIGHT');
    }

    if (editorState) {
      this.setState({editorState})
      return 'handled'
    }

    return 'not-handled'
  }

  undo = () => { this.setState({ editorState : EditorState.undo(this.state.editorState) }) }
  redo = () => { this.setState({ editorState: EditorState.redo(this.state.editorState) }) }

  focus = () => {
    if(document.activeElement.contentEditable !== 'true') {
      const editorState = moveSelectionToEnd(this.state.editorState) 
      this.setState({ editorState },()=>{ 
          this.domEditor.focus() 
      })      
    }
  }
  appendContent(content, type) {
    const editorState = this.state.editorState;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    let newContentState = null;

    // 判断是否有选中，有则替换，无则插入
    const selectionEnd = selection.getEndOffset();
    const selectionStart = selection.getStartOffset();
    if (selectionEnd === selectionStart) {
      newContentState = Modifier.insertText(contentState, selection, content);
    } else {
      newContentState = Modifier.replaceText(contentState, selection, content);
    }
    const newEditorState = EditorState.push(editorState, newContentState, type);
    this.onChange(newEditorState);
    setTimeout(()=>{
      this.focus();
    }, 0);
  }

  handleKeyEvent(e) {
    if (e.keyCode === 9) {
      // 插入tab制表符
      e.preventDefault();
      this.appendContent('\t', 'insert-characters');
    }
  }

  render() {
    const { editorState, updateTime, isLoading } = this.state
    // 自定义高亮style
    const styleMap = {
      'HIGHLIGHT': {
        'backgroundColor': '#faed27'
      }
    }

    // 解决playholder占位问题
    const contentState = editorState.getCurrentContent()
    let showPlaceholder = false 
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() === 'unstyled') {
        showPlaceholder = true
      }
    }

    // 向前/后撤回图标颜色显示
    let undoClassName = '',
        redoClassName = ''

    if (editorState.getUndoStack().size === 0) {
      undoClassName = 'grey'
    }
    if (editorState.getRedoStack().size === 0) {
      redoClassName = 'grey'
    }

    if (isLoading) {
      return <div style={{textAlign: 'center', marginTop: 100, color: "#777"}}>Loading...</div>
    }

    return (
      <>
        <div className="editor-header">
          <NavBar
            mode="light"
            icon={<Icon type="left" size="md" />}
            onLeftClick={() => {this.props.history.push({ pathname: '/', category: this.props.match.params.category})}}
            rightContent={[
              <span key="0" className={`iconfont icon-chehui ${undoClassName}`} onClick={this.undo} style={{marginRight: 20}}/>,
              <span key="1" className={`iconfont icon-qianjin ${redoClassName}`} onClick={this.redo} style={{marginRight: 20}}/>,
              <span key="2" className="iconfont icon-dui" onClick={this.save}/> 
            ]}
          >
            <span className="edit-time">{formatTime(updateTime)}</span>
          </NavBar>
          <EditorToolBar editorState={editorState}  updateEditorState={this.updateEditorState}/>
        </div>
        <div className={`editor-wrapper ${!showPlaceholder ? 'hide-placeholder' : ''}`}>
          <div className="editor-container" onClick = {this.focus} onKeyDown={this.handleKeyEvent.bind(this)} >
            <Editor 
              customStyleMap={styleMap}
              editorState={editorState} 
              onChange={(event) => this.onChange(event)} 
              placeholder="write your note in ..."
              handleKeyCommand={this.handleKeyCommand}
              keyBindingFn={keyBindingFunction}  
              ref={this.setDomEditorRef}
            />
          </div>
        </div>
      </>
    )
  }
}

export default ReactEditor