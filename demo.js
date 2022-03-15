// const lexArray = {
//     a: 1,
//     b: 2,
//     *[Symbol.iterator]() {
//         yield 1;
//         yield 2;
//         yield 3;
//     },
// };

// console.log([...lexArray]);

// // var nonWellFormedIterable = {};

// // nonWellFormedIterable[Symbol.iterator] = () => [...lexArray];

// // console.log([...nonWellFormedIterable]);

// const myAsyncIterable = new Object();

// myAsyncIterable[Symbol.asyncIterator] = async function* () {
//     yield new Promise((res, rej) => {
//         setTimeout(() => {
//             res('hello');
//         }, 2000);
//     });
//     yield new Promise((res, rej) => {
//         setTimeout(() => {
//             res('async');
//         }, 1000);
//     });
//     yield 'iteration!';
// };

// (async () => {
//     for await (const x of myAsyncIterable) {
//         console.log(x);
//         // expected output:
//         //    "hello"
//         //    "async"
//         //    "iteration!"
//     }
// })();

// class MyArray extends Array {
//     // 覆盖 species 到父级的 Array 构造函数上
//     static get [Symbol.species]() {
//         return Array;
//     }
// }
// var a = new MyArray(1, 2, 3);
// var mapped = a.map(x => x * x);

// console.log(mapped instanceof MyArray); // false
// console.log(mapped instanceof Array); // true

// const counter = (function* (ceil) {
//     console.log(ceil);
//     try {
//         console.log(yield);
//         console.log(yield);
//         console.log(yield);
//     } catch (e) {
//         console.log(e);
//     }
//     return;
// })(1111);

// counter.next();
// // counter.throw(new Error('An error occurred!'));
// counter.return('1111');
// counter.next(2);
// counter.next(3);
// counter.next(4);
// const fetch = require('node-fetch');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const fetchUrl = (function* (url) {
    const result = yield fetch(url);
    console.log(result);
})('https://api.github.com/users/github');

const fetchPromise = fetchUrl.next().value;
fetchPromise.then(response => response.json()).then(jsonData => fetchUrl.next(jsonData));
