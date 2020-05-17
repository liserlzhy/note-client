import React from 'react'
import { ListView, WingBlank, Card, Toast, InputItem, Icon, NavBar, Checkbox, Menu, ActivityIndicator, Button, Modal, ActionSheet } from 'antd-mobile';
import { reqGetNote, reqDeleteNote, reqCategory, reqMoveCategory } from '../../api'
import { formatTime } from '../../assets/js'
import { createForm } from 'rc-form'
import './style.less'

const alert = Modal.alert
const prompt = Modal.prompt

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
  wrapProps = {
    onTouchStart: e => e.preventDefault()
  };
}

class NoteList extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => true,
    });

    this.state = {
      dataSource,
      isLoading: true,
      hasMore: true,
      pageIndex: 0,
      data: [],
      dataArr: [],
      pageSize: 10,
      showCancelBtn: false,
      isManage: false,
      allChecked: false,
      show: false,
      cateData: [],
      selectedFolder: ''
    }
  }

  genData = async (ref=false, category='', keyword='') => {
    let { pageIndex, dataArr, data, dataSource, pageSize } = this.state
    if (ref) {
      pageIndex = 0
      data = []
      dataArr = []
    }
    if (category === '全部分类') category = ''
    const res = await reqGetNote({ pageSize, pageIndex, category, keyword })

    if (res.data.err === 0) {
      const resData = res.data.data.notes 
      const lg = resData.length
      if (lg <= 0) {
        this.setState({ hasMore: false })
      }
       
      for (let i = 0; i < lg; i++) {
        dataArr.push(`row - ${(pageIndex * lg) + i}`)
        data.push(resData[i])
      }
      if (ref) {
        // 刷新
        this.setState({
          dataArr,
          data: resData,
          dataSource: dataSource.cloneWithRows(dataArr),
          pageIndex: pageIndex + 1,
          isLoading: false,
        })
        if (lg < pageSize) {
          this.setState({ hasMore: false })
        }
      } else {
        // 上拉加载
        this.rData = { ...this.rData, ...dataArr }
        this.setState({
          data,
          dataArr,
          dataSource: dataSource.cloneWithRows(this.rData),
          pageIndex: pageIndex + 1,
          isLoading: false,
        })
        if (lg < pageSize) {
          this.setState({ hasMore: false })
        }
      }
    } 
  }
  async componentDidMount() {
    let category = this.props.location.category || '全部分类'
    this.genData(true, category)
    const res = await reqCategory()
    let initData = [
      {
        value: '全部分类',
        label: '全部分类'
      }
    ] 
    if (res.data.err === 0 && res.data.data.length > 1) {
      res.data.data.map(item => (initData.push({ value: item._id, label: item._id })))
    }
    this.setState({ cateData: initData, selectedFolder: category })
  }

  onEndReached = async () => {
    const { isLoading, hasMore, selectedFolder } = this.state
    if (isLoading && !hasMore) {
      return 
    }
    this.setState({ isLoading: true })
    this.genData(false, selectedFolder)
  }

  handleSearch = (val) => {
    const keyword = val.trim()
    this.genData(true, this.state.selectedFolder, keyword)
    
  }

  handleCancel = () => {
    const { selectedFolder } = this.state
    this.setState({showCancelBtn: false }, () => {
      this.genData(true, selectedFolder)
    })
    this.props.form.setFieldsValue({ keyword: '' })
  }

  handleManage = () => {
    this.setState(preState => ({
      isManage: !preState.isManage,
      showCancelBtn: false
    }))
  }

  handleCheckbox = (e, id) => {
    const { checked } = e.target
    let { data, allChecked } = this.state

    data = data.map(note => {
      if (note._id === id) {
        return {...note, checked: checked}
      }
      return note
    })
    const checkedItemsLength = data.filter(note => note.checked).length
    if (checkedItemsLength === data.length) {
      allChecked = true
    } else {
      allChecked = false
    }
    this.setState({ data: data, allChecked })
  }

  handleDelete = (delNoteLength) => {
    let { data, dataArr, dataSource } = this.state
    const itemCheckedIds = data.filter(note => note.checked).map(note => note._id)
    alert('删除便签', `确定删除${delNoteLength}条便签吗?`, [
      { text: '取消' },
      {
        text: '确定',
        onPress: async () => {
          const res = await reqDeleteNote({itemCheckedIds})
          
          if (res.data.err === 0) {
            data = data.filter(note => !note.checked)
            dataArr = dataArr.slice(0, data.length)
            this.setState({data, dataArr, dataSource: dataSource.cloneWithRows(dataArr)}, () => {
              if (data.length === 0) {
                this.setState({ isManage: false })
              }
            })
            Toast.success(res.data.msg, 1)
          } else {
            Toast.fail(res.data.msg, 1)
          }
        }      
      },
    ])
    
  }

  handleAllChecked = () => {
    let { data, allChecked } = this.state
    allChecked = !allChecked

    if (allChecked) {
      data.forEach(note => note.checked = true)
    } else {
      data.forEach(note => note.checked = false)
    }
    this.setState({ data, allChecked: allChecked })
  }

  onChange = (value) => {
    const { cateData } = this.state
    let label = '';
    this.props.form.setFieldsValue({ keyword: '' })
    for(let i = 0; i < cateData.length; i++) {
      if (cateData[i].value === value[0]) {
        label = cateData[i].label
        this.genData(true, label)
        this.setState({ show: false, selectedFolder: label, showCancelBtn: false })
        break
      }
    }
  }

  onMaskClick = () => {
    document.body.style.overflow = 'auto'
    this.setState({
      show: false,
    })
  }


  handleClick = (e) => {
    e.preventDefault(); // Fix event propagation on Android
    this.setState({
      show: !this.state.show,
    })
  }

  createFolder = (cb) => {
    const { cateData } = this.state
    let folderName = ''
    prompt('新建文件夹', '', (name) => {
      folderName = name.trim()
      if (!folderName) {
        Toast.info('不能为空', 1)
        this.createFolder()
      } else if (cateData.some(item => item.label === folderName)) {
        Toast.info('该名称已存在', 1)
        this.createFolder()
      } else {
        cateData.splice(1, 0, { value: folderName, label: folderName})
        cb && cb(folderName)
        this.setState({cateData: cateData})
      }
    },
      '',
      null,
      ['请输入名称']
    )
  }

  logout = () => {
    localStorage.removeItem('token')
    this.props.history.replace('/login')
  }

  showActionSheet = () => {
    const { cateData, data, selectedFolder } = this.state
    const BUTTONS = ['新建文件夹']
    cateData.forEach(item => {
      if (item.label !== '全部分类' && item.label !== '未分类') {
        BUTTONS.push(item.label)
      }
    })

    ActionSheet.showActionSheetWithOptions({
      options: BUTTONS,
      title: '选择文件夹',
      maskClosable: true,
      'data-seed': 'logId',
      wrapProps,
    },
    async (buttonIndex) => {
      let category = ''
      if (buttonIndex === 0) {
        this.createFolder(async folderName => {
          category = folderName
          const itemCheckedIds = data.filter(note => note.checked).map(note => note._id)
          const res = await reqMoveCategory({ itemCheckedIds, category })
          if (res.data.err === 0) {
            this.genData(true, selectedFolder)
            Toast.info(res.data.msg, 1)
          }
        })
      } else {
        category = BUTTONS[buttonIndex]
        const itemCheckedIds = data.filter(note => note.checked).map(note => note._id)
        const res = await reqMoveCategory({ itemCheckedIds, category })
        if (res.data.err === 0) {
          this.genData(true, selectedFolder)
          Toast.info(res.data.msg, 1)
        }
      }

    })
  }
  render() {
    const { data, isManage, allChecked, show, cateData, selectedFolder } = this.state
    const { getFieldProps } = this.props.form
    const checkedItemsLength = data.filter(note => note.checked).length
    const separator = (sectionID, rowID) => {
      if (data.length === 0) return
      return (
        <div
          key={`${sectionID}-${rowID}`}
          style={{
            backgroundColor: '#f7f7f7',
            height: 8,
            borderTop: '1px solid #ECECED',
            borderBottom: '1px solid #ECECED',
          }}
        />
      )
    };
    let index = 0;
    const row = (rowData, sectionID, rowID) => {
      const obj = data[index++];
      if (!obj) return <></>
      const note = JSON.parse(obj.rawContentState).blocks
      let title = ''
      let body = ''
      for (let i = 0; i < note.length; i++) {
        let text = note[i].text.trim()
        if (text) {
          title = text 
          if (i < note.length - 1) {
            body = note[i + 1].text.trim()
          }
          break
        }
      }

      const toEditor = (_id, updateTime) => {
        this.props.history.push({
          pathname: `/editor/${selectedFolder}/${_id}`,
          state: updateTime
        })
      }
      return (
        <Card key={obj._id}>
          <div onClick={() => toEditor(obj._id, obj.updateTime)}>
            <Card.Header
              title={title}
            />
            <Card.Body>
              <div>{body}</div>
            </Card.Body>
            <Card.Footer content={formatTime(obj.updateTime)} />
          </div>
          <Checkbox style={{display: isManage ? 'block':'none'}} checked={obj.checked ? true : false} onChange={(e) => this.handleCheckbox(e, obj._id)}></Checkbox>
        </Card>
      );
    };

    const header = () => {
      return (
        <>
          <InputItem placeholder="搜索便签" disabled={isManage} { ...getFieldProps('keyword', {initialValue: '', onChange: (val) => this.handleSearch(val)}) } onFocus={() => {this.setState({ showCancelBtn: true })}} clear={true} >
            <Icon type="search" color="#777"/> 
          </InputItem>
          <div className="cancel"  style={{ display: this.state.showCancelBtn ? 'flex' : 'none' }}>
            <span onClick={this.handleCancel}>取消</span>
          </div>
        </>
      )
    }
    const menuEl = (
      <div className="single-foo-menu">
        <Menu
          data={cateData}
          value={[selectedFolder]}
          level={1}
          onChange={this.onChange}
          height={document.documentElement.clientHeight * 0.5}
        />
        <Button onClick={() => this.createFolder()}>新建文件夹</Button>
      </div>
    )
    const loadingEl = (
      <div style={{ position: 'absolute', width: '100%', height: document.documentElement.clientHeight * 0.6, display: 'flex', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </div>
    );
    return (
      <div className="note-list">
        <NavBar mode="light"
          // leftContent={<Icon type="cross" size="lg" style={{display: isManage?'block':'none'}}/>}
          leftContent={isManage ? <Icon type="cross" size="lg" /> : <span className="iconfont icon-PC_tuichudenglu"></span>}
          onLeftClick={() => isManage ? this.setState({isManage: false, allChecked: true}, this.handleAllChecked) : this.logout()}
          rightContent={
            isManage ? <span key="2" onClick={this.handleAllChecked} className={`iconfont icon-piliangguanli ${allChecked ? 'active': ''}`}/> :
            data.length !== 0 && !show ? <span key="1" className="manage" onClick={this.handleManage}>管理</span> : ''
          }>
            {isManage ? checkedItemsLength === 0 ? '请选择项目' : `已选择${checkedItemsLength}项` : <div onClick={this.handleClick} className='category-selector'><span>{selectedFolder==='全部分类'?'便签':selectedFolder}</span><Icon size="xxs" type={show ? 'up' : 'down'}></Icon></div>}
        </NavBar>
        {show ? cateData.length > 0 ? menuEl : loadingEl : null}
        {show ? <div className="menu-mask" onClick={this.onMaskClick} /> : null}
        <WingBlank>
          <ListView
            ref={el => this.lv = el}
            dataSource={this.state.dataSource}
            renderHeader={ header }
            renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
              {this.state.isLoading && this.state.hasMore ? 'Loading...' : 'Loaded'}
            </div>)}
            renderRow={row}
            renderSeparator={separator}
            className="am-list"
            pageSize={this.state.pageSize}
            useBodyScroll
            scrollRenderAheadDistance={500}
            onEndReached={this.onEndReached}
            onEndReachedThreshold={10}
          />
        </WingBlank>
          {
            isManage ? (
              checkedItemsLength > 0 ?
                <div className="manage-tool">
                  <div onClick={() => this.handleDelete(checkedItemsLength)}><span className="iconfont icon-shanchu"></span><span>删除</span></div>
                  <div onClick={this.showActionSheet}><span className="iconfont icon-export"></span><span>移动到</span></div>
                </div> : null
            ) : (<span onClick={() => this.props.history.push({pathname: `/editor/${selectedFolder}/add`, state: Date.now()})} className="add-icon iconfont icon-weimingming"></span>)
          }
      </div>
    );
  }
}

export default createForm()(NoteList)