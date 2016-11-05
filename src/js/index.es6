// let a = ()=>{
// 	console.log(123)
// }
// let GLOBAL_UTIL = null; 
// {
// 	GLOBAL_UTIL = {
// 		a: 1
// 	}
// }
// const constVar = 1;
// let b = 1
if (document.attachEvent) {
	document.querySelector('.superbox').attachEvent('onclick', () => {
		console.log(123)
	})
}else{
	console.log('attachEvent')
	document.querySelector('.superbox').addEventListener('click', () => {
		console.log(123)
	})
}