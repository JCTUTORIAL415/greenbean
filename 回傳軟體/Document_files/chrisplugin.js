/*
	標題: 插件整合
	參考: 無
	作者: 小賀chris
	製作及log:
	2023/06/28  20:10:16 Bata 1.0.0 // 新增macosselection 以及 sort 以及 dget 以及 clog函式
	2023/06/30  14:35:45 Bata 1.0.1 // 新增isset函式
	2023/07/01  12:52:01 Bata 1.0.2 // 修改變數及小問題
	2023/07/01  12:56:24 Bata 1.0.3 // 新增domgetid 及 docgetall 及 weblsset 及 weblsget函式
	2023/07/02  23:39:12 Bata 1.0.4 // 新增doccreate函式
	2023/07/09  21:54:50 Bata 1.0.5 // 新增ajax函式
	2023/07/12  13:51:52 Bata 1.0.6 // 新增lightbox函式
	2023/07/13  19:08:05 Bata 1.0.7 // 新增docappendchild函式
	2023/07/15  20:22:11 Bata 1.0.8 // 新增regexp 及 regexpmatch 及 regexpreplace 函式
	2023/07/16  15:24:44 Bata 1.0.9 // 修改conlog函式
	2023/07/20  13:28:05 Bata 1.0.10 // 新增ajaxdata函式
	2023/07/21  18:38:23 Bata 1.0.11 // 修改ajaxdata函式
	2023/07/23  18:18:28 Bata 1.0.12 // 新增pagechanger函式
	2023/07/25  22:12:42 Bata 1.0.13 // 修改lightbox函式
	2023/07/25  10:50:11 Bata 1.0.14 // 修改lightbox函式
	2023/08/01  23:22:33 Bata 1.0.15 // 修改formdata函式
	2023/08/09  18:27:14 Bata 1.0.16 // 修改lightbox函式新增clickcolse變數
	2023/09/14  16:57:12 Bata 1.0.17 // 更新startmacossection函式
	2023/11/20  18:01:04 Bata 1.0.18 // 新增hintbox函式
	2023/12/04  14:23:29 Bata 1.0.19 // 新增tag函式
	2024/01/08  21:17:23 Bata 1.0.25 // 新增on*函式
	2024/01/16  18:25:29 Bata 2.0.0 // 函式大更新
	2024/02/06  22:38:46 Bata 2.1.0 // 函式衝突更新

		|-------    -----    -                     -     -----  -----  -----   -------|
	   |-------    -        -            - - -          -                     -------|
	  |-------    -        -------    -          -     -----    --       --  -------|
	 |-------    -        -     -    -          -         -      --     --  -------|
	|-------    -----    -     -    -          -     -----         -----  -------|
*/

const MAXINT=9999999999
const MININT=-9999999999

function startmacossection(){
	let macostimer
	setInterval(function(){
		docget("qtor","body").onscroll=function(){
			clearTimeout(macostimer)
			docget("qtor","body").setAttribute("scroll","true")
			macostimer=setTimeout(function(){
				docget("qtor","body").removeAttribute("scroll")
			},500)
		}
		domgetall("textarea").forEach(function(event){
			event.onscroll=function(){
				clearTimeout(macostimer)
				event.parentNode.setAttribute("scroll","true")
				macostimer=setTimeout(function(){
					event.parentNode.removeAttribute("scroll")
				},500)
			}
		})
		document.querySelectorAll(".macossectiondiv").forEach(function(event){
			event.addEventListener("scroll",function(){
				clearTimeout(macostimer)
				event.setAttribute("scroll","true")
				macostimer=setTimeout(function(){
					event.removeAttribute("scroll")
				},500)
			})
		})
		document.querySelectorAll(".macossectiondivx").forEach(function(event){
			event.addEventListener("scroll",function(){
				clearTimeout(macostimer)
				event.setAttribute("scroll","true")
				macostimer=setTimeout(function(){
					event.removeAttribute("scroll")
				},500)
			})
		})
		document.querySelectorAll(".macossectiondivy").forEach(function(event){
			event.addEventListener("scroll",function(){
				clearTimeout(macostimer)
				event.setAttribute("scroll","true")
				macostimer=setTimeout(function(){
					event.removeAttribute("scroll")
				},500)
			})
		})
	},200)
}

function divsort(card,sortdiv,callback=function(){}){
	document.querySelectorAll("."+card).forEach(function(event){
		event.draggable="true"
		event.style.cursor="grab"
	})

	document.querySelectorAll(sortdiv).forEach(function(event){
		event.ondragstart=function(addeventlistenerevent){
            if(!event.querySelector("input:focus,textarea:focus,select:focus")){
				addeventlistenerevent.target.classList.add("divsortdragging")
				event.style.cursor="grabbing"
            }else{
                addeventlistenerevent.preventDefault()
            }
		}

		event.ondragover=function(addeventlistenerevent){
			if(!event.querySelector("input:focus,textarea:focus,select:focus")){
				addeventlistenerevent.preventDefault()
				let sortablecontainer=addeventlistenerevent.target.closest(sortdiv)
				if(sortablecontainer){
					let draggableelement=Array.from(sortablecontainer.children).filter(function(child){
						return child.classList.contains(card)&&!child.classList.contains("divsortdragging")
					})

					let afterelement=draggableelement.reduce(function(closest,child){
						let box=child.getBoundingClientRect()
						let offset=addeventlistenerevent.clientY-box.top-box.height/2
						if(offset<0&&offset>closest.offset){
							return{ offset:offset,element:child }
						}else{
							return closest
						}
					},{ offset:Number.NEGATIVE_INFINITY }).element

					let draggable=document.querySelector(".divsortdragging")
					if(afterelement==null){
						sortablecontainer.appendChild(draggable)
					}else{
						sortablecontainer.insertBefore(draggable,afterelement)
					}
				}
			}
		}

		event.ondragend=function(addeventlistenerevent){
			addeventlistenerevent.target.classList.remove("divsortdragging")
			event.style.cursor="grab"
			callback()
		}
	})
}

function docget(key,selector){
	if(key=="id"){
		return document.getElementById(selector)
	}
	if(key=="animation"){
		return document.getAnimations(selector)
	}
	if(key=="class"){
		return document.getElementsByClassName(selector)
	}
	if(key=="name"){
		return document.getElementsByName(selector)
	}
	if(key=="tag"){
		return document.getElementsByTagName(selector)
	}
	if(key=="tagns"){
		return document.getElementsByTagNameNS(selector)
	}
	if(key=="qtor"){
		return document.querySelector(selector)
	}
	if(key=="all"){
		return document.querySelectorAll(selector)
	}
	conlog("[ERROR]dget key not found"+key)
}

function docgetid(selector){
	return document.getElementById(selector)
}

function docgetall(selector){
	return document.querySelectorAll(selector)
}

function domget(key,selector){
	if(key=="id"){
		return document.getElementById(selector)
	}
	if(key=="animation"){
		return document.getAnimations(selector)
	}
	if(key=="class"){
		return document.getElementsByClassName(selector)
	}
	if(key=="name"){
		return document.getElementsByName(selector)
	}
	if(key=="tag"){
		return document.getElementsByTagName(selector)
	}
	if(key=="tagns"){
		return document.getElementsByTagNameNS(selector)
	}
	if(key=="qtor"){
		return document.querySelector(selector)
	}
	if(key=="all"){
		return document.querySelectorAll(selector)
	}
	conlog("[ERROR]dget key not found"+key)
}

function domgetid(selector){
	return document.getElementById(selector)
}

function domgetall(selector,callback=function(){}){
	document.querySelectorAll(selector).forEach(function(event){ callback(event) })
	return document.querySelectorAll(selector)
}

function conlog(data,color="white",size="12",weight="normal"){
	console.log(`%c${data}`,`color:${color};font-size:${size}px;font-weight:${weight}`)
}

function isset(data){
	if(data!=null&&data!=undefined){ return true }
	else{ return false }
}

function blank(data){
	if(data!=null&&data!=undefined&&data!=""){ return true }
	else{ return false }
}

function weblsset(data,value){
	if(value==null){
		return localStorage.removeItem(data)
	}else{
		if(typeof value=="object"||typeof value=="array"){
			return localStorage.setItem(data,JSON.stringify(value))
		}else{
			return localStorage.setItem(data,value)
		}
	}
}

function weblsget(data,tojson=true){
	if(tojson==true){
		try{
			let data=JSON.parse(localStorage.getItem(data))
			return data
		}catch(error){
			return localStorage.getItem(data)
		}
	}else{
		return localStorage.getItem(data)
	}
}

function doccreate(element){
	return document.createElement(element)
}

function oldajax(method,url,send=null,header=[["Content-type","multipart/form-data"]]){
	let xmlrequest=new XMLHttpRequest()
	xmlrequest.open(method,url)
	for(let i=0;i<header.length;i=i+1){
		xmlrequest.setRequestHeader(header[i][0],header[i][1])
	}
	xmlrequest.send(send)
	return xmlrequest
}

function ajax(method,url,onloadcallback,send=null,header=[["Content-type","multipart/form-data"]],progresscallback=function(processevent,percentage){},statechange=[function(){},function(){},function(){},function(){}],callback=[]){
	let check=true
	if(method==null){
		conlog("function ajax method requset","red","12")
		check=false
	}
	if(url==null){
		conlog("function ajax method requset","red","12")
		check=false
	}
	if(onloadcallback==null){
		conlog("function ajax method requset","red","12")
		check=false
	}
	if(check){
		let xmlhttprequest=new XMLHttpRequest()

		xmlhttprequest.open(method,url)

		for(let i=0;i<header.length;i=i+1){
			xmlhttprequest.setRequestHeader(header[i][0],header[i][1])
		}

		xmlhttprequest.onreadystatechange=function(){
			if(this.readyState==0){
				statechange[0](this)
			}

			if(this.readyState==1){
				statechange[1](this)
			}

			if(this.readyState==2){
				statechange[2](this)
			}

			if(this.readyState==3){
				statechange[3](this)
			}

			if(this.readyState==4){
				let data=this.responseText

				try{
					data=JSON.parse(this.responseText)
					onloadcallback(this,data)
				}catch(error){
					onloadcallback(this,data)
				}
			}
		}

		xmlhttprequest.onprogress=function(event){
			progresscallback(event,(event.loaded/event.total)*100)
		}

		for(let i=0;i<callback.length;i=i+1){
			xmlhttprequest[callback[i][0]]=function(){ callback[i][1](this) }
		}
		xmlhttprequest.send(send)
		return xmlhttprequest
	}
}

function newajax(method,url,onloadcallback,send=null,header=[["Content-type","multipart/form-data"]],progresscallback=function(event){},statechange=[function(){},function(){},function(){},function(){}],callback=[]){
	let check=true
	if(method==null){
		conlog("function ajax method requset","red","12")
		check=false
	}
	if(url==null){
		conlog("function ajax method requset","red","12")
		check=false
	}
	if(onloadcallback==null){
		conlog("function ajax method requset","red","12")
		check=false
	}
	if(check){
		let xmlhttprequest=new XMLHttpRequest()

		xmlhttprequest.open(method,url)

		for(let i=0;i<header.length;i=i+1){
			xmlhttprequest.setRequestHeader(header[i][0],header[i][1])
		}

		xmlhttprequest.onreadystatechange=function(){
			if(this.readyState==0){
				statechange[0](this)
			}

			if(this.readyState==1){
				statechange[1](this)
			}

			if(this.readyState==2){
				statechange[2](this)
			}

			if(this.readyState==3){
				statechange[3](this)
			}

			if(this.readyState==4){
				let data=this.responseText

				try{
					data=JSON.parse(this.responseText)
				}finally{
					onloadcallback(this,data)
				}
			}
		}

		xmlhttprequest.upload.onprogress=function(event){
			if(event.lengthComputable){
				progresscallback(event,(event.loaded/event.total)*100)
			}else{
				console.warn("[EXP_UPLOADDATA WARNING]function ajax warn: onprogress can't be progress")
			}
		}

		for(let i=0;i<callback.length;i=i+1){
			xmlhttprequest[callback[i][0]]=function(){ callback[i][1](this) }
		}
		xmlhttprequest.send(send)
		return xmlhttprequest
	}
}

