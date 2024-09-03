const WEBLSNAME="case00035-"
const AJAXURL="/case00035/"

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

startmacossection()