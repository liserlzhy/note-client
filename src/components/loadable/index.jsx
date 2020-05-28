import React from 'react';
import Loadable from 'react-loadable';

export default function withLoadable (comp) {
    return Loadable({
        loader:comp,
        loading:(props)=>{
            if (props.error) {
                return <div className='center' >
                    加载错误。请刷新
                </div>;
            } else if (props.timedOut) {
                return <div className='center' >
                    加载超时。请刷新
                </div>;
            } else if (props.pastDelay) {
                return <div className='center'>
                  <div>加载中 ...</div>
                </div>;
            } else {
                return null;
            }
        },
        timeout:10000
    })
}