function lightbox(clickelement,element,lightboxhtml,closelement=null,islightboxclosewithkeyesc=true,clickcolse="mask"){
	let click=false

	domgetid(element).classList.add("lightboxmask")

	if(!isset(clickelement)){
		domgetid(element).innerHTML=``
		setTimeout(function(){
			domgetid(element).style.transform="translateY(0)"
		},300)
		docgetid(element).innerHTML=`
			<div class="lightboxmain macossectiondiv">
				${lightboxhtml()}
			</div>
		`
		if(closelement){
			docgetid(closelement).onclick=function(){
				docgetid(element).style.transform="translateY(-100%)"

				setTimeout(function(){
					docgetid(element).innerHTML=``
				},300)
			}
		}
	}else{
		docgetid(element).innerHTML=``
		docgetall(clickelement).forEach(function(event){
			event.onclick=function(){
				docgetid(element).style.display="block"
				setTimeout(function(){
					docgetid(element).style.transform="translateY(0)"
				},300)
				docgetid(element).innerHTML=`
					<div class="lightboxmain macossectiondiv">
						`+lightboxhtml(event)+`
					</div>
				`
				if(closelement!=null){
					docgetid(closelement).onclick=function(){
						docgetid(element).style.transform="translateY(-100%)"
						setTimeout(function(){
							docgetid(element).innerHTML=``
						},300)
					}
				}
			}
		})
	}

	if(islightboxclosewithkeyesc){
		document.onkeydown=function(event){
			if(event.key=="Escape"){
				event.preventDefault()
				docgetid(element).style.transform="translateY(-100%)"
				setTimeout(function(){
					docgetid(element).innerHTML=``
				},300)
			}
		}
	}

	if(clickcolse=="body"){
		document.onclick=function(){
			docgetid(element).style.transform="translateY(-100%)"
			setTimeout(function(){
				docgetid(element).innerHTML=``
			},300)
		}
	}else if(clickcolse=="mask"){
		docgetid(element).onmousedown=function(event){
			if(event.target==docgetid(element)){
				click=true
			}
		}
		docgetid(element).onmouseup=function(event){
			if(click){
				if(event.target==docgetid(element)){
					docgetid(element).style.transform="translateY(-100%)"
					setTimeout(function(){
						docgetid(element).innerHTML=``
					},300)
				}else{
					click=false
				}
			}else{
				click=false
			}
		}
	}else if(clickcolse=="none"){
	}else{
		console.log("lightbox clickcolse變數 錯誤")
		return "lightbox clickcolse變數 錯誤"
	}
}

function docappendchild(element,chlidelement){
	return docgetid(element).appendChild(chlidelement)
}

function regexp(regexptext,regexpstring){
	return new RegExp.test(regexptext,regexpstring)
}

function regexpmatch(regexptext,data){
	return regexptext.exec(data)
}

function regexpreplace(data,regexpstring,replacetext){
	return data.replace(regexpstring,replacetext)
}

function formdata(data=[]){
	let formdata=new FormData()
	for(let i=0;i<data.length;i=i+1){
		formdata.append(data[i][0],data[i][1])
	}
	return formdata
}

function pagechanger(data,ipp,key,callback){
	if(!isset(weblsget("pagecount"))){ weblsset("pagecount",1) }
	let row=data
	let pagecount=parseInt(weblsget("pagecount"))
	let itemperpage=ipp
	let maxpagecount=Math.ceil(row.length/itemperpage)
	if(key=="first"){
		pagecount=1
	}else if(key=="prev"){
		pagecount=Math.max(1,pagecount-1)
	}else if(key=="next"){
		pagecount=Math.min(pagecount+1,maxpagecount)
	}else if(key=="end"){
		pagecount=maxpagecount
	}

	weblsset("pagecount",pagecount)
	let page=parseInt(weblsget("pagecount"))
	let start=(page-1)*itemperpage;
	let rowcount=Math.min(row.length-start,itemperpage);
	let end=start+rowcount;

	for(let i=start;i<end;i=i+1){
		callback(row[i])
	}
}

function hintbox(endcallback=function(){},hintname=".hintdiv"){
	let hintlist=[]
	let hintcount=0

	docgetall(hintname).forEach(function(event){
		event.style.position="relative"
		hintlist[parseInt(event.dataset.id)]=event
	})

	function clear(){
		for(let i=0;i<hintlist.length;i=i+1){
			if(docgetid("hintbox")){
				docgetid("hintbox").remove()
			}
		}
	}

	function main(){
		clear()
		hintlist[hintcount].innerHTML=`
			${hintlist[hintcount].innerHTML}
			<div class="hintbox" id="hintbox">
				<div class="hiintboxclose" id="chrispluginhintboxclear">X</div>
				<div class="hiintboxbody">${hintlist[hintcount].dataset.body}</div>
				<div class="hiintboxbuttondiv">
					<input type="button" class="hintboxbutton hintboxbuttonleft" id="chrispluginhintboxprev" value="prev">
					<input type="button" class="hintboxbutton hintboxbuttonright" id="chrispluginhintboxnext" value="next">
				</div>
			</div>
		`

		if(domgetid("hintbox").getBoundingClientRect().top<=225){
			domgetid("hintbox").style.top="25px"
		}else{
			domgetid("hintbox").style.top="-100px"
		}

		docgetid("chrispluginhintboxclear").onclick=function(){
			clear()
			endcallback()
		}

		docgetid("chrispluginhintboxprev").onclick=function(){
			if(hintcount>0){
				hintcount=hintcount-1
				main()
			}
		}

		docgetid("chrispluginhintboxnext").onclick=function(){
			if(hintcount<hintlist.length-1){
				hintcount=hintcount+1
				main()
			}else{
				clear()
				endcallback()
			}
		}
	}
	main()
}

function login(
	submitfunction=function(){},
	navbar=`
		<div class="navigationbar">
			<div class="navigationbarleft">
				<img src="/website/material/icon/mainicon.png" class="logo" draggable="false">
				<div class="maintitle">title</div>
			</div>
			<div class="navigationbarright">
			</div>
		</div>
	`,
	center=`
		<div class="main" id="loginmain">
			<div class="iconinputdiv">
				<div class="iconinputtext">帳號:</div>
				<input type="text" class="iconiinputinput input" id="username">
				<div class="iconinputicondiv"><img src="/website/material/icon/user.svg" class="iconinputicon" draggable="false"></div>
			</div>
			<div class="iconinputdiv">
				<div class="iconinputtext">密碼:</div>
				<input type="password" class="iconiinputinput input" id="password">
				<div class="iconinputicondiv"><img src="/website/material/icon/eyeclose.svg" class="iconinputicon cursor_pointer" id="passwordicon" draggable="false"></div>
			</div>
			<input type="button" class="button" id="signup" value="註冊">
			<input type="button" class="button" id="submit" value="登入"><br>
		</div>
	`,
	footer=``
){
	docgetall("body")[0].innerHTML=`
		${navbar}
		${center}
		${footer}
	`

	docgetall(".iconinputdiv").forEach(function(event){
		event.onclick=function(){
			event.children[1].focus()
		}
	})

	if(docgetid("passwordicon")){
		if(weblsget("passwordshow")=="true"){
			docgetid("passwordicon").src="/website/material/icon/eyeopen.svg"
			docgetid("password").type="text"
		}else{
			docgetid("passwordicon").src="/website/material/icon/eyeclose.svg"
			docgetid("password").type="password"
		}

		docgetid("passwordicon").onclick=function(){
			if(weblsget("passwordshow")=="true"){
				docgetid("passwordicon").src="/website/material/icon/eyeclose.svg"
				docgetid("password").type="password"
				weblsset("passwordshow","false")
			}else{
				docgetid("passwordicon").src="/website/material/icon/eyeopen.svg"
				docgetid("password").type="text"
				weblsset("passwordshow","true")
			}
		}
	}

	docgetid("submit").onclick=submitfunction
}

function signin(
	submitfunction=function(){},
	navbar=`
		<div class="navigationbar">
			<div class="navigationbarleft">
				<img src="/website/material/icon/mainicon.png" class="logo" draggable="false">
				<div class="maintitle">title</div>
			</div>
			<div class="navigationbarright">
			</div>
		</div>
	`,
	center=`
		<div class="main" id="loginmain">
			<div class="iconinputdiv">
				<div class="iconinputtext">帳號:</div>
				<input type="text" class="iconiinputinput input" id="username">
				<div class="iconinputicondiv"><img src="/website/material/icon/user.svg" class="iconinputicon" draggable="false"></div>
			</div>
			<div class="iconinputdiv">
				<div class="iconinputtext">密碼:</div>
				<input type="password" class="iconiinputinput input" id="password">
				<div class="iconinputicondiv"><img src="/website/material/icon/eyeclose.svg" class="iconinputicon cursor_pointer" id="passwordicon" draggable="false"></div>
			</div>
			<input type="button" class="button" id="signup" value="註冊">
			<input type="button" class="button" id="submit" value="登入"><br>
		</div>
	`,
	footer=``
){
	docgetall("body")[0].innerHTML=`
		${navbar}
		${center}
		${footer}
	`

	docgetall(".iconinputdiv").forEach(function(event){
		event.onclick=function(){
			event.children[1].focus()
		}
	})

	if(docgetid("passwordicon")){
		if(weblsget("passwordshow")=="true"){
			docgetid("passwordicon").src="/website/material/icon/eyeopen.svg"
			docgetid("password").type="text"
		}else{
			docgetid("passwordicon").src="/website/material/icon/eyeclose.svg"
			docgetid("password").type="password"
		}

		docgetid("passwordicon").onclick=function(){
			if(weblsget("passwordshow")=="true"){
				docgetid("passwordicon").src="/website/material/icon/eyeclose.svg"
				docgetid("password").type="password"
				weblsset("passwordshow","false")
			}else{
				docgetid("passwordicon").src="/website/material/icon/eyeopen.svg"
				docgetid("password").type="text"
				weblsset("passwordshow","true")
			}
		}
	}

	docgetid("submit").onclick=submitfunction
}

function smoothscroll(id){
	if(document.getElementById(id)){
		document.getElementById(id).scrollIntoView({ behavior: "smooth" })
	}else{
		conlog("[ERROR]function smoothscroll id not found","red","12")
	}
}

function closelightbox(){
	docgetall(".lightboxmask")[0].style.transform="translateY(-100%)"

	setTimeout(function(){
		docgetall(".lightboxmask")[0].innerHTML=``
	},300)
}

function lightboxclose(){
	docgetall(".lightboxmask")[0].style.transform="translateY(-100%)"

	setTimeout(function(){
		docgetall(".lightboxmask")[0].innerHTML=``
	},300)
}

function tag(tagdiv,taglist,newtag=function(){}){
	let tagset=new Set()

	function updatetaglist(){
		docgetid("taglist").innerHTML=``
		for(let i=0;i<taglist.length;i=i+1){
			docgetid("taglist").innerHTML=`
				${docgetid("taglist").innerHTML}
				<div class="tag" data-name="${taglist[i]["name"]}" style="background: ${taglist[i]["color"]}">
					${taglist[i]["name"]}
				</div>
			`
		}

		// 觸發點擊事件
		docgetall("#taglist>.tag").forEach(function(event){
			event.onclick=function(){
				selecttag(event.dataset.name)
			}
		})
	}

	function selecttag(tagname){
		if(!tagset.has(tagname)){
			let color

			tagset.add(tagname)

			for(let i=0;i<taglist.length;i=i+1){
				if(taglist[i]["name"]==tagname){
					color=taglist[i]["color"]
					break
				}
			}

			docgetid("selecttag").innerHTML=`
				${docgetid("selecttag").innerHTML}
				<div class="tag" data-name="${tagname}" style="background: ${color}">
					${tagname}
					<div class="tagdelete">X</div>
				</div>
			`

			// 觸發點擊事件
			docgetall("#selecttag>.tag").forEach(function(event){
				event.querySelector(".tagdelete").onclick=function(){
					tagset.delete(event.dataset.name)
					event.remove()
					updatetaglist()
					filtertags()
					docgetid("taglist").style.display="block"
				}
			})

			docgetid("taginput").value=""
			docgetid("taglist").style.display="block"
		}
	}

	function filtertags(){
		let value=docgetid("taginput").value.toLowerCase()

		docgetid("taglist").style.display="block"

		for(let i=0;i<taglist.length;i=i+1){
			let tagElement=docgetid("taglist").querySelector(`.tag:nth-child(${taglist[i]["id"]})`)
			if(taglist[i]["name"].toLowerCase().includes(value)){
				tagElement.style.display="block"
			}else{
				tagElement.style.display="none"
			}
		}
	}

	docgetid(tagdiv).classList.add("tagdiv")

	docgetid(tagdiv).innerHTML=`
		<div class="tagcontrol">
			<div class="tagwrapper">
				<div class="selecttag" id="selecttag"></div>
				<input type="text" class="taginput" id="taginput" placeholder="Add a tag...">
			</div>
		</div>
		<div class="taglist" id="taglist"></div>
	`

	updatetaglist()

	docgetid("taginput").oninput=filtertags

	docgetid("taginput").onkeydown=function(event){
		if(event.key=="Enter"){
			let value=event.target.value.trim()
			if(value&&!tagset.has(value)){
				// 查看是否有資料
				if(!taglist.find(function(tag){ tag.name.toLowerCase()==value.toLowerCase() })){
					// 新增tag
					taglist.push({ id: taglist.length+1,name: value,color: "" })
					updatetaglist()
					selecttag(value)
					newtag(value)
				}else{
					selecttag(value)
				}
			}
			event.target.value=""
		}else if(event.key=="Backspace"&&event.target.value==""){
			let selectedtagsDiv=docgetid("selected-taglist")
			let lasttag=selectedtagsDiv.lastChild
			if(lasttag){
				tagset.delete(lasttag.textContent)
				selectedtagsDiv.removeChild(lasttag)
			}
		}
	}

	docgetid("taginput").onfocus=function(){
		docgetid("taglist").style.display="block"
		filtertags() // 確保在顯示時更新標籤列表
	}

	document.onclick=function(event){
		if(event.target.id!="taginput"&&event.target.id!="taglist"){
			docgetid("taglist").style.display="none"
		}
	}

	divsort("tag","#selecttag")
}

