import ajax from './ajax'

export const reqGetCode = (mail) => ajax('/user/getcode', { mail })
export const reqRegister = ({ mail, password, code }) => ajax('/user/register', { mail, password, code }, 'POST')
export const reqReset = ({ mail, password, code }) => ajax('/user/reset', { mail, password, code }, 'POST')
export const reqLogin = ({ mail, password }) => ajax('/user/login', { mail, password }, 'POST')
export const reqGetUser = () => ajax('/user/getuser')
export const reqAddNote = ({ rawContentState, category }) => ajax('/note/add', {rawContentState, category}, 'POST')
export const reqUpdateNote = ({ _id, rawContentState }) => ajax('/note/update', {_id, rawContentState}, 'POST')
export const reqGetNote = ({ _id, pageIndex, pageSize, category, keyword }) => ajax('/note', { _id, pageIndex, pageSize, category, keyword })
export const reqDeleteNote = ({ itemCheckedIds }) => ajax('/note/delete', { itemCheckedIds }, 'POST')
export const reqCategory = () => ajax('/note/getcategory')
export const reqMoveCategory = ({ itemCheckedIds, category }) => ajax('/note/movecategory', { itemCheckedIds, category }, 'POST') 