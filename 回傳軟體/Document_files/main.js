if(!weblsget(WEBLSNAME+"token")){
    href("index.html")
}

innerhtml("#maintitle",`
    hello ${chash(weblsget(WEBLSNAME+"name"),"decode")}
`,false)

onclick("#event",function(element,event){
    href("event.html")
})

onclick("#customer",function(element,event){
    href("customer.html")
})

onclick("#signout",function(element,event){
    ajax("POST",AJAXURL+"signout",function(event,data){
        if(data["success"]){
            alert("登出成功")
            weblsset(WEBLSNAME+"userid",null)
            weblsset(WEBLSNAME+"name",null)
            weblsset(WEBLSNAME+"token",null)
            href("index.html")
        }else{
            alert(data["data"])
        }
    },null,[
        ["Authorization","Bearer "+weblsget(WEBLSNAME+"token")]
    ])
})

onclick("#signin",function(element,event){
    href("signin.html")
})

document.onkeydown=function(event){
    if(event.key=="Enter"){
        docgetid("submit").click()
    }
}

passwordshowhide()