// --- 自用函式 ---
function passwordshowhide(url="/",id="passwordicon"){
	if(docgetid(id)){
		if(weblsget("passwordshow")=="true"){
			docgetid(id).src=url+"material/icon/eyeopen.svg"
			docgetid("password").type="text"
		}else{
			docgetid(id).src=url+"material/icon/eyeclose.svg"
			docgetid("password").type="password"
		}

		docgetid(id).onclick=function(){
			if(weblsget("passwordshow")=="true"){
				docgetid(id).src=url+"material/icon/eyeclose.svg"
				docgetid("password").type="password"
				weblsset("passwordshow","false")
			}else{
				domgetid(id).src=url+"material/icon/eyeopen.svg"
				domgetid("password").type="text"
				weblsset("passwordshow","true")
			}
		}
	}
}
// --- 自用函式 ---

// on* event START
function on(key,element,callback=function(){}){
	try{
		domgetall(element).forEach(function(event){
			event["on"+key]=function(onevent){ callback(event,onevent) }
		})
	}catch(error){
		conlog("[ERROR]function on* key not found","red","12")
	}
}

function onenterclick(element,callback=function(){}){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				event.onkeydown=function(event2){
					if(event2.key=="Enter")
						callback()
				}
			})
		}else{
			element.onkeydown=function(event2){
				if(event2.key=="Enter")
					callback()
			}
		}
	}else{
		domgetall(element,function(event){
			event.onkeydown=function(event2){
				if(event2.key=="Enter")
					callback()
			}
		})

	}
	return{
		"success": true,
		"data": ""
	}
}

function onenterkeydown(element,callback=function(){}){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				event.onkeydown=function(event2){
					if(event2.key=="Enter")
						callback()
				}
			})
		}else{
			element.onkeydown=function(event2){
				if(event2.key=="Enter")
					callback()
			}
		}
	}else{
		domgetall(element,function(event){
			event.onkeydown=function(event2){
				if(event2.key=="Enter")
					callback()
			}
		})

	}
	return{
		"success": true,
		"data": ""
	}
}

// onabort
function abort(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onabort=function(onevent){ callback(event,onevent) }
	})
}

function onabort(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onabort=function(onevent){ callback(event,onevent) }
	})
}

// onactivate
function activate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onactivate=function(onevent){ callback(event,onevent) }
	})
}

function onactivate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onactivate=function(onevent){ callback(event,onevent) }
	})
}

// onaddstream
function addstream(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaddstream=function(onevent){ callback(event,onevent) }
	})
}

function onaddstream(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaddstream=function(onevent){ callback(event,onevent) }
	})
}

// onaddtrack
function addtrack(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaddtrack=function(onevent){ callback(event,onevent) }
	})
}

function onaddtrack(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaddtrack=function(onevent){ callback(event,onevent) }
	})
}

// onafterprint
function afterprint(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onafterprint=function(onevent){ callback(event,onevent) }
	})
}

function onafterprint(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onafterprint=function(onevent){ callback(event,onevent) }
	})
}

// onafterscriptexecute
function afterscriptexecute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onafterscriptexecute=function(onevent){ callback(event,onevent) }
	})
}

function onafterscriptexecute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onafterscriptexecute=function(onevent){ callback(event,onevent) }
	})
}

// onanimationcancel
function animationcancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationcancel=function(onevent){ callback(event,onevent) }
	})
}

function onanimationcancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationcancel=function(onevent){ callback(event,onevent) }
	})
}

// onanimationend
function animationend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationend=function(onevent){ callback(event,onevent) }
	})
}

function onanimationend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationend=function(onevent){ callback(event,onevent) }
	})
}

// onanimationiteration
function animationiteration(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationiteration=function(onevent){ callback(event,onevent) }
	})
}

function onanimationiteration(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationiteration=function(onevent){ callback(event,onevent) }
	})
}

// onanimationstart
function animationstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationstart=function(onevent){ callback(event,onevent) }
	})
}

function onanimationstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onanimationstart=function(onevent){ callback(event,onevent) }
	})
}

// onappinstalled
function appinstalled(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onappinstalled=function(onevent){ callback(event,onevent) }
	})
}

function onappinstalled(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onappinstalled=function(onevent){ callback(event,onevent) }
	})
}

// onaudioend
function audioend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaudioend=function(onevent){ callback(event,onevent) }
	})
}

function onaudioend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaudioend=function(onevent){ callback(event,onevent) }
	})
}

// onaudioprocess
function audioprocess(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaudioprocess=function(onevent){ callback(event,onevent) }
	})
}

function onaudioprocess(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaudioprocess=function(onevent){ callback(event,onevent) }
	})
}

// onaudiostart
function audiostart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaudiostart=function(onevent){ callback(event,onevent) }
	})
}

function onaudiostart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onaudiostart=function(onevent){ callback(event,onevent) }
	})
}

// onauxclick
function auxclick(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onauxclick=function(onevent){ callback(event,onevent) }
	})
}

function onauxclick(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onauxclick=function(onevent){ callback(event,onevent) }
	})
}

// onbeforeinput
function beforeinput(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforeinput=function(onevent){ callback(event,onevent) }
	})
}

function onbeforeinput(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforeinput=function(onevent){ callback(event,onevent) }
	})
}

// onbeforeprint
function beforeprint(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforeprint=function(onevent){ callback(event,onevent) }
	})
}

function onbeforeprint(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforeprint=function(onevent){ callback(event,onevent) }
	})
}

// onbeforescriptexecute
function beforescriptexecute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforescriptexecute=function(onevent){ callback(event,onevent) }
	})
}

function onbeforescriptexecute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforescriptexecute=function(onevent){ callback(event,onevent) }
	})
}

// onbeforeunload
function beforeunload(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforeunload=function(onevent){ callback(event,onevent) }
	})
}

function onbeforeunload(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeforeunload=function(onevent){ callback(event,onevent) }
	})
}

// onbeginEvent
function beginEvent(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeginEvent=function(onevent){ callback(event,onevent) }
	})
}

function onbeginEvent(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbeginEvent=function(onevent){ callback(event,onevent) }
	})
}

// onblocked
function blocked(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onblocked=function(onevent){ callback(event,onevent) }
	})
}

function onblocked(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onblocked=function(onevent){ callback(event,onevent) }
	})
}

// onblur
// function blur(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onblur=function(onevent){ callback(event,onevent) }
//     })
// }

function onblur(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onblur=function(onevent){ callback(event,onevent) }
	})
}

// onboundary
function boundary(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onboundary=function(onevent){ callback(event,onevent) }
	})
}

function onboundary(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onboundary=function(onevent){ callback(event,onevent) }
	})
}

// onbufferedamountlow
function bufferedamountlow(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbufferedamountlow=function(onevent){ callback(event,onevent) }
	})
}

function onbufferedamountlow(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onbufferedamountlow=function(onevent){ callback(event,onevent) }
	})
}

// oncancel
function cancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncancel=function(onevent){ callback(event,onevent) }
	})
}

function oncancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncancel=function(onevent){ callback(event,onevent) }
	})
}

// oncanplay
function canplay(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncanplay=function(onevent){ callback(event,onevent) }
	})
}

function oncanplay(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncanplay=function(onevent){ callback(event,onevent) }
	})
}

// oncanplaythrough
function canplaythrough(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncanplaythrough=function(onevent){ callback(event,onevent) }
	})
}

function oncanplaythrough(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncanplaythrough=function(onevent){ callback(event,onevent) }
	})
}

// onchange
function change(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onchange=function(onevent){ callback(event,onevent) }
	})
}

function onchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onchange=function(onevent){ callback(event,onevent) }
	})
}

// onclick
function click(element){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				event.click()
			})
		}else{
			element.click()
		}
	}else{
		domgetall(element).forEach(function(event){
			event.click()
		})
	}
}

function onclick(element,callback=function(){},samecheck=false){
	if(samecheck){
		domgetall(element).forEach(function(event){
			event.style.cursor="pointer"
			event.onclick=function(onevent){
				if(onevent.target==event){
					callback(event,onevent)
				}
			}
		})
	}else{
		domgetall(element).forEach(function(event){
			event.style.cursor="pointer"
			event.onclick=function(onevent){ callback(event,onevent) }
		})
	}
}

// onclose
// function close(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onclose=function(onevent){ callback(event,onevent) }
//     })
// }

function onclose(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onclose=function(onevent){ callback(event,onevent) }
	})
}

// onclosing
function closing(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onclosing=function(onevent){ callback(event,onevent) }
	})
}

function onclosing(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onclosing=function(onevent){ callback(event,onevent) }
	})
}

// oncomplete
function complete(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncomplete=function(onevent){ callback(event,onevent) }
	})
}

function oncomplete(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncomplete=function(onevent){ callback(event,onevent) }
	})
}

// oncompositionend
function compositionend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncompositionend=function(onevent){ callback(event,onevent) }
	})
}

function oncompositionend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncompositionend=function(onevent){ callback(event,onevent) }
	})
}

// oncompositionstart
function compositionstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncompositionstart=function(onevent){ callback(event,onevent) }
	})
}

function oncompositionstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncompositionstart=function(onevent){ callback(event,onevent) }
	})
}

// oncompositionupdate
function compositionupdate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncompositionupdate=function(onevent){ callback(event,onevent) }
	})
}

function oncompositionupdate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncompositionupdate=function(onevent){ callback(event,onevent) }
	})
}

// onconnect
function connect(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onconnect=function(onevent){ callback(event,onevent) }
	})
}

function onconnect(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onconnect=function(onevent){ callback(event,onevent) }
	})
}

// onconnectionstatechange
function connectionstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onconnectionstatechange=function(onevent){ callback(event,onevent) }
	})
}

function onconnectionstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onconnectionstatechange=function(onevent){ callback(event,onevent) }
	})
}

// oncontentdelete
function contentdelete(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncontentdelete=function(onevent){ callback(event,onevent) }
	})
}

function oncontentdelete(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncontentdelete=function(onevent){ callback(event,onevent) }
	})
}

// oncontextmenu
function contextmenu(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncontextmenu=function(onevent){ callback(event,onevent) }
	})
}

function oncontextmenu(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncontextmenu=function(onevent){ callback(event,onevent) }
	})
}

// oncopy
function copy(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncopy=function(onevent){ callback(event,onevent) }
	})
}

function oncopy(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncopy=function(onevent){ callback(event,onevent) }
	})
}

// oncuechange
function cuechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncuechange=function(onevent){ callback(event,onevent) }
	})
}

function oncuechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncuechange=function(onevent){ callback(event,onevent) }
	})
}

// oncut
function cut(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncut=function(onevent){ callback(event,onevent) }
	})
}

function oncut(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oncut=function(onevent){ callback(event,onevent) }
	})
}

// ondatachannel
function datachannel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondatachannel=function(onevent){ callback(event,onevent) }
	})
}

function ondatachannel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondatachannel=function(onevent){ callback(event,onevent) }
	})
}

// ondblclick
function dblclick(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondblclick=function(onevent){ callback(event,onevent) }
	})
}

function ondblclick(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondblclick=function(onevent){ callback(event,onevent) }
	})
}

// ondevicechange
function devicechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondevicechange=function(onevent){ callback(event,onevent) }
	})
}

function ondevicechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondevicechange=function(onevent){ callback(event,onevent) }
	})
}

// ondevicemotion
function devicemotion(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondevicemotion=function(onevent){ callback(event,onevent) }
	})
}

function ondevicemotion(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondevicemotion=function(onevent){ callback(event,onevent) }
	})
}

// ondeviceorientation
function deviceorientation(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondeviceorientation=function(onevent){ callback(event,onevent) }
	})
}

function ondeviceorientation(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondeviceorientation=function(onevent){ callback(event,onevent) }
	})
}

// onDOMActivate
function DOMActivate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onDOMActivate=function(onevent){ callback(event,onevent) }
	})
}

function onDOMActivate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onDOMActivate=function(onevent){ callback(event,onevent) }
	})
}

