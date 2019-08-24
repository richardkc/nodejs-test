
$('#button').on('click',(e) => {
    $.ajax({
        url: "./pay",
        dataType: "jsonp",
        success: function (response) {
            if (response === 'success') {
                console.log('1')
                amount.innerText = amount.innerText - 1
            }
        }
    })
})





// <!-- 使用script标签请求： -->
// button.addEventListener('click', (e) => {         
//     let script = document.createElement('script')
//     let functionName = 'frank' + parseInt(Math.random() * 100000, 10)
//     window[functionName] = function (result) {
//         if (result === 'success') {
//             amount.innerText = amount.innerText - 1
//         } else {
//         }
//     }       
//     script.src = './pay?callback=' + functionName
//     document.body.appendChild(script)
//     script.onload = function (e) {
//         e.currentTarget.remove()
//         delete window[functionName]
//     }
//     script.onerror = function (e) {
//         e.currentTarget.remove()
//         alert('fail')
//         delete window[functionName]
//     }
// })





// <!-- 使用script标签用img创建请求： -->
// button.addEventListener('click', (e) => {
//     let script = document.createElement('script')
//     script.src = '/pay'
//     document.body.appendChild(script)
//     script.onload = function (e) {
//         e.currentTarget.remove()
//     }
//     script.onerror = function (e) {
//         e.currentTarget.remove()
//         alert('fail')
//     }
// })


// button.addEventListener('click',(e) => {
//     let image = document.createElement('img')
//     image.src = '/pay'
//     image.onload = function(){
//         alert('支付成功')
//         // window.location.reload()  //刷新本地页面
//         amount.innerText = amount.innerText - 1
//     }
//     image.onerror = function(){
//         alert('支付失败')
//     }
// })