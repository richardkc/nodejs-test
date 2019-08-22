!function () {
    let hash = {}
    let $form = $('#signUpForm')
    $form.on('submit', (e) => {
        e.preventDefault()
        let need = ['email', 'password', 'password_confirmation']
        need.forEach((name) => {
            let value = $('#signUpForm').find(`[name=${name}]`).val()
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
        if(hash['password_confirmation'] === ''){
            return $form.find('[name="password_confirmation"]').siblings('.error')
            .text('确认密码啊')
        }
        if(hash['password'] !== hash['password_confirmation']){
            return $form.find('[name="password_confirmation"]').siblings('.error')
            .text('密码不匹配')
        }
        $.post('/sign_up', hash)
            .then((response) => {
                console.log(response)
            }, (request) => {
                let {errors} = request.responseJSON
                if(errors.email && errors.email === 'invalid'){
                    return $form.find('[name="email"]').siblings('.error')
                    .text('邮箱格式错误')
                }
            })
    })
}.call()