// onDOMContentLoaded
function DOMContentLoaded(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onDOMContentLoaded=function(onevent){ callback(event,onevent) }
	})
}

function onDOMContentLoaded(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onDOMContentLoaded=function(onevent){ callback(event,onevent) }
	})
}

// onDOMMouseScroll
function DOMMouseScroll(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onDOMMouseScroll=function(onevent){ callback(event,onevent) }
	})
}

function onDOMMouseScroll(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onDOMMouseScroll=function(onevent){ callback(event,onevent) }
	})
}

// ondrag
function drag(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondrag=function(onevent){ callback(event,onevent) }
	})
}

function ondrag(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondrag=function(onevent){ callback(event,onevent) }
	})
}

// ondragend
function dragend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragend=function(onevent){ callback(event,onevent) }
	})
}

function ondragend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragend=function(onevent){ callback(event,onevent) }
	})
}

// ondragenter
function dragenter(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragenter=function(onevent){ callback(event,onevent) }
	})
}

function ondragenter(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragenter=function(onevent){ callback(event,onevent) }
	})
}

// ondragleave
function dragleave(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragleave=function(onevent){ callback(event,onevent) }
	})
}

function ondragleave(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragleave=function(onevent){ callback(event,onevent) }
	})
}

// ondragover
function dragover(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragover=function(onevent){ callback(event,onevent) }
	})
}

function ondragover(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragover=function(onevent){ callback(event,onevent) }
	})
}

// ondragstart
function dragstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragstart=function(onevent){ callback(event,onevent) }
	})
}

function ondragstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondragstart=function(onevent){ callback(event,onevent) }
	})
}

// ondrop
function drop(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondrop=function(onevent){ callback(event,onevent) }
	})
}

function ondrop(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondrop=function(onevent){ callback(event,onevent) }
	})
}

// ondurationchange
function durationchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondurationchange=function(onevent){ callback(event,onevent) }
	})
}

function ondurationchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ondurationchange=function(onevent){ callback(event,onevent) }
	})
}

// onemptied
function emptied(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onemptied=function(onevent){ callback(event,onevent) }
	})
}

function onemptied(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onemptied=function(onevent){ callback(event,onevent) }
	})
}

// onend
function end(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onend=function(onevent){ callback(event,onevent) }
	})
}

function onend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onend=function(onevent){ callback(event,onevent) }
	})
}

// onended
function ended(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onended=function(onevent){ callback(event,onevent) }
	})
}

function onended(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onended=function(onevent){ callback(event,onevent) }
	})
}

// onendEvent
function endEvent(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onendEvent=function(onevent){ callback(event,onevent) }
	})
}

function onendEvent(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onendEvent=function(onevent){ callback(event,onevent) }
	})
}

// onenterpictureinpicture
function enterpictureinpicture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onenterpictureinpicture=function(onevent){ callback(event,onevent) }
	})
}

function onenterpictureinpicture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onenterpictureinpicture=function(onevent){ callback(event,onevent) }
	})
}

// onerror
function error(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onerror=function(onevent){ callback(event,onevent) }
	})
}

function onerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onerror=function(onevent){ callback(event,onevent) }
	})
}

// onfocus
// function focus(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onfocus=function(onevent){ callback(event,onevent) }
//     })
// }

function onfocus(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfocus=function(onevent){ callback(event,onevent) }
	})
}

// onfocusin
function focusin(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfocusin=function(onevent){ callback(event,onevent) }
	})
}

function onfocusin(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfocusin=function(onevent){ callback(event,onevent) }
	})
}

// onfocusout
function focusout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfocusout=function(onevent){ callback(event,onevent) }
	})
}

function onfocusout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfocusout=function(onevent){ callback(event,onevent) }
	})
}

// onformdata
// function formdata(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onformdata=function(onevent){ callback(event,onevent) }
//     })
// }

function onformdata(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onformdata=function(onevent){ callback(event,onevent) }
	})
}

// onfullscreenchange
function fullscreenchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfullscreenchange=function(onevent){ callback(event,onevent) }
	})
}

function onfullscreenchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfullscreenchange=function(onevent){ callback(event,onevent) }
	})
}

// onfullscreenerror
function fullscreenerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfullscreenerror=function(onevent){ callback(event,onevent) }
	})
}

function onfullscreenerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onfullscreenerror=function(onevent){ callback(event,onevent) }
	})
}

// ongamepadconnected
function gamepadconnected(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongamepadconnected=function(onevent){ callback(event,onevent) }
	})
}

function ongamepadconnected(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongamepadconnected=function(onevent){ callback(event,onevent) }
	})
}

// ongamepaddisconnected
function gamepaddisconnected(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongamepaddisconnected=function(onevent){ callback(event,onevent) }
	})
}

function ongamepaddisconnected(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongamepaddisconnected=function(onevent){ callback(event,onevent) }
	})
}

// ongatheringstatechange
function gatheringstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongatheringstatechange=function(onevent){ callback(event,onevent) }
	})
}

function ongatheringstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongatheringstatechange=function(onevent){ callback(event,onevent) }
	})
}

// ongesturechange
function gesturechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongesturechange=function(onevent){ callback(event,onevent) }
	})
}

function ongesturechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongesturechange=function(onevent){ callback(event,onevent) }
	})
}

// ongestureend
function gestureend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongestureend=function(onevent){ callback(event,onevent) }
	})
}

function ongestureend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongestureend=function(onevent){ callback(event,onevent) }
	})
}

// ongesturestart
function gesturestart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongesturestart=function(onevent){ callback(event,onevent) }
	})
}

function ongesturestart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongesturestart=function(onevent){ callback(event,onevent) }
	})
}

// ongotpointercapture
function gotpointercapture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongotpointercapture=function(onevent){ callback(event,onevent) }
	})
}

function ongotpointercapture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ongotpointercapture=function(onevent){ callback(event,onevent) }
	})
}

// onhashchange
function hashchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onhashchange=function(onevent){ callback(event,onevent) }
	})
}

function onhashchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onhashchange=function(onevent){ callback(event,onevent) }
	})
}

// onicecandidate
function icecandidate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onicecandidate=function(onevent){ callback(event,onevent) }
	})
}

function onicecandidate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onicecandidate=function(onevent){ callback(event,onevent) }
	})
}

// onicecandidateerror
function icecandidateerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onicecandidateerror=function(onevent){ callback(event,onevent) }
	})
}

function onicecandidateerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onicecandidateerror=function(onevent){ callback(event,onevent) }
	})
}

// oniceconnectionstatechange
function iceconnectionstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oniceconnectionstatechange=function(onevent){ callback(event,onevent) }
	})
}

function oniceconnectionstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oniceconnectionstatechange=function(onevent){ callback(event,onevent) }
	})
}

// onicegatheringstatechange
function icegatheringstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onicegatheringstatechange=function(onevent){ callback(event,onevent) }
	})
}

function onicegatheringstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onicegatheringstatechange=function(onevent){ callback(event,onevent) }
	})
}

// onIDBDatabase
function IDBDatabase(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onIDBDatabase=function(onevent){ callback(event,onevent) }
	})
}

function onIDBDatabase(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onIDBDatabase=function(onevent){ callback(event,onevent) }
	})
}

// onIDBRequest
function IDBRequest(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onIDBRequest=function(onevent){ callback(event,onevent) }
	})
}

function onIDBRequest(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onIDBRequest=function(onevent){ callback(event,onevent) }
	})
}

// onIDBTransaction
function IDBTransaction(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onIDBTransaction=function(onevent){ callback(event,onevent) }
	})
}

function onIDBTransaction(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onIDBTransaction=function(onevent){ callback(event,onevent) }
	})
}

// oninput
function input(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninput=function(onevent){ callback(event,onevent) }
	})
}

function oninput(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninput=function(onevent){ callback(event,onevent) }
	})
}

// oninputsourceschange
function inputsourceschange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninputsourceschange=function(onevent){ callback(event,onevent) }
	})
}

function oninputsourceschange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninputsourceschange=function(onevent){ callback(event,onevent) }
	})
}

// oninstall
function install(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninstall=function(onevent){ callback(event,onevent) }
	})
}

function oninstall(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninstall=function(onevent){ callback(event,onevent) }
	})
}

// oninvalid
function invalid(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninvalid=function(onevent){ callback(event,onevent) }
	})
}

function oninvalid(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.oninvalid=function(onevent){ callback(event,onevent) }
	})
}

// onkeydown
function keydown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onkeydown=function(onevent){ callback(event,onevent) }
	})
}

function onkeydown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onkeydown=function(onevent){ callback(event,onevent) }
	})
}

// onkeypress
function keypress(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onkeypress=function(onevent){ callback(event,onevent) }
	})
}

function onkeypress(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onkeypress=function(onevent){ callback(event,onevent) }
	})
}

// onkeyup
function keyup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onkeyup=function(onevent){ callback(event,onevent) }
	})
}

function onkeyup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onkeyup=function(onevent){ callback(event,onevent) }
	})
}

// onlanguagechange
function languagechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onlanguagechange=function(onevent){ callback(event,onevent) }
	})
}

function onlanguagechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onlanguagechange=function(onevent){ callback(event,onevent) }
	})
}

// onleavepictureinpicture
function leavepictureinpicture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onleavepictureinpicture=function(onevent){ callback(event,onevent) }
	})
}

function onleavepictureinpicture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onleavepictureinpicture=function(onevent){ callback(event,onevent) }
	})
}

// onload
function load(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onload=function(onevent){ callback(event,onevent) }
	})
}

// function onload(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onload=function(onevent){ callback(event,onevent) }
//     })
// }

// onloadeddata
function loadeddata(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadeddata=function(onevent){ callback(event,onevent) }
	})
}

function onloadeddata(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadeddata=function(onevent){ callback(event,onevent) }
	})
}

// onloadedmetadata
function loadedmetadata(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadedmetadata=function(onevent){ callback(event,onevent) }
	})
}

function onloadedmetadata(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadedmetadata=function(onevent){ callback(event,onevent) }
	})
}

// onloadend
function loadend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadend=function(onevent){ callback(event,onevent) }
	})
}

function onloadend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadend=function(onevent){ callback(event,onevent) }
	})
}

// onloadstart
function loadstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadstart=function(onevent){ callback(event,onevent) }
	})
}

function onloadstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onloadstart=function(onevent){ callback(event,onevent) }
	})
}

// onlostpointercapture
function lostpointercapture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onlostpointercapture=function(onevent){ callback(event,onevent) }
	})
}

function onlostpointercapture(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onlostpointercapture=function(onevent){ callback(event,onevent) }
	})
}

// onmark
function mark(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmark=function(onevent){ callback(event,onevent) }
	})
}

function onmark(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmark=function(onevent){ callback(event,onevent) }
	})
}

// onMediaStream
function MediaStream(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onMediaStream=function(onevent){ callback(event,onevent) }
	})
}

function onMediaStream(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onMediaStream=function(onevent){ callback(event,onevent) }
	})
}

// onmerchantvalidation
function merchantvalidation(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmerchantvalidation=function(onevent){ callback(event,onevent) }
	})
}

function onmerchantvalidation(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmerchantvalidation=function(onevent){ callback(event,onevent) }
	})
}

// onmessage
// function message(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onmessage=function(onevent){ callback(event,onevent) }
//     })
// }

function getmessage(callback=function(){}){
	window.onmessage=function(onevent){ callback(this,onevent) }
}

// onmessageerror
function messageerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmessageerror=function(onevent){ callback(event,onevent) }
	})
}

function onmessageerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmessageerror=function(onevent){ callback(event,onevent) }
	})
}

// onmousedown
function mousedown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmousedown=function(onevent){ callback(event,onevent) }
	})
}

function onmousedown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmousedown=function(onevent){ callback(event,onevent) }
	})
}

// onmouseenter
function mouseenter(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseenter=function(onevent){ callback(event,onevent) }
	})
}

function onmouseenter(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseenter=function(onevent){ callback(event,onevent) }
	})
}

// onmouseleave
function mouseleave(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseleave=function(onevent){ callback(event,onevent) }
	})
}

function onmouseleave(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseleave=function(onevent){ callback(event,onevent) }
	})
}

// onmousemove
function mousemove(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmousemove=function(onevent){ callback(event,onevent) }
	})
}

function onmousemove(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmousemove=function(onevent){ callback(event,onevent) }
	})
}

// onmouseout
function mouseout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseout=function(onevent){ callback(event,onevent) }
	})
}

function onmouseout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseout=function(onevent){ callback(event,onevent) }
	})
}

// onmouseover
function mouseover(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseover=function(onevent){ callback(event,onevent) }
	})
}

function onmouseover(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseover=function(onevent){ callback(event,onevent) }
	})
}

// onmouseup
function mouseup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseup=function(onevent){ callback(event,onevent) }
	})
}

function onmouseup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmouseup=function(onevent){ callback(event,onevent) }
	})
}

