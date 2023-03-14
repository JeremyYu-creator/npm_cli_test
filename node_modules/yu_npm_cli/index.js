#!/usr/bin/env node
const program = require('commander');// commander.js，可以自动的解析命令和参数，用于处理用户输入的命令。
const inquirer = require('inquirer');// Inquirer.js，通用的命令行用户界面集合，用于和用户进行交互。
const symbols = require('log-symbols');// log-symbols，可以在终端上显示出 √ 或 × 等的图标。
// const download = require('download-git-repo');// download-git-repo，下载并提取 git 仓库，用于下载项目模板。
const handlebars = require('handlebars');// handlebars.js，模板引擎，将用户提交的信息动态填充到文件中。
const chalk = require('chalk');// chalk，可以给终端的字体加上颜色。
const ora = require('ora');// ora，下载过程久的话，可以用于显示下载中的动画效果
const shell = require('shelljs');// shelljs 做的事就是自动化，从耗时的重复性常规动作里解放出来
const child_process = require('child_process');// child_process 创建异步进程(子进程)  exec传递的是 command 或 可执行文件
const fs = require('fs');
/**
 * @description: program.version 调用该命令时（如 ljh-cli -v） 会携带出'1.0.0'
 * @description: program.command 定义初始化命令（如 ljh-cli init <项目名>）
 * @description: program.action action是执行command命令时发生的回调 
 * @param {type} node index.js init test == ljh-cli init ljh
 * @return: program.parse(process.argv)解析命令行中的参数，解析出name,并传入action回调。
 */
program.version(chalk.green('♫ ===== Dark，yu_npm_cli ===== \n  version: 1.0.0'), '-v, --version').
  command('init <name>').
  action(name => {
    console.log(name);
    // fs.existsSync 如果路径存在，则返回 true，否则返回 false
    if (!fs.existsSync(name)) {
      console.log(chalk.magentaBright('正在创建项目...'));
      inquirer.prompt([
        {
          name: 'description',
          message: '请输入项目描述'
        },
        {
          name: 'author',
          message: '请输入作者名称'
        }
      ]).then(res => {
        console.log(res)
        //ora、chalk模块也进行了一些视觉美化
        const spinner = ora('正在下载模板...\n');
        spinner.start();
        // 可以使用download 或 child_process
        url = 'https://github.com/JeremyYu-creator/es-template-test.git'
        child_process.exec('git clone ' + url, function (err) {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red('模板下载失败\n',err))
          } else {
            spinner.succeed();
            // 将要移动的文件 移动到目标文件  xxx -> __dirname/<projectName>
            // __dirname 当前模块的目录名
            // shell你可以理解为一个cmd
            // 此处的文件是截取项目的名字，这里项目的名字是git上的名字，然后替换成你想要的名字
            shell.mv(__dirname + '/es-template-test', __dirname + '/' + name)
            const filename = `${name}/package.json`;
            const meta = {
              name,
              description: res.description,
              author: res.author
            }
            if (fs.existsSync(filename)) {
              // 读取目标文件的package文件
              const content = fs.readFileSync(filename).toString();
              let dt = JSON.parse(content);
              dt.name = meta.name;
              dt.author = meta.author;
              dt.description = meta.description
              //改写package.json 
              fs.writeFile(filename,JSON.stringify(dt),'utf8',(err) => {
                if(err)
                      console.log('写入失败,原因：',err);
                else
                    console.log('写入成功')
              })
              console.log(symbols.success, chalk.green('项目初始化完成'));
            } else {
              console.log(symbols.error, chalk.red('package不存在'))
            }
          }
        })
      })
    } else {
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  })
program.parse(process.argv);