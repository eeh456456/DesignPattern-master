//定义模块管理器单体对象
var F = F || {};
/***
 *定义模块方法(理论上,模块方法应放在闭包中实现,可以隐蔽内部信息,
 *这里我们为让读者能够看明白,我们忽略此步骤)
 * @param str 模块路由
 * @param fn 模块方法
 **/
F.define = function(str, fn) {
	//解析模块路由
	var parts = str.split('.'),
		// old当前模块的祖父模块,parent当前模块父模块
		//如果在闭包中,为了屏蔽对模块直接访问,建议将模块添加给闭包内部私有变量
		old = parent = this,
		//i模块层级,len 模块层级长度
		i = len = 0;
	//如果第一个模式是模块管理器单体对象,则移除
	if(parts[0] === 'F') {
		parts = parts.slice(1);
	}
	//屏蔽对define与module模块方法的重写
	if(parts[0] === 'define' || parts[0] === 'module') {
		return;
	}
	//遍历路由模块并定义每层模块
	for(len = parts.length; i < len; i++) {
		//如果父模块中不存在当前模块
		if(typeof parent[parts[i]] === 'undefined') {
			//声明当前模块
			parent[parts[i]] = {};
		}
		//缓存下一层级的祖父模块
		old = parent;
		//缓存下一层级父模块
		parent = parent[parts[i]];
	}
	//如果给定模块方法则定义该模块方法
	if(fn) {
		//此时i等于parts.length, 故减一
		old[parts[--i]] = fn();
	}
	//返回模块管理器单体对象
	return this;
}
// F.string模块  
F.define('string', function() {
	//接口方法
	return {
		//清除字符串两边空白
		trim: function(str) {
			return str.replace(/^\s+|\s+$/g, '');
		}
	}
});

/*注意:在真正的模块开发中,是不允许这样直接调用的,有两点原因,
技术上,模块通常保存在闭包内部的私有变量里,而不会保存在F上,
因此是获取不到的,而我们这里简化了闭包,也为测试方便,因此直接引用。
其次,类似如下调用是不符合模块化开发规范的。
		
解释：他的意思就是F.string不应该被直接调用,应该用参数调用？*/
console.log(F.string.trim('测试用例。')) //测试用例。

/*对于模块的回调函数,我们也可以以构造函数的形式返回接口,
                 比如我们创建DOM模块,其中包括dom()获取元素方法、html()获取或者设置元素innerHTML内容方法等等。*/
F.define('dom', function() {
	//简化获取元素方法(重复获取可被替代, 此设计用于演示模块添加)
	var $ = function(id) {
		$.dom = document.getElementById(id);
		//返回构造函数对象
		return $;
	}
	//获取或者设置元素内容
	$.html = function(html) {
		//如果传参则设置元素内容,否则获取元素内容!
		if(html) {
			this.dom.innerHTML = html;
			return this;
		} else {
			return this.dom.innerHTML;
		}
	}
	//返回构造函数
	return $;
});
//console.log(F.dom('test').html()); //"test"
//为dom模块添加addclass方法
//注意,此种添加模式之所以可行,是因为将模块添加到F对象上,模块化开发中只允许上面的添加方式
F.define('dom.addclass');
F.dom.addClass = function(type, fn) {
	return function(className) {
		//如果不存在该类
		if(!~this.dom.className.indexOf(className)) {
			//简单添加类
			this.dom.className += ' ' + className;
		}
	}
}();
//测试用例
//F.dom('test').addClass('test')
//模块调用方法 
F.module = function() {
	//将参数转化为数组
	var args = [].slice.call(arguments),
		//获取回调执行函数
		fn = args.pop(),
		// 获取依赖模块, 如果args[0]是数组, 则依赖模块为args[0]。否则依赖模块为arg
		parts = args[0] && args[0] instanceof Array ? args[0] : args,
		//依赖模块列表
		modules = [],
		//模块路由
		modIDs = '',
		//依赖模块索引
		i = 0,
		//依赖模块长度
		ilen = parts.length,
		//父模块,模块路由层级索引,模块路由层级长度
		parent, j, jlen;
	//遍历依赖模块
	while(i < ilen) {
		//如果是模块路由
		if(typeof parts[i] === 'string') {
			//设置当前模块父对象(F)
			parent = this;
			//解析模块路由,并屏蔽掉模块父对象
			modIDs = parts[i].replace(/^F\./, '').split('.');
			//遍历模块路由层级
			for(j = 0, jlen = modIDs.length; j < jlen; j++) {
				//重置父模块
				parent = parent[modIDs[j]] || false;
			}
			//将模块添加到依赖模块列表中
			modules.push(parent);
			//如果是模块对象
		} else {
			//直接加入依赖模块列表中
			modules.push(parts[i]);
		}
		//取下一个依赖模块
		i++;
	}
	//执行回调执行函数
	fn.apply(null, modules);
}