// onmousewheel
function mousewheel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmousewheel=function(onevent){ callback(event,onevent) }
	})
}

function onmousewheel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmousewheel=function(onevent){ callback(event,onevent) }
	})
}

// onmute
function mute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmute=function(onevent){ callback(event,onevent) }
	})
}

function onmute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onmute=function(onevent){ callback(event,onevent) }
	})
}

// onnegotiationneeded
function negotiationneeded(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onnegotiationneeded=function(onevent){ callback(event,onevent) }
	})
}

function onnegotiationneeded(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onnegotiationneeded=function(onevent){ callback(event,onevent) }
	})
}

// onnomatch
function nomatch(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onnomatch=function(onevent){ callback(event,onevent) }
	})
}

function onnomatch(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onnomatch=function(onevent){ callback(event,onevent) }
	})
}

// onnotificationclick
function notificationclick(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onnotificationclick=function(onevent){ callback(event,onevent) }
	})
}

function onnotificationclick(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onnotificationclick=function(onevent){ callback(event,onevent) }
	})
}

// onoffline
function offline(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onoffline=function(onevent){ callback(event,onevent) }
	})
}

function onoffline(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onoffline=function(onevent){ callback(event,onevent) }
	})
}

// ononline
function online(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ononline=function(onevent){ callback(event,onevent) }
	})
}

function ononline(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ononline=function(onevent){ callback(event,onevent) }
	})
}

// onopen
// function open(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onopen=function(onevent){ callback(event,onevent) }
//     })
// }

function onopen(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onopen=function(onevent){ callback(event,onevent) }
	})
}

// onorientationchange
function orientationchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onorientationchange=function(onevent){ callback(event,onevent) }
	})
}

function onorientationchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onorientationchange=function(onevent){ callback(event,onevent) }
	})
}

// onpagehide
function pagehide(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpagehide=function(onevent){ callback(event,onevent) }
	})
}

function onpagehide(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpagehide=function(onevent){ callback(event,onevent) }
	})
}

// onpageshow
function pageshow(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpageshow=function(onevent){ callback(event,onevent) }
	})
}

function onpageshow(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpageshow=function(onevent){ callback(event,onevent) }
	})
}

// onpaste
function paste(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpaste=function(onevent){ callback(event,onevent) }
	})
}

function onpaste(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpaste=function(onevent){ callback(event,onevent) }
	})
}

// onpause
function pause(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpause=function(onevent){ callback(event,onevent) }
	})
}

function onpause(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpause=function(onevent){ callback(event,onevent) }
	})
}

// onpayerdetailchange
function payerdetailchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpayerdetailchange=function(onevent){ callback(event,onevent) }
	})
}

function onpayerdetailchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpayerdetailchange=function(onevent){ callback(event,onevent) }
	})
}

// onpaymentmethodchange
function paymentmethodchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpaymentmethodchange=function(onevent){ callback(event,onevent) }
	})
}

function onpaymentmethodchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpaymentmethodchange=function(onevent){ callback(event,onevent) }
	})
}

// onplay
// function play(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onplay=function(onevent){ callback(event,onevent) }
//     })
// }

function onplay(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onplay=function(onevent){ callback(event,onevent) }
	})
}

// onplaying
// function playing(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onplaying=function(onevent){ callback(event,onevent) }
//     })
// }

function onplaying(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onplaying=function(onevent){ callback(event,onevent) }
	})
}

// onpointercancel
function pointercancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointercancel=function(onevent){ callback(event,onevent) }
	})
}

function onpointercancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointercancel=function(onevent){ callback(event,onevent) }
	})
}

// onpointerdown
function pointerdown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerdown=function(onevent){ callback(event,onevent) }
	})
}

function onpointerdown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerdown=function(onevent){ callback(event,onevent) }
	})
}

// onpointerenter
function pointerenter(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerenter=function(onevent){ callback(event,onevent) }
	})
}

function onpointerenter(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerenter=function(onevent){ callback(event,onevent) }
	})
}

// onpointerleave
function pointerleave(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerleave=function(onevent){ callback(event,onevent) }
	})
}

function onpointerleave(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerleave=function(onevent){ callback(event,onevent) }
	})
}

// onpointerlockchange
function pointerlockchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerlockchange=function(onevent){ callback(event,onevent) }
	})
}

function onpointerlockchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerlockchange=function(onevent){ callback(event,onevent) }
	})
}

// onpointerlockerror
function pointerlockerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerlockerror=function(onevent){ callback(event,onevent) }
	})
}

function onpointerlockerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerlockerror=function(onevent){ callback(event,onevent) }
	})
}

// onpointermove
function pointermove(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointermove=function(onevent){ callback(event,onevent) }
	})
}

function onpointermove(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointermove=function(onevent){ callback(event,onevent) }
	})
}

// onpointerout
function pointerout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerout=function(onevent){ callback(event,onevent) }
	})
}

function onpointerout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerout=function(onevent){ callback(event,onevent) }
	})
}

// onpointerover
function pointerover(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerover=function(onevent){ callback(event,onevent) }
	})
}

function onpointerover(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerover=function(onevent){ callback(event,onevent) }
	})
}

// onpointerup
function pointerup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerup=function(onevent){ callback(event,onevent) }
	})
}

function onpointerup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpointerup=function(onevent){ callback(event,onevent) }
	})
}

// onpopstate
function popstate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpopstate=function(onevent){ callback(event,onevent) }
	})
}

function onpopstate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpopstate=function(onevent){ callback(event,onevent) }
	})
}

// onprogress
function progress(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onprogress=function(onevent){ callback(event,onevent) }
	})
}

function onprogress(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onprogress=function(onevent){ callback(event,onevent) }
	})
}

// onpush
function push(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpush=function(onevent){ callback(event,onevent) }
	})
}

function onpush(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpush=function(onevent){ callback(event,onevent) }
	})
}

// onpushsubscriptionchange
function pushsubscriptionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpushsubscriptionchange=function(onevent){ callback(event,onevent) }
	})
}

function onpushsubscriptionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onpushsubscriptionchange=function(onevent){ callback(event,onevent) }
	})
}

// onratechange
function ratechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onratechange=function(onevent){ callback(event,onevent) }
	})
}

function onratechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onratechange=function(onevent){ callback(event,onevent) }
	})
}

// onreadystatechange
function readystatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onreadystatechange=function(onevent){ callback(event,onevent) }
	})
}

function onreadystatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onreadystatechange=function(onevent){ callback(event,onevent) }
	})
}

// onrejectionhandled
function rejectionhandled(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onrejectionhandled=function(onevent){ callback(event,onevent) }
	})
}

function onrejectionhandled(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onrejectionhandled=function(onevent){ callback(event,onevent) }
	})
}

// onremovestream
function removestream(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onremovestream=function(onevent){ callback(event,onevent) }
	})
}

function onremovestream(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onremovestream=function(onevent){ callback(event,onevent) }
	})
}

// onremovetrack
function removetrack(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onremovetrack=function(onevent){ callback(event,onevent) }
	})
}

function onremovetrack(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onremovetrack=function(onevent){ callback(event,onevent) }
	})
}

// onremoveTrack
function removeTrack(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onremoveTrack=function(onevent){ callback(event,onevent) }
	})
}

function onremoveTrack(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onremoveTrack=function(onevent){ callback(event,onevent) }
	})
}

// onrepeatEvent
function repeatEvent(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onrepeatEvent=function(onevent){ callback(event,onevent) }
	})
}

function onrepeatEvent(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onrepeatEvent=function(onevent){ callback(event,onevent) }
	})
}

// onreset
function reset(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onreset=function(onevent){ callback(event,onevent) }
	})
}

function onreset(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onreset=function(onevent){ callback(event,onevent) }
	})
}

// onresize
function resize(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresize=function(onevent){ callback(event,onevent) }
	})
}

function onresize(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresize=function(onevent){ callback(event,onevent) }
	})
}

// onresourcetimingbufferfull
function resourcetimingbufferfull(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresourcetimingbufferfull=function(onevent){ callback(event,onevent) }
	})
}

function onresourcetimingbufferfull(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresourcetimingbufferfull=function(onevent){ callback(event,onevent) }
	})
}

// onresult
function result(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresult=function(onevent){ callback(event,onevent) }
	})
}

function onresult(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresult=function(onevent){ callback(event,onevent) }
	})
}

// onresume
function resume(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresume=function(onevent){ callback(event,onevent) }
	})
}

function onresume(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onresume=function(onevent){ callback(event,onevent) }
	})
}

// onScriptProcessorNode
function ScriptProcessorNode(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onScriptProcessorNode=function(onevent){ callback(event,onevent) }
	})
}

function onScriptProcessorNode(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onScriptProcessorNode=function(onevent){ callback(event,onevent) }
	})
}

// onscroll
// function scroll(element,callback=function(){}){
//     domgetall(element).forEach(function(event){
//         event.onscroll=function(onevent){ callback(event,onevent) }
//     })
// }

function onscroll(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onscroll=function(onevent){ callback(event,onevent) }
	})
}

// onsearch
function search(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsearch=function(onevent){ callback(event,onevent) }
	})
}

function onsearch(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsearch=function(onevent){ callback(event,onevent) }
	})
}

// onseeked
function seeked(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onseeked=function(onevent){ callback(event,onevent) }
	})
}

function onseeked(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onseeked=function(onevent){ callback(event,onevent) }
	})
}

// onseeking
function seeking(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onseeking=function(onevent){ callback(event,onevent) }
	})
}

function onseeking(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onseeking=function(onevent){ callback(event,onevent) }
	})
}

// onselect
function select(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselect=function(onevent){ callback(event,onevent) }
	})
}

function onselect(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselect=function(onevent){ callback(event,onevent) }
	})
}

// onselectedcandidatepairchange
function selectedcandidatepairchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectedcandidatepairchange=function(onevent){ callback(event,onevent) }
	})
}

function onselectedcandidatepairchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectedcandidatepairchange=function(onevent){ callback(event,onevent) }
	})
}

// onselectend
function selectend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectend=function(onevent){ callback(event,onevent) }
	})
}

function onselectend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectend=function(onevent){ callback(event,onevent) }
	})
}

// onselectionchange
function selectionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectionchange=function(onevent){ callback(event,onevent) }
	})
}

function onselectionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectionchange=function(onevent){ callback(event,onevent) }
	})
}

// onselectstart
function selectstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectstart=function(onevent){ callback(event,onevent) }
	})
}

function onselectstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onselectstart=function(onevent){ callback(event,onevent) }
	})
}

// onServiceWorkerContainer
function ServiceWorkerContainer(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onServiceWorkerContainer=function(onevent){ callback(event,onevent) }
	})
}

function onServiceWorkerContainer(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onServiceWorkerContainer=function(onevent){ callback(event,onevent) }
	})
}

// onshippingaddresschange
function shippingaddresschange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onshippingaddresschange=function(onevent){ callback(event,onevent) }
	})
}

function onshippingaddresschange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onshippingaddresschange=function(onevent){ callback(event,onevent) }
	})
}

// onshippingoptionchange
function shippingoptionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onshippingoptionchange=function(onevent){ callback(event,onevent) }
	})
}

function onshippingoptionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onshippingoptionchange=function(onevent){ callback(event,onevent) }
	})
}

// onsignalingstatechange
function signalingstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsignalingstatechange=function(onevent){ callback(event,onevent) }
	})
}

function onsignalingstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsignalingstatechange=function(onevent){ callback(event,onevent) }
	})
}

// onslotchange
function slotchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onslotchange=function(onevent){ callback(event,onevent) }
	})
}

function onslotchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onslotchange=function(onevent){ callback(event,onevent) }
	})
}

// onsoundend
function soundend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsoundend=function(onevent){ callback(event,onevent) }
	})
}

function onsoundend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsoundend=function(onevent){ callback(event,onevent) }
	})
}

// onsoundstart
function soundstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsoundstart=function(onevent){ callback(event,onevent) }
	})
}

function onsoundstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsoundstart=function(onevent){ callback(event,onevent) }
	})
}

// onspeechend
function speechend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onspeechend=function(onevent){ callback(event,onevent) }
	})
}

function onspeechend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onspeechend=function(onevent){ callback(event,onevent) }
	})
}

// onSpeechRecognition
function SpeechRecognition(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onSpeechRecognition=function(onevent){ callback(event,onevent) }
	})
}

function onSpeechRecognition(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onSpeechRecognition=function(onevent){ callback(event,onevent) }
	})
}

// onspeechstart
function speechstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onspeechstart=function(onevent){ callback(event,onevent) }
	})
}

function onspeechstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onspeechstart=function(onevent){ callback(event,onevent) }
	})
}

// onsqueeze
function squeeze(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsqueeze=function(onevent){ callback(event,onevent) }
	})
}

function onsqueeze(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsqueeze=function(onevent){ callback(event,onevent) }
	})
}

// onsqueezeend
function squeezeend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsqueezeend=function(onevent){ callback(event,onevent) }
	})
}

