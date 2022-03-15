const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { config } = require('process');
const optimizationCssAssetPlugin = require('optimize-css-assets-webpack-plugin');
const terserWebpackPlugin = require('terser-webpack-plugin');

const WebpackBar = require('webpackbar');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

//优化
const optimization = () => {
    const config = {
        //提取公共代码打包
        splitChunks: {
            chunks: 'all',
            //#region 默认配置
            //以下配置使用默认值就ok了
            // minSize: 30 * 1024,
            // maxSize: 0, //不限制
            // minChunks: 1, //要提取的chunk最少被引用1次
            // maxAsyncRequests: 5, //按需加载时并行加载的文件的最大数量
            // maxInitialRequests: 3, //入口js文件最大并行请求数量
            // automaticNameDelimiter: '~', //名称连接符
            // name: true, //可以使用命名规则
            // cacheGroups: {
            //     //分割chunk的组
            //     //node_modules文件会被打包到vendors组的chunk中
            //     vendors: {
            //         test: /[\\/]node_modules[\\/]/,
            //         priority: -10,
            //     },
            //     default: {
            //         minChunks: 2,
            //         priority: -20,
            //         reuseExistingChunk: true, //如果当前要打包的模块和之前已经被提取的模块是同一个就会复用而不是重新打包模块
            //     },
            // },
            //#endregion
        },
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}`,
        },
    };

    if (isProd) {
        //配置生产环境的压缩方案:js和css
        config.minimizer = [
            // new optimizationCssAssetPlugin(),
            new terserWebpackPlugin({
                // cache: true, //开启缓存,
                // parallel: true, //开启多进程打包，
                // sourceMap: true,
            }),
        ];
    }

    return config;
};

const babelOptions = preset => {
    const opts = {
        presets: [
            [
                '@babel/preset-env',
                {
                    useBuiltIns: 'usage',
                    corejs: {
                        version: 3,
                    },
                    targets: {
                        chrome: '60',
                        firefox: '60',
                        ie: '9',
                        safari: '10',
                        edge: '17',
                    },
                },
            ],
        ],
        plugins: ['@babel/plugin-proposal-class-properties'],
    };

    if (preset) {
        opts.presets.push(preset);
    }

    return opts;
};

const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: babelOptions(),
        },
    ];

    if (isDev) {
        loaders.push('eslint-loader');
    }

    return loaders;
};

const filename = ext =>
    isDev ? `[name].[contenthash:6].${ext}` : `[name].[contenthash:10].${ext}`;

module.exports = {
    stats: 'errors-warnings',
    //该选项可以控制 webpack 如何通知「资源(asset)和入口起点超过指定文件限制」
    performance: {
        hints: 'warning', // 枚举
        hints: 'error', // 性能提示中抛出错误
        hints: false, // 关闭性能提示
        maxAssetSize: 200000, // 整数类型（以字节为单位）
        maxEntrypointSize: 400000, // 整数类型（以字节为单位）
        assetFilter: function (assetFilename) {
            // 提供资源文件名的断言函数
            return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        },
    },
    context: path.resolve(__dirname, 'src'),
    // mode: 'production', //development
    mode: 'development',
    entry: {
        index: ['@babel/polyfill', '@mainJS/index.js'],
        main: '@mainJS/index.js',
        scrtipt: '@mainJS/index.js',
    },
    //解析模块直接去找node_modules目录
    // modules: [path.resolve(__dirname, '../node_modules'), 'node_modules'],
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        watchContentBase: true, //监视contentbase目录下文件变化 进行热更新
        watchOptions: {
            ignored: /node_modules/, //忽略文件 不需要被监听的
        },
        compress: true, //gzip压缩
        port: 5000,
        host: 'localhost',
        open: true,
        hot: true, //hmr功能
        clientLogLevel: 'none', //不需要显示启动服务器日志
        quiet: true, //除了基本启动信息以为，其他内容不显示
        overlay: false, //如果出错误，不需要全屏提示
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                pathRewrite: {
                    '^/api': '',
                },
            },
        },
    },

    plugins: [
        new WebpackBar({
            reporter: {
                afterAllDone(context) {
                    console.log('打包完成。。。');
                },
            },
        }),
        // HTML plagin  多文件
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './main.html',
            chunks: ['scrtipt'],
            minify: {
                collapseWhitespace: isProd,
                removeComments: isProd,
            },
        }),

        new HtmlWebpackPlugin({
            filename: 'test.html',
            template: './test.html',
            chunks: ['scrtipt', 'main', 'index'],
            minify: {
                collapseWhitespace: isProd,
                removeComments: isProd,
            },
        }),

        // CLEAN plagin
        new CleanWebpackPlugin(),

        // COPY plagin
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'img'),
                    to: path.resolve(__dirname, 'dist/img'),
                },
            ],
        }),

        new MiniCssExtractPlugin({
            filename: filename('css'),
        }),
    ],
    //解析模块的规则
    resolve: {
        alias: {
            '@mainJS': path.resolve(__dirname, './src/js'),
        },
        extensions: ['.js', '.json', '.css', '.mjs'],
    },

    optimization: optimization(),

    module: {
        rules: [
            // Loading FONT-FAMILY
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: ['file-loader'],
            },
            // Loading SCSS/SASS
            {
                test: /.s[ac]ss$/i,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },

            // Loading CSS
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {},
                    },
                    'css-loader',
                ],
            },
            // Loading BABEL
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: jsLoaders(),
            },
        ],
    },
};
