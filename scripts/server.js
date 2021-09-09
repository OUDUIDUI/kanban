const execa = require('execa')
const args = require('minimist')(process.argv.slice(2)) // 获取命令行参数

// 获取框架名称
const frame = args._[0] || 'express';  // 默认为express

execa('cd',[`back_end/${frame}`]);
execa('yarn',['server'])

