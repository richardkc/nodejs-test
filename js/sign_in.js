!function () {
    let hash = {}
    let $form = $('#signInForm')
    $form.on('submit', (e) => {
        e.preventDefault()
        let need = ['email', 'password']
        need.forEach((name) => {
            let value = $('#signInForm').find(`[name=${name}]`).val()
            hash[name] = value
        })
        $form.find('.error').each((index,span) => {
            $(span).text('')
        })
        if(hash['email'] === ''){
            return $form.find('[name="email"]').siblings('.error')
            .text('填邮箱啊')
        }
        if(hash['password'] === ''){
            return $form.find('[name="password"]').siblings('.error')
            .text('填密码啊')
        }
        $.post('/sign_in', hash)
            .then((response) => {
                window.location.href = '/'
            }, (request) => {
                let {errors} = request.responseJSON
                if(errors.email && errors.email === 'invalid'){
                    return $form.find('[name="email"]').siblings('.error')
                    .text('邮箱格式错误')
                }
            })
    })


}.call()