function onsqueezeend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsqueezeend=function(onevent){ callback(event,onevent) }
	})
}

// onsqueezestart
function squeezestart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsqueezestart=function(onevent){ callback(event,onevent) }
	})
}

function onsqueezestart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsqueezestart=function(onevent){ callback(event,onevent) }
	})
}

// onstalled
function stalled(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstalled=function(onevent){ callback(event,onevent) }
	})
}

function onstalled(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstalled=function(onevent){ callback(event,onevent) }
	})
}

// onstart
function start(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstart=function(onevent){ callback(event,onevent) }
	})
}

function onstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstart=function(onevent){ callback(event,onevent) }
	})
}

// onstatechange
function statechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstatechange=function(onevent){ callback(event,onevent) }
	})
}

function onstatechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstatechange=function(onevent){ callback(event,onevent) }
	})
}

// onstorage
function storage(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstorage=function(onevent){ callback(event,onevent) }
	})
}

function onstorage(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onstorage=function(onevent){ callback(event,onevent) }
	})
}

// onsubmit
function submit(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsubmit=function(onevent){ callback(event,onevent) }
	})
}

function onsubmit(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsubmit=function(onevent){ callback(event,onevent) }
	})
}

// onsuccess
function success(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsuccess=function(onevent){ callback(event,onevent) }
	})
}

function onsuccess(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsuccess=function(onevent){ callback(event,onevent) }
	})
}

// onsuspend
function suspend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsuspend=function(onevent){ callback(event,onevent) }
	})
}

function onsuspend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onsuspend=function(onevent){ callback(event,onevent) }
	})
}

// onSVGElement
function SVGElement(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onSVGElement=function(onevent){ callback(event,onevent) }
	})
}

function onSVGElement(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onSVGElement=function(onevent){ callback(event,onevent) }
	})
}

// onTextTrackList
function TextTrackList(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onTextTrackList=function(onevent){ callback(event,onevent) }
	})
}

function onTextTrackList(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onTextTrackList=function(onevent){ callback(event,onevent) }
	})
}

// ontimeout
function timeout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontimeout=function(onevent){ callback(event,onevent) }
	})
}

function ontimeout(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontimeout=function(onevent){ callback(event,onevent) }
	})
}

// ontimeupdate
function timeupdate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontimeupdate=function(onevent){ callback(event,onevent) }
	})
}

function ontimeupdate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontimeupdate=function(onevent){ callback(event,onevent) }
	})
}

// ontoggle
function toggle(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontoggle=function(onevent){ callback(event,onevent) }
	})
}

function ontoggle(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontoggle=function(onevent){ callback(event,onevent) }
	})
}

// ontonechange
function tonechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontonechange=function(onevent){ callback(event,onevent) }
	})
}

function ontonechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontonechange=function(onevent){ callback(event,onevent) }
	})
}

// ontouchcancel
function touchcancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchcancel=function(onevent){ callback(event,onevent) }
	})
}

function ontouchcancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchcancel=function(onevent){ callback(event,onevent) }
	})
}

// ontouchend
function touchend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchend=function(onevent){ callback(event,onevent) }
	})
}

function ontouchend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchend=function(onevent){ callback(event,onevent) }
	})
}

// ontouchmove
function touchmove(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchmove=function(onevent){ callback(event,onevent) }
	})
}

function ontouchmove(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchmove=function(onevent){ callback(event,onevent) }
	})
}

// ontouchstart
function touchstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchstart=function(onevent){ callback(event,onevent) }
	})
}

function ontouchstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontouchstart=function(onevent){ callback(event,onevent) }
	})
}

// ontrack
function track(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontrack=function(onevent){ callback(event,onevent) }
	})
}

function ontrack(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontrack=function(onevent){ callback(event,onevent) }
	})
}

// ontransitioncancel
function transitioncancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitioncancel=function(onevent){ callback(event,onevent) }
	})
}

function ontransitioncancel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitioncancel=function(onevent){ callback(event,onevent) }
	})
}

// ontransitionend
function transitionend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitionend=function(onevent){ callback(event,onevent) }
	})
}

function ontransitionend(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitionend=function(onevent){ callback(event,onevent) }
	})
}

// ontransitionrun
function transitionrun(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitionrun=function(onevent){ callback(event,onevent) }
	})
}

function ontransitionrun(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitionrun=function(onevent){ callback(event,onevent) }
	})
}

// ontransitionstart
function transitionstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitionstart=function(onevent){ callback(event,onevent) }
	})
}

function ontransitionstart(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.ontransitionstart=function(onevent){ callback(event,onevent) }
	})
}

// onunhandledrejection
function unhandledrejection(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onunhandledrejection=function(onevent){ callback(event,onevent) }
	})
}

function onunhandledrejection(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onunhandledrejection=function(onevent){ callback(event,onevent) }
	})
}

// onunload
function unload(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onunload=function(onevent){ callback(event,onevent) }
	})
}

function onunload(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onunload=function(onevent){ callback(event,onevent) }
	})
}

// onunmute
function unmute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onunmute=function(onevent){ callback(event,onevent) }
	})
}

function onunmute(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onunmute=function(onevent){ callback(event,onevent) }
	})
}

// onupgradeneeded
function upgradeneeded(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onupgradeneeded=function(onevent){ callback(event,onevent) }
	})
}

function onupgradeneeded(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onupgradeneeded=function(onevent){ callback(event,onevent) }
	})
}

// onversionchange
function versionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onversionchange=function(onevent){ callback(event,onevent) }
	})
}

function onversionchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onversionchange=function(onevent){ callback(event,onevent) }
	})
}

// onVideoTrackList
function VideoTrackList(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onVideoTrackList=function(onevent){ callback(event,onevent) }
	})
}

function onVideoTrackList(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onVideoTrackList=function(onevent){ callback(event,onevent) }
	})
}

// onvisibilitychange
function visibilitychange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvisibilitychange=function(onevent){ callback(event,onevent) }
	})
}

function onvisibilitychange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvisibilitychange=function(onevent){ callback(event,onevent) }
	})
}

// onvoiceschanged
function voiceschanged(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvoiceschanged=function(onevent){ callback(event,onevent) }
	})
}

function onvoiceschanged(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvoiceschanged=function(onevent){ callback(event,onevent) }
	})
}

// onvolumechange
function volumechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvolumechange=function(onevent){ callback(event,onevent) }
	})
}

function onvolumechange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvolumechange=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplayactivate
function vrdisplayactivate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayactivate=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplayactivate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayactivate=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplayblur
function vrdisplayblur(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayblur=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplayblur(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayblur=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplayconnect
function vrdisplayconnect(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayconnect=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplayconnect(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayconnect=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplaydeactivate
function vrdisplaydeactivate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaydeactivate=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplaydeactivate(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaydeactivate=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplaydisconnect
function vrdisplaydisconnect(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaydisconnect=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplaydisconnect(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaydisconnect=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplayfocus
function vrdisplayfocus(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayfocus=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplayfocus(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplayfocus=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplaypointerrestricted
function vrdisplaypointerrestricted(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaypointerrestricted=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplaypointerrestricted(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaypointerrestricted=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplaypointerunrestricted
function vrdisplaypointerunrestricted(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaypointerunrestricted=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplaypointerunrestricted(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaypointerunrestricted=function(onevent){ callback(event,onevent) }
	})
}

// onvrdisplaypresentchange
function vrdisplaypresentchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaypresentchange=function(onevent){ callback(event,onevent) }
	})
}

function onvrdisplaypresentchange(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onvrdisplaypresentchange=function(onevent){ callback(event,onevent) }
	})
}

// onwaiting
function waiting(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwaiting=function(onevent){ callback(event,onevent) }
	})
}

function onwaiting(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwaiting=function(onevent){ callback(event,onevent) }
	})
}

// onwebglcontextcreationerror
function webglcontextcreationerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebglcontextcreationerror=function(onevent){ callback(event,onevent) }
	})
}

function onwebglcontextcreationerror(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebglcontextcreationerror=function(onevent){ callback(event,onevent) }
	})
}

// onwebglcontextlost
function webglcontextlost(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebglcontextlost=function(onevent){ callback(event,onevent) }
	})
}

function onwebglcontextlost(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebglcontextlost=function(onevent){ callback(event,onevent) }
	})
}

// onwebglcontextrestored
function webglcontextrestored(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebglcontextrestored=function(onevent){ callback(event,onevent) }
	})
}

function onwebglcontextrestored(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebglcontextrestored=function(onevent){ callback(event,onevent) }
	})
}

// onwebkitmouseforcechanged
function webkitmouseforcechanged(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforcechanged=function(onevent){ callback(event,onevent) }
	})
}

function onwebkitmouseforcechanged(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforcechanged=function(onevent){ callback(event,onevent) }
	})
}

// onwebkitmouseforcedown
function webkitmouseforcedown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforcedown=function(onevent){ callback(event,onevent) }
	})
}

function onwebkitmouseforcedown(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforcedown=function(onevent){ callback(event,onevent) }
	})
}

// onwebkitmouseforceup
function webkitmouseforceup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforceup=function(onevent){ callback(event,onevent) }
	})
}

function onwebkitmouseforceup(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforceup=function(onevent){ callback(event,onevent) }
	})
}

// onwebkitmouseforcewillbegin
function webkitmouseforcewillbegin(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforcewillbegin=function(onevent){ callback(event,onevent) }
	})
}

function onwebkitmouseforcewillbegin(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwebkitmouseforcewillbegin=function(onevent){ callback(event,onevent) }
	})
}

// onWebSocket
// function WebSocket(element,callback=function(){}){
// 	domgetall(element).forEach(function(event){
// 		event.onWebSocket=function(onevent){ callback(event,onevent) }
// 	})
// }

// function onWebSocket(element,callback=function(){}){
// 	domgetall(element).forEach(function(event){
// 		event.onWebSocket=function(onevent){ callback(event,onevent) }
// 	})
// }

// onwheel
function wheel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwheel=function(onevent){ callback(event,onevent) }
	})
}

function onwheel(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onwheel=function(onevent){ callback(event,onevent) }
	})
}

// onWorkerGlobalScope
function WorkerGlobalScope(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onWorkerGlobalScope=function(onevent){ callback(event,onevent) }
	})
}

function onWorkerGlobalScope(element,callback=function(){}){
	domgetall(element).forEach(function(event){
		event.onWorkerGlobalScope=function(onevent){ callback(event,onevent) }
	})
}

function windowload(callback=function(){}){
	window.onload=function(event){ callback(event) }
}
// on* event END

// dom control START
function innerhtml(element,text,keep=true){
	if(typeof element=="object"){
		if(element.length){
			data=[]

			element.forEach(function(event){
				if(keep){
					event.innerHTML=`
						${event.innerHTML}
						${text}
					`
				}else{
					event.innerHTML=text
				}
				data.push(event.innerHTML)
			})

			return data
		}else{
			if(keep){
				element.innerHTML=`
					${element.innerHTML}
					${text}
				`
			}else{
				element.innerHTML=text
			}
			return element.innerHTML
		}
	}else{
		data=[]

		domgetall(element,function(event){
			if(keep){
				event.innerHTML=`
					${event.innerHTML}
					${text}
				`
			}else{
				event.innerHTML=text
			}
			data.push(event.innerHTML)
		})

		return data
	}
}

function innertext(element,text,keep=true){
	if(typeof element=="object"){
		if(element.length){
			data=[]

			element.forEach(function(event){
				if(keep){
					event.innerText=`
						${event.innerText}
						${text}
					`
				}else{
					event.innerText=text
				}
				data.push(event.innerText)
			})

			return data
		}else{
			if(keep){
				element.innerText=`
					${element.innerText}
					${text}
				`
			}else{
				element.innerText=text
			}
			return element.innerText
		}
	}else{
		data=[]

		domgetall(element,function(event){
			if(keep){
				event.innerText=`
					${event.innerText}
					${text}
				`
			}else{
				event.innerText=text
			}
			data.push(event.innerText)
		})

		return data
	}
}

function value(element,text,keep=false){
	if(typeof element=="object"){
		if(element.length){
			data=[]

			element.forEach(function(event){
				if(keep){
					event.value=`
						${event.value}
						${text}
					`
				}else{
					event.value=text
				}
				data.push(event.value)
			})

			return data
		}else{
			if(keep){
				element.value=`
					${element.value}
					${text}
				`
			}else{
				element.value=text
			}
			return element.value
		}
	}else{
		data=[]

		domgetall(element,function(event){
			if(keep){
				event.value=`
					${event.value}
					${text}
				`
			}else{
				event.value=text
			}
			data.push(event.value)
		})

		return data
	}
}

function getvalue(element){
	if(typeof element=="object"){
		if(element.length){
			let data=[]
			element.forEach(function(event){
				data.push(event.value)
			})
			return data
		}else{
			return element.value
		}
	}else{
		return domgetid(element).value
	}
}

