/**
 * ALibrary v1.0.0
 * Author Zhangrongming
 * Date: 2014-11-30
 */
~(function(window) {
		/***
		 * @name 框架单体对象A
		 * @param selector 选择器或页面加载回调函数
		 * @param context 查找元素上下文
		 **/
		var A = function(selector, context) {
			//如果selector为方法则为窗[添加页面加载完成事件监听
			if(typeof selector == 'function') {
				A(window).on('load', selector);
			} else {
				//创建A对象
				return new A.fn.init(selector, context);
			}
		}
		//原型方法
		A.fn = A.prototype = {
				//强化构造函数
				constructor: A,
				//构造函数
				init: function(selector, context) {
						// modif选择器为元素
						if(typeof selector === 'object') {
							this[0] = selector;
							this.length = 1;
							return this;
						};
						//设置获取到的元素长度属性
						this.length = 0,
							//矫正上下文
							context = document.getElementById(context) || document;
						//如果是id选择器
						if(~selector.indexOf('#')) {
							this[0] = document.getElementById(selector.slice(1));
							this.length = 1;
							//如果是类选择器
						} else if(~selector.indexOf('.')) {
							var doms = [],
								className = selector.slice(1);
							//支持通过类获取元素的方法
							if(context.getElementsByclassName) {
								doms = context.getElementsByclassName(className);
							} else {
								doms = context.getElementsByTagName('*');
								//设置获取到的元素
								for(var i = 0, len = doms.length; i < len; i++) {
									if(doms[i].className && !!~doms[i].className.indexOf(className)) {
										this[this.length] = doms[i];
										//矫正长度
										this.length++;
									}
								}
								//否则为元素名选择器
							} else {
								var doms = context.getElementsByTagName(selector),
									i = 0,
									len = doms.length;
								for(; i < len; i++) {
									this[i] = doms[i];
								}
								this.length = len;
								//设置当前对象的选择上下文
								this.context = context;
								//设置当前对象的选择器
								this.selector = selector;
								return this;
							},
							//元素长度
							length: 0,
								//增强数组
								push: [].push,
								splice: [].splice
						}
						//设置构造函数原型
						A.fn.init.prototype = A.fn;
						/***
						 * @name        对象拓展
						 * @param[0]    目标对象
						 * @param[1...] 拓展对象
						 **/
						A.extend = A.fn.extend = function() {
							var i = 1,
								len = arguments.length,
								target = arguments[0],
								j;
							//如果一个参数, 则为当前对象拓展方法
							if(i == len) {
								target = this;
								i--;
							}
							//遍历拓展对象
							for(; i < len; i++) {
								//遍历拓展对象中方法与属性
								for(j in arguments[i]) {
									//浅复制
									target[j] = arguments[i][j];
								}
							}
							//返回目标对象
							return target;
						};
						A.extend({
							//单体对象A方法拓展
							/***
							 *@name 将横线式命名字符串转化为驼峰式
							 *eg: 'test-demo' -> 'testDemo'
							 **/
							camelCase: function(str) {
								return str.replace(/\-(\w)/g, function(match, letter) {
									return letter.toUppercase();
								});
							},
							/***
							 *@name 去除字符串两端空白符
							 *eg :  ' t es t '-> 't es t'
							 **/
							trim: function(str) {
								return str.replace(/^\s+|\s+$/g, '')
							},
							/***
							 * @name 创建一个元素并包装成A对象
							 * @param type 元素类型
							 * @param value 元素属性对象
							 **/
							create: function(type, value) {
								var dom = document.createElement(type);
								return A(dom).attr(value);
							},
							/***
							 *@name   格式化模板
							 *@param  str模板字符串
							 *@param  data 渲染数据
							 *eg: '<div> {#value#}</div>'+ {value: 'test'}-> '<div>test</div>'
							 **/
							formateString: function(str, data) {
								var html = '';
								//如果渲染数据是数组,则遍历数组并渲染
								if(data instanceof Array) {
									for(var i = 0, len = data.length; i < len; i++) {
										html += arguments.callee(str, data[i]);
									}
									return html;
								} else {
									//搜索{#key#}格式字符串,并在data中查找对应的key属性替换
									return str.replace(/\{#(\W+)#\}/g, function(match, key) {
										return typeof data === 'string' ? data : (typeof data[key] === 'undefined' ? '' : data[key])
									});
								}
							}
						});
						//事件绑定方法
						var _on = (function() {
							//如果标准浏览器
							if(document.addEventListener) {
								return function(dom, type, fn, data) {
									dom.addEventListener(type, function(e) {
										fn.call(dom, e, data);
									}, false);
								}
								//如果IE浏览器
							} else if(document.attachEvent) {
								return function(dom, type, fn, data) {
									dom.attachEvent('on' + type, function(e) {
										fn.call(dom, e, data);
									});
								}
								//如果是老版本浏览器
							} else {
								return function(dom, type, fn, data) {
									dom['on' + type] = function(e) {
										fn.call(dom, e, data);
									};
								}
							}
						})();
						A.fn.extend({
									//添加事件
									on: function(type, fn, data) {
										var i = this.length;
										for(; --i >= 0;) {
											//通过闭包实现对i变量保存
											_on(this[i], type, fn, data);
										}
										return this;
									},
									//设置或者获取元素样式
									css: function() {
										var arg = arguments,
											len = arg.length;
										//如果无获取到的元素则返回
										if(this.length < 1) {
											return this;
										}
										//如果是一个参数 
										if(len === 1) {
											//如果参数是字符串则返回获取到的第一个元素的样式
											if(typeof arg[0] === 'string') {
												// ie浏览器
												if(this[0].currentStyle) {
													return this[0].currentStyle[name];
												} else {
													return getComputedStyle(this[0], false)[name];
												}
												//如果参数为对象则为获取到的所有元素设置样式
											} else if(typeof arg[0] === 'object') {
												for(var i in arg[0]) {
													for(var j = this.length - 1; j >= 0; j--) {
														this[j].style[A.camelCase(i)] = arg[0][i];
													}
												}
											}
											//如果两个参数
										} else if(len === 2) {
											//为获取到的所有元素设置样式
											for(var j = this.length - 1; j >= 0; j--) {
												this[j].style[A.camelCase(arg[0])] = arg[1];
										}
									}
									return this;
								}
								//设置或者获取元素属性
								,
								attr: function() {
									var arg = arguments,
										len = arg.length;
									//如果无获取到的元素则返回
									if(this.length < 1) {
										return this;
									}
									//如果是一个参数
									if(len === 1) {
										//如果参数是字符串则返回获取到的第一个元素的属性值
										if(typeof arg[0] === 'string') {
											return this[0].getAttribute(arg[0]);
											//如果参数为对象则为获取到的所有元素设置属性
										} else i(tpeof arg[0] === 'object') {
											for(var iin arg[0]) {
												for(var j = this.length - 1; j >= 0; j - ) {
													thisj].setAttribute(i, arg[0][i]);
											}
										}
										//如果是两个参数
									} else f(len === 2) {
										//为获取到的所有元素设置属性
										for(varj = this.length - 1; j >= 0; j - ) {
											thisj].settribute(arg[O], arg[1]);
									}
								}
								return this;
								//获取或者设置元素内容
								,
								html: function() {
									var arg = arguments,
										len = arg.length;
									//如果无获取到的元素则返回
									if(this.length < 1) {
										return this;
										I1如果无参数则返回获取到的第一个元素内容
										if(len === 0) {
											return this[0].innerHTML;
											//如果是一个参数, 则设置获取到的所有元素内容
										} else i(len === 1) {
												for(var i = this.length - 1; i >= 0; i - ) {
													this[j.innerHTML = arg[0]; I1如果两个参数, 且第二个参数值为true,
														则为获取到的所有元素追加内容
													}
													else f(len === 2 && arg[1) {
																for(var i = this.length - 1; i >= 0; i - ) {
																	this[j.innerHTML += arg[0];
																			return this;
																			/***
																			 * @name判断类存在
																			 * @param val类名
																			 * */
																			, hasclass: function(val) {
																				//如果无获取到的元素则返回
																				if(!this[0]) {
																					return;
																					//类名去除首尾空白符
																					var value = A.trim(val);
																					//如果获取到的第一个元素类名包含val则返回true,
																					否则返回false
																					return this[0].className && this[0].className.indexOf(value) >=
																						0 ? true : false;
																					/***
																					*
																					@name添加类
																					@param val类名
																					**/
																					, addclass: function(val) {
																							var value = A.trim(val),
																								str = ";
																							I1遍历所有获取到的元素
																							for(var i = 0, len = this.length; i < len; i++) {
																								str = this[].className;
																								//如果元素类名包含添加类则为元素添加类
																								if(!~str.indexOf(value)) {
																									this[j].className += '+ value;
																									return this;
																								}
																								/***
																								* @name 移除类
																								@param val 类名
																								**/
																								, removeclass: function(val) {
																									var value = A.trim(val),
																										classNameArr, // 将元素类名转化为数组
																										result;
																									//元索类名最终结果
																									//遍历所有获取到的元素
																									for(var i = 0, len = this.length; i < len; i++) {
																										//如果类名包含删除类
																										if(thi[j].className && ~this[].className.indexOf(value)) {
																											//通过空格符将元素类名切割成数组
																											classNameArr = thislij.className.split(");
																												result = ";
																												//遍历类名
																												for(var j = classNameArr.length - 1; j >= 0; j - ) {
																													//去除类名首尾空白符
																													classNameArr[] = A.trim(classNameArr[i]);
																													//如果类名存在并且类名不等于移除类,则保留该类
																													result += classNameArfj] && classNameArrj] != value ? "+
																											className Arrj]: ";
																									}
																									//重置元素类名
																									this[j].className = result;
																								}
																								return this;
																								/***
																								* @name
																								插入元素
																								@param parent父元素
																								,appendTo : function(parent){
																								var doms = A(parent);
																								//如果获取到父元素
																								if(doms.length){
																								//遍历父元素
																								for(var j= this.length-1; j >=0; j-){
																								//简化元素克隆(cloneNode) 操作,
																								只向第一个父元素中插入子元素
																								doms[0]. appendchild(this[j);
																								});
																								//运动框架单体对象
																								var Tween= {
																								//计时器句柄
																								timer : 0,
																								//运动成员队列
																								queen: 0,
																								//运动间隔
																								interval : 16,
																								//缓冲函数
																								easing : {
																								//默认运动缓存算法匀速运动
																								def : function (time, startValue, changeValue, duration){
																								return changeValue * time / duration + startValue
																								},
																								//缓慢结束
																								easeoutQuart: function (time, startValue, changeValue,
																								duration) {
																								return -changeValue * (time=time/duration-1)
																								* time * time * time-1)+startValue;
																								},
																								/***
																								* @name添加运动成员
																								*
																								@param instance 运动成员
																								**/
																								add: function(instance) {
																										//添加成员
																										this.queen.push(instance);
																										//运行框架
																										this.run();
																									},
																									/***
																									 * @name 停止框架运行
																									 **/
																									clear: function() {
																										clearlnterval(this.timer);
																										this.timer = 0;
																										/***
																										*
																										@name运行框架
																										**/
																										run: function() {
																												//如果在运行则返回
																												if(thistimer)
																													return;
																												//重置计时器
																												this.clear();
																												//运行框架
																												this.timer = setInterval(this.loop, this.interval);
																											},
																											/***
																											*
																											@name运动框架循环方法
																											**/
																											loop: function() {
																												//如果运动队列中设有成员
																												if(Tween.queen.length === 0) {
																													//停止框架运行
																													Tween.clear();
																													//返回
																													return;
																													//获取当前时间
																													var now = +new Date();
																													//遍历运动成员
																													for(var i = Tween.queen.length - 1; i >= 0; i - ) {
																														//获取当前成员
																														var instance = Tween.queen[i];
																														//当前成员己运动的时间
																														instance.passed = now - instance.start;
																														//如果当前成员己运动的时间小于当前成员运动时间
																														if(instance.passed < instance.duration) {
																															//执行当前成员主函数
																															Tween.workFn(instance);
																														} else {
																															//结束当前成员运行
																															Tween.endFn(instance);
																														}
																													}
																												},
																												/***
																												 * @name 运行方法
																												 * @param instance运动成员
																												 **/
																												workFn: function(instance) {
																														//获取当前成员在当前时刻下的运动进程
																														instance.tween = this.easing[instance.type](instance.passed,
																															instance.from,
																															instance.to - instance.from, instance.duration);
																														//执行主函数
																														this.exec(instance);
																													},
																													/***
																													@name结束方法
																													@param instance 运动成员
																													endFn : function(instance){
																													instance.passed = instance.duration;
																													instance.tween = instance.to;
																													this.exec(instance);
																													this.distory(instance);
																													/***
																													*
																													@name执行主函数
																													*
																													@param instance 运动成员
																													exec : function(instance){
																													try{
																													//执行当前成员主函数
																													instance.main(instance.dom)
																													}catch(e){}
																													},
																													/***
																													*
																													@name注销运动成员
																													*
																													@param instance运动成员
																													**/
																													distory: function(instance) {
																														//结束当前成员
																														instance.end();
																														//在运动成员队列中删除该成员
																														this.queen.splice(his.queen.indexOf(instance), 1);
																														//删除成员中的每一个属性,
																														for(var i in instance) {
																															delete instance[i];
																															/***
																															* @name获取当前成员在运动成员中的位置
																															@param instance运动成员
																															Tween.queen.indexOf = function(){
																															var that = this;
																															//如果有该方法则返回,如果设有则创建一个方法
																															return Tween.queen.indexOf II function(instance){
																															//遍历每个成员
																															for(var i= 0, len = that.length; i < len; i++){
																															//如果该成员是需求成员则返回该成员在队列中的位置
																															if(that[i] === instance){
																															return i;
																															}
																															//否则返回-1,表示不存在
																															return-1;
																															}
																															}0;
																															// A.fn对象拓展方法
																															A.fn.extend({
																															/***
																															* @name 动画模块
																															@param obj 动画成员对象
																															**/
																															animate: function(obj) {
																																//适配运动对象
																																var obj = A.extend({
																																			duration: 400,
																																			//默认运行时间
																																			type: 'def,
																																			//默认动画缓存函数
																																			from: 0,
																																			//开始点
																																			to: 1,
																																			//结束点
																																			start: +new Date(), // 开始时间
																																			dom: this,
																																			//当前元素
																																			main: function() {},
																																			I / 运行主函数
																																			end: function()
																																		}, // 结束函数
																																	},
																																	obj);
																															//向运动框架中载入运动对象成员
																															Tween.add(bj);
																														});
																												/***
																												@name避免框架别名冲突(主要用于页面中引入多核框架)
																												@param library其他框架
																												* */
																												A.noconflict = function(library) {
																													//如果传递其他框架
																													if(libry) {
																														//为library绑定$别名
																														window.$ = library;
																													} else {
																														//否则删除$别名
																														window.$ = null;
																														delete window.$;
																													}
																													//返回A对象
																													return A;
																													//为全局对象绑定A框架,并绑定别名$
																													window.$ = window.A = A;
																												})(window);