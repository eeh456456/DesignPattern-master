export const StrategyMap = {
	/* Strategy 1: 将文件大小（bit）转化为 KB */
	bitToKB: val => {
		const num = Number(val)
		return isNaN(num) ? val : (num / 1024).toFixed(0) + 'KB'
	},
	/* Strategy 2: 将文件大小（bit）转化为 MB */
	bitToMB: val => {
		const num = Number(val)
		return isNaN(num) ? val : (num / 1024 / 1024).toFixed(1) + 'MB'
	}
}

/* Context: 生成el表单 formatter */
const strategyContext = function(type, rowKey) {
	return function(row, column, cellValue, index) {
		return StrategyMap[type](row[rowKey])
	}
}

export default strategyContext