function getinnerhtml(element){
	if(typeof element=="object"){
		if(element.length){
			let data=[]
			element.forEach(function(event){
				data.push(event.innerHTML)
			})
			return data
		}else{
			return element.innerHTML
		}
	}else{
		return domgetid(element).innerHTML
	}
}
// dom control END

function href(url){
	if(url==undefined){
		return location.href
	}else if(url==""){
		location.reload()
	}else{
		location.href=url
	}
}

function dataset(element,key,value=null){
	if(element){
		if(value!=null){
			element.dataset[key]=value
			return element.dataset[key]
		}else if(element.dataset[key]){
			return element.dataset[key]
		}else{
			throw "[DOMDATASETNOTFOUND_ERROR]function dataset can't find given dataset"
		}
	}else{
		throw "[DOMNOTFOUND_ERROR]function dataset can't find given element"
	}
}

function getfile(){
	return location.href.split("/")[location.href.split("/").length-1].split("?")[0].split("#")[0]
}

function style(element,style=[]){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				for(let i=0;i<style.length;i=i+1){
					event.style[style[i][0]]=style[i][1]
				}
			})
		}else{
			for(let i=0;i<style.length;i=i+1){
				element.style[style[i][0]]=style[i][1]
			}
		}
	}else{
		domgetall(element).forEach(function(event){
			for(let i=0;i<style.length;i=i+1){
				event.style[style[i][0]]=style[i][1]
			}
		})
	}
}

function removestyle(element,style=[]){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				for(let i=0;i<style.length;i=i+1){
					event.style[style[i][0]]="initial"
				}
			})
		}else{
			for(let i=0;i<style.length;i=i+1){
				element.style[style[i][0]]="initial"
			}
		}
	}else{
		domgetall(element).forEach(function(event){
			for(let i=0;i<style.length;i=i+1){
				event.style[style[i][0]]="initial"
			}
		})
	}
}

function addstyle(element,style=[]){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				for(let i=0;i<style.length;i=i+1){
					event.style[style[i][0]]=style[i][1]
				}
			})
		}else{
			for(let i=0;i<style.length;i=i+1){
				element.style[style[i][0]]=style[i][1]
			}
		}
	}else{
		domgetall(element).forEach(function(event){
			for(let i=0;i<style.length;i=i+1){
				event.style[style[i][0]]=style[i][1]
			}
		})
	}
}

function addclass(element,classlist=[]){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				event.classList=event.classList+" "+classlist.join(" ")
			})
		}else{
			element.classList=element.classList+" "+classlist.join(" ")
		}
	}else{
		domgetall(element).forEach(function(event){
			event.classList=event.classList+" "+classlist.join(" ")
		})
	}
}

function removeclass(element,classlist=[]){
	if(typeof element=="object"){
		if(element.length){
			element.forEach(function(event){
				for(let i=0;i<classlist.length;i=i+1){
					event.classList.remove(classlist[i])
				}
			})
		}else{
			for(let i=0;i<classlist.length;i=i+1){
				element.classList.remove(classlist[i])
			}
		}
	}else{
		domgetall(element).forEach(function(event){
			for(let i=0;i<classlist.length;i=i+1){
				event.classList.remove(classlist[i])
			}
		})
	}
}

function getget(key){
	if(location.href.split("?")[1]){
		let getlist=location.href.split("?")[1].split("&")
		for(let i=0;i<getlist.length;i=i+1){
			if(getlist[i].split("=")[0]==key){
				return getlist[i].split("=")[1]
			}
		}
	}else{
		return null
	}
}

function array(data){
	return Array(data)
}

function json(data){
	return JSON.parse(data)
}

function string(data){
	if(typeof data=="object"){
		return JSON.stringify(data)
	}else{
		return String(data)
	}
}

function str(data){
	if(typeof data=="object"){
		return JSON.stringify(data)
	}else{
		return String(data)
	}
}

function int(data){
	return parseInt(data)
}

function float(data){
	return parseFloat(data)
}

function min(...data){
	return Math.min(...data)
}

function max(...data){
	return Math.max(...data)
}

function prevpage(){
	history.back()
}

function nextpage(){
	history.forward()
}

async function importhtml(element,url,callback=function(){}){
	let data=await fetch(url)
	let text=await data.text()

	domgetall(element).forEach(function(event){
		event.innerHTML=text
		event.querySelectorAll("script").forEach(function(script){
			let newscript=document.createElement("script")
			newscript.textContent=script.textContent
			event.appendChild(newscript)
		})
	})

	callback()
}

// testing
function searchtagdiv(element,searchname,data){
    let sys = {
        show: false,
        search: "",
        searchresults: [],
        searchData: data,
        fun: function(text) {
            if(text === "") {
                sys.show = false
                document.getElementById("searchtagdiv").style.display = "none"
                return
            }
            const searchText = text.toLowerCase()
            sys.searchresults = sys.searchData.filter(item =>
                item.toLowerCase().includes(searchText)
            )
            sys.searchresults.sort((a, b) => {
                return a.length - b.length
            })
            sys.show = sys.searchresults.length > 0
            renderResults()
        }
    }

    function renderResults() {
        document.getElementById("searchtagdiv").innerHTML = ""
        if(sys.show) {
            sys.searchresults.forEach((item) => {
                let div = document.createElement("div")
                div.classList = "tagdiv"
                div.style.display = "flex"
                div.style.marginBottom = "8px"
                div.style.width = "100%"
                div.style.cursor = "pointer"
                div.innerHTML = `<div style="margin: 0; white-space: nowrap; width: 50%; font-weight: bolder;">${item}</div>`
                div.onclick = () => {
                    document.getElementById(searchname).value = item
                    sys.search = item
                    document.getElementById("searchtagdiv").style.display = "none"
                }
                document.getElementById("searchtagdiv").appendChild(div)
            })
            document.getElementById("searchtagdiv").style.display = "block"
        } else {
            document.getElementById("searchtagdiv").style.display = "none"
        }
    }

    document.getElementById(searchname).addEventListener("input", function(e) {
        sys.search = e.target.value
        sys.fun(sys.search)
    })

	document.getElementById(element).innerHTML=`
		<div class="tagdivdiv" id="searchtagdiv" style="display: none;"></div>
	`
}

function rangeslider(target=null,value=null,step=null,set=null,range=false,scale=true,labels=true,tooltip=true,style="roundstyle",lebel="",onchangecallback=null,stylelist=null){
	let input
	let inputdisplay
	let slider
	let sliderwidth
	let sliderleft
	let pointerwidth
	let pointerr
	let pointerl
	let activepointer
	let selecte
	let scale1
	let step1
	let tipl
	let tipr
	let disabled
	let values={
		start: null,
		end: null
	}

	// function START
	function drag(event){
		let dir=event.target.getAttribute("data-dir")

		event.preventDefault()

		if(!disabled){
			if(dir=="left"){
				activepointer=pointerl
			}
			if(dir=="right"){
				activepointer=pointerr
			}

			slider.classList.add("sliding")
		}else{
			return
		}
	}

	function move(event){
		if(activepointer&&!disabled){
			let coordx
			let index

			if(event.type=="touchmove"){
				coordx=event.touches[0].clientX
			}else{
				coordx=event.pageX
			}

			index=Math.round((coordx-sliderleft-(pointerwidth/2))/step1);

			if(index<=0){
				index=0
			}

			if(index>value.length-1){
				index=value.length-1
			}

			if(range){
				if(activepointer==pointerl){
					values.start=index
					if(values.start>=values.end){
						values.start=values.end-1
					}
				}
				if(activepointer==pointerr){
					values.end=index
				}
			}else{
				values.end=index
			}

			setvalue()
		}
	}

	function drop(){
		activepointer=null
	}

	function setvalue(start,end){
		let activepointer


		if(range){
			activepointer="start"
		}else{
			activepointer="end"
		}

		if(start&&value.indexOf(start)>-1){
			values[activepointer]=value.indexOf(start)
		}

		if(end&&value.indexOf(end)>-1){
			values.end=value.indexOf(end)
		}

		if(range&&values.start>=values.end){
			values.end=values.start+1
		}

		pointerl.style.left=(values[activepointer]*step1-(pointerwidth/2))+"px"

		if(range){
			if(tooltip){
				tipl.innerHTML=lebel+""+value[values.start]
				tipr.innerHTML=lebel+""+value[values.end]
			}
			input.value=value[values.start]+","+value[values.end]
			pointerr.style.left=(values.end*step1-(pointerwidth/2))+"px"
		}else{
			if(tooltip){
				tipl.innerHTML=lebel+""+value[values.end]
			}
			input.value=value[values.end];
		}

		if(values.end>value.length-1){
			values.end=value.length-1
		}

		if(values.start<0){
			values.start=0
		}

		selecte.style.width=(values.end-values.start)*step1+"px"
		selecte.style.left=values.start*step1+"px"

		change()
	}

	function change(){
		if(onchangecallback&&typeof onchangecallback=="function"){
			return onchangecallback(getvalue())
		}
	}

	function disable(data){
		disabled=data
		if(disabled){
			slider.classList.add("disabled")
		}else{
			slider.classList.remove("disabled")
		}
	}

	function getvalue(){
		return [value[values.start],value[values.end]]
	}

	function destroy(){
		input.style.display=inputdisplay
		slider.remove()
		return null
	}

	function createElement(el,cls,dataAttr){
		var element=document.createElement(el)
		if(cls) element.className=cls
		if(dataAttr&&dataAttr.length==2){
			element.setAttribute("data-"+dataAttr[0],dataAttr[1])
		}

		return element
	}
	// function END

	// 獲取input DOM
	if(typeof target=="object"){
		input=target
	}else{
		input=document.getElementById(target.replace("#",""))
	}

	if(input){
		inputdisplay=getComputedStyle(input,null).display
		input.style.display="none"
		disabled=input.disabled
		if((value instanceof Array)||(value["min"]!=undefined&&value["max"]!=undefined)){
			// init END

			slider=createElement("div","rangecontainer")
			slider.innerHTML=`<div class="rangebackground"></div>`
			selecte=createElement("div","rangeselected")
			pointerl=createElement("div","rangepointer",["dir","left"])
			scale1=createElement("div","rangescale")

			if(tooltip){
				tipl=createElement("div","rangetooltip")
				tipr=createElement("div","rangetooltip")
				pointerl.appendChild(tipl)
			}
			slider.appendChild(selecte)
			slider.appendChild(scale1)
			slider.appendChild(pointerl)

			if(range){
				pointerr=createElement("div","rangepointer",["dir","right"])
				if(tooltip){
					pointerr.appendChild(tipr)
				}
				slider.appendChild(pointerr)
			}

			slider.classList.add(style)

			input.parentNode.insertBefore(slider,input.nextSibling)
			sliderleft=slider.getBoundingClientRect().left
			sliderwidth=slider.clientWidth
			pointerwidth=pointerl.clientWidth

			if(!scale){
				slider.classList.add("rangenoscale")
			}

			if(disabled){
				slider.classList.add("disabled")
			}else{
				slider.classList.remove("disabled")
			}

			if(!(value instanceof Array)){

				let min=value.min
				let max=value.max
				let range=max-min

				value=[]

				if(step){
					for(let i=0;i<(range/step);i=i+1){
						value.push(min+(i*step))
					}

					if(value.indexOf(max)<0){
						value.push(max)
					}
				}else{
					console.warn("[WARNING]function rangeslider warn: no step defined")
					value=[value.min,value.max]
				}
			}


			values.start=0
			if(range){
				values.end=value.length-1
			}else{
				values.end=0
			}

			if(
				set&&
				set.length&&
				set.length>=1&&
				value.indexOf(set[0])>=0&&
				(!range||(range&&set.length>=2&&value.indexOf(set[1])>=0))
			){
				if(range){
					values.start=value.indexOf(set[0])
					if(set[1]){
						values["end"]=value.indexOf(set[1])
					}else{
						values["end"]=null
					}
				}else{
					values.end=value.indexOf(set[0])
				}
			}

			if(stylelist){
				for(let i=0;i<stylelist.length;i=i+1){
					for(let j=0;j<stylelist[i][1].length;j=j+1){
						stylelist[i][0].style[stylelist[j][0]]=stylelist[j][1]
					}
				}
			}

			step1=sliderwidth/(value.length-1);

			for(let i=0;i<value.length;i=i+1){
				var span=createElement("span")
				let ins=createElement("div")

				span.appendChild(ins)
				scale1.appendChild(span)

				if(i==value.length-1){
					span.style.width="0px"
				}else{
					span.style.width=step1+"px"
				}

				if(!labels){
					if(i==0||i==value.length-1){
						ins.innerHTML=value[i]
					}
				}else{
					ins.innerHTML=value[i]
				}

				ins.style.marginLeft=(ins.clientWidth/2)*-1+"px";
			}

			setvalue()

			slider.querySelectorAll(".rangepointer").forEach(function(event){
				event.onmousedown=function(event){
					drag(event)
				}
				event.ontouchstart=function(event){
					drag(event)
				}
			})

			slider.querySelectorAll("span").forEach(function(event){
				event.onclick=function(event){
					if(!disabled){
						let index=Math.round((event.clientX-sliderleft)/step1)

						if(index>value.length-1){
							index=value.length-1
						}

						if(index<0){
							index=0
						}

						if(range){
							if(index-values.start<=values.end-index){
								values.start=index
							}else{
								values.end=index
							}
						}else{
							values.end=index
						}

						slider.classList.remove("sliding")

						setvalue()
					}else{
						return
					}
				}
			})

			document.onmousemove=function(event){
				move(event)
			}

			document.ontouchmove=function(event){
				move(event)
			}

			document.onmouseup=function(event){
				drop(event)
			}

			document.ontouchend=function(event){
				drop(event)
			}

			document.ontouchcancel=function(event){
				drop(event)
			}

			window.onresize=function(){
				sliderleft=slider.getBoundingClientRect().left
				sliderwidth=slider.clientWidth
				step1=sliderwidth/(value.length-1)

				slider.querySelectorAll("span").forEach(function(event){
					event.style.width=step1+"px"
				})

				setvalue()
			}

			return{
				getvalue: getvalue,
				destroy: destroy,
				disabled: disabled
			}
		}else{
			throw "[KEYTYPEIN_ERROR]function rangeslider error: data missing min or max value"
		}
	}else{
		throw "[DOMNOTFOUND_ERROR]function rangetslider error: target element not find"
	}
}

