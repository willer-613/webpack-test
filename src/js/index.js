// import add from './add';
import count from '@mainJS/count';

console.log(count(3, 1));

import(/* webpackChunkName:'add' */ '@mainJS/add').then(({ default: add }) => {
    console.log(add(1, 2));
});

console.log('index.js文件加载了~~');
