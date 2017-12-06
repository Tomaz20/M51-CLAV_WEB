var perfil = new Vue({
    el: '#profile',
    data: {
        edit: {
            Name: false,
            Email: false,
            Password: false,
        },
        newName: "",
        newEmail: "",
        newPassword: "",
        newPassword2: "",
        passMessage: "",
    },
    methods: {
        checkready: _.debounce(
            function(){
                this.passMessage="";
                if(!this.edit.Name && !this.edit.Email && !this.edit.Password){
                    return false;
                }
                else{
                    var ready= true;
                    if(this.edit.Name){
                        ready= (ready && this.newName.length>0);
                    }
                    if(this.edit.Email){
                        ready= (ready && this.newEmail.length>0);
                    }
                    if(this.edit.Password){
                        if(this.newPassword!=this.newPassword2){
                            this.passMessage= "Passwords têm de ser iguais!"
                            return false;
                        }
                        else{
                            ready= (ready && this.newPassword.length>0);
                        }
                    }
                    return ready;
                }
            },
            300
        ),
        update: function(){
            var dataObj = {
                Name: this.newName,
                Email: this.newEmail,
                Password: this.newPassword,
            }

            this.$http.put('/updateProfile',dataObj,{
                headers: {
                    'content-type' : 'application/json'
                }
            })
            .then(function (response) {
                
            })
            .catch(function (error) {
                console.error(error);
            });
        }
    }
})