// (語法: 輪播器的div id,各圖選擇器,是否有左右控制器,是否有下方控制器(dot: 一個點點,line: 一條線,timeline: 依時間滾動,image: 圖片,none: 沒有),更新時間(ms)(-1為不更新))
function carousel(id,carouselimageclass=".carouseimage",leftrightcontroller=true,indexcontroller="dot",carouseltime=1500){
	if(document.getElementById(id)){
		if(typeof leftrightcontroller=="boolean"){
			if(indexcontroller=="none"||indexcontroller=="dot"||indexcontroller=="line"||indexcontroller=="timeline"||indexcontroller=="image"){
				let count=0
				let index=0
				let innerhtml=``
				let totalindex=document.querySelectorAll(carouselimageclass).length

				// change image
				function change(){
					// 將所有圖片隱藏
					document.querySelectorAll(carouselimageclass).forEach(function(element){
						element.style.display="none"
					})

					// 將index圖片顯示
					if(document.querySelectorAll(carouselimageclass)[index]){
						document.querySelectorAll(carouselimageclass)[index].style.display="block"
					}


					if(indexcontroller=="dot"){
						document.querySelectorAll(".carouseldot").forEach(function(event){
							event.style.background="var(--stgray-200)"
						})
						document.querySelectorAll(".carouseldot")[index].style.background="var(--stgray-500)"
					}else if(indexcontroller=="line"){
						document.querySelectorAll(".carouselline").forEach(function(event){
							event.style.background="var(--stgray-200)"
						})
						document.querySelectorAll(".carouselline")[index].style.background="var(--stgray-500)"
					}else if(indexcontroller=="timeline"){

					}else if(indexcontroller=="image"){
						document.querySelectorAll(".carouselimage").forEach(function(event){
							event.style.background="none"
						})
						document.querySelectorAll(".carouselimage")[index].style.background="var(--stgray-200)"
					}

					count=0
				}

				if(leftrightcontroller){
					innerhtml=`
						${innerhtml}
						<input type="button" class="carousebutton carouseprev" id="carouseprev" value="<">
						<input type="button" class="carousebutton carousenext" id="carousenext" value=">">
					`
				}

				if(indexcontroller!="none"){
					let carouselfunction=``

					if(indexcontroller=="dot"){
						for(let i=0;i<totalindex;i=i+1){
							carouselfunction=`
								${carouselfunction}
								<div class="carouseldot" data-id="${i}"></div>
							`
						}
					}else if(indexcontroller=="line"){
						for(let i=0;i<totalindex;i=i+1){
							carouselfunction=`
								${carouselfunction}
								<div class="carouselline" data-id="${i}"></div>
							`
						}
					}else if(indexcontroller=="timeline"){

					}else if(indexcontroller=="image"){
						for(let i=0;i<totalindex;i=i+1){
							carouselfunction=`
								${carouselfunction}
								<div class="carouselimage" data-id="${i}">
									<img src="${document.querySelectorAll(carouselimageclass)[i].src}" alt="image" class="image">
								</div>
							`
						}
					}else{
						throw "function carousel error: indexcontroller parameter KEYTYPEIN error(must be none|timeline|dot|line|image),but wtf tell me how did you did this"
					}


					innerhtml=`
						${innerhtml}
						<div class="carouselfunction">
							${carouselfunction}
						</div>
					`
				}

				document.getElementById(id).innerHTML=`
					${document.getElementById(id).innerHTML}
					${innerhtml}
				`

				if(document.getElementById("carouseprev")){
					document.getElementById("carouseprev").onclick=function(){
						count=0
						if(index-1<0){
							index=totalindex-1
						}else{
							index=(index-1)%totalindex
						}
						change()
					}
				}

				if(document.getElementById("carousenext")){
					document.getElementById("carousenext").onclick=function(){
						count=0
						index=(index+1)%totalindex
						change()
					}
				}

				if(indexcontroller=="dot"){
					document.querySelectorAll(".carouseldot").forEach(function(event){
						event.onclick=function(){
							index=event.dataset.id
							change()
						}
					})
				}else if(indexcontroller=="line"){
					document.querySelectorAll(".carouselline").forEach(function(event){
						event.onclick=function(){
							index=event.dataset.id
							change()
						}
					})
				}else if(indexcontroller=="timeline"){

				}else if(indexcontroller=="image"){
					document.querySelectorAll(".carouselimage").forEach(function(event){
						event.onclick=function(){
							index=event.dataset.id
							change()
						}
					})
				}

				change()
				if(-1<carouseltime){
					setInterval(function(){
						count=count+1
						if(carouseltime/10<=count){
							change()
							index=(index+1)%totalindex
						} // 換圖片
					},10)
				}
			}else{
				throw "[KEYTYPEIN ERROR]function carousel error: indexcontroller parameter KEYTYPEIN error(must be none|timeline|dot|line|image)"
			}
		}else{
			throw "[KEYTYPEIN ERROR]function carousel error: leftrightcontroller is not boolean"
		}
	}else{
		throw "[DOMNOTFOUND ERROR]function carousel error: dom id not found"
	}
}

function dompush(element,dom="div",data=``,setting={}){
	document.querySelectorAll(element).forEach(function(event){
		let createelement=document.createElement(dom)
		let dataset=setting["dataset"]?setting["dataset"]:{}
		createelement.innerHTML=data
		if(setting["id"])
			createelement.id=setting["id"]
		if(setting["class"])
			createelement.classList=setting["class"]
		if(setting["style"])
			createelement.style=setting["style"]
		if(setting["src"])
			createelement.src=setting["src"]
		if(setting["alt"])
			createelement.alt=setting["alt"]
		if(setting["title"])
			createelement.title=setting["title"]
		for(let key in dataset){
			if(dataset.hasOwnProperty(key)){
				createelement.dataset[key]=dataset[key]
			}
		}
		createelement.disabled=setting["disabled"]??false
		createelement.max=setting["max"]??MAXINT
		createelement.min=setting["min"]??MININT
		createelement.multiple=setting["multiple"]??false
		createelement.readonly=setting["readonly"]??false
		createelement.step=setting["step"]??0
		event.appendChild(createelement)
	})
}

function innerhtmlreverse(dom){
	let element=Array.from(dom.children)
	dom.innerHTML=``
	element.reverse().forEach(function(element){
		dom.appendChild(element)}
	)
}

function chash(x,type="encode",encoding="utf-8"){
    function generaterandomstring(length){
        let chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        let result=""
        for(let i=0;i<length;i=i+1){
            let randomindex=Math.floor(Math.random()*chars.length)
            result=result+chars[randomindex]
        }
        return result
    }

    function shufflestring(str){
        let arr=str.split("")
        for(let i=arr.length-1;i>0;i--){
            let j=Math.floor(Math.random()*(i+1))
            let temp=arr[i]
            arr[i]=arr[j]
            arr[j]=temp
        }
        return arr.join("")
    }

    function xorbufs(buf1,buf2){
        let result=new Uint8Array(buf1.length)
        for (let i=0;i<buf1.length;i++){
            result[i]=buf1[i]^buf2[i % buf2.length]
        }
        return result
    }

	if(type=="encode"){
		let encoder=new TextEncoder()
		let t=encoder.encode(str(x))

		let k=encoder.encode(generaterandomstring(40))

		let shuffledt=xorbufs(t,k)
		let l=btoa(String.fromCharCode.apply(null,shuffledt))

		let a=shufflestring(`chash${encoding}`.padEnd(20,"a"))
		let y=generaterandomstring(10)
		let kencoded=btoa(String.fromCharCode.apply(null,k))

		let result=`${a}|${l}|${y}|${kencoded}`

		return result
	}else if(type=="decode"){
		try{
			let [a,l,y,k]=x.split("|")

			let decoder=new TextDecoder(encoding)
			let shuffledt=new Uint8Array(atob(l).split("").map(char => char.charCodeAt(0)))
			let kbuf=new Uint8Array(atob(k).split("").map(char => char.charCodeAt(0)))

			let t=xorbufs(shuffledt,kbuf)

			let originalstring=decoder.decode(t)

			return originalstring
		}catch(error){
			console.error("[CHECKCODE_ERROR]function chash error: check code error")
		}
	}else{
		console.error("[KEYTYPEIN_ERROR]function chash error: type must be \"encode\" or \"decode\"")
	}
}

function codebeautifier(code,language){
    // 定義不同語言的關鍵字
    let keyword={
        "javascript": ["function","return","if","else","for","while","var","let","let","document","console"],
        "js": ["function","return","if","else","for","while","var","let","let"],
        "python": ["def","return","if","elif","else","for","while","import","from","as"],
        "py": ["def","return","if","elif","else","for","while","import","from","as"],
        "html": ["html","head","body","div","span","p","a","img","script","style"]
        // 可以繼續添加其他語言
    }[language]||[]
    let line=""
	let numbercode=""

    // 使用一個helper函數來處理所有的語法高亮
    function highlight(text,classname){
        return `<span class="${classname}">${text}</span>`
    }

    // 首先轉義所有HTML特殊字符
    code=code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")

    // 使用正則表達式一次性處理所有語法元素
	if(["javascript","js","python","py"].includes(language)){
		code=code.replace(
			new RegExp(`\\b(${keyword.join("|")})\\b|(".*?"|'.*?')|(//.*$)|(?:function\\s+(\\w+)\\s*\\(|(?:const|let|var)\\s+(\\w+)\\s*=\\s*(?:function\\s*\\(|\\([^)]*\\)\\s*=>))`,"gm"),
			function(match,keyword,string,comment,functionname1,functionname2){
				if(keyword){ return highlight(keyword,"keyword") }
				if(string){ return highlight(string,"string") }
				if(comment){ return highlight(comment,"comment") }
				if (functionname1||functionname2){
					return match.replace(functionname1||functionname2,highlight(functionname1||functionname2,"function"))
				}
				return match
			}
		)
	}else{
		code=code.replace(
			new RegExp(`\\b(${keyword.join("|")})\\b|(".*?"|'.*?')|(//.*$)`,"gm"),
			function(match,keyword,string,comment){
				if(keyword){ return highlight(keyword,"keyword") }
				if(string){ return highlight(string,"string") }
				if(comment){ return highlight(comment,"comment") }
				return match
			}
		)
	}

    // 添加行號
    line=code.split('\n');
    numbercode=line.map(function(line,index){
        return `<span class="linenumber">${index+1}</span>${line}`
    }).join('\n')

    // 生成最終的 HTML 結構
    return `<pre class="codebeautifier ${language}"><code>${numbercode}</code></pre>`
}

// window onload START
windowload(function(event){
	// 刷新lightbox
	if(domgetid("lightbox")){
		domgetid("lightbox").style.display="none"
		domgetid("lightbox").classList.add("lightboxmask")
		setTimeout(function(){
			domgetid("lightbox").style.display="block"
		},100)
	}

	// 順滑移動#
	if(location.href.split("#").length>1){
		let id=location.href.split("#")[location.href.split("#").length-1]
		if(domgetid(id)){
			domgetid(id).scrollIntoView({ behavior: "smooth" })
		}
	}

	// 將被onchange的input|textarea清除error
	onchange("input",function(element,event){
		element.parentNode.classList.remove("error")
	})

	onchange("textarea",function(element,event){
		element.parentNode.classList.remove("error")
	})
})
// window onload END