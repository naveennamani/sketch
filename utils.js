function gid(a) {
	return document.getElementById(a);
};
HTMLElement.prototype.h=function() {
	this.style.display="none";
};
HTMLElement.prototype.s=function(a) {
	this.style.display=a||"block";
};
function loadvar(a,b) {
	if(b==='undefined') b=a;
	a.forEach(function(c,d) {
		window[b[d]]=gid(c);
	});
}
function loadscript(s,r) {
	var n=document.createElement("script");
	n.type="text/javascript";
	n.src=(s+(r?("?v="+(Math.random()*1000)):""));
	document.getElementsByTagName("head")[0].appendChild(n);
}
function loadurl(u,cb) {
	var x=new XMLHttpRequest();
	x.onload=function(a) {
		if(this.readyState==4 && this.status==200) {
			cb(this.responseText);
		}
	};
	x.onerror=function() {
		cb("Error:"+this.responseText+":"+this.statusText);
	};
	x.open("GET",u,true);
	x.send();
	return x;
}
function storage(a,b,c) {
	if(c!=undefined) {
		if(b!=undefined)
			localStorage.set(a,c?JSON.parse(b):b);
		else {
			var r=localStorage.get(a);
			return c?JSON.parse(r):r;
		}
	}
}
//alert("utils loaded 12");