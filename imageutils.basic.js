function newe(e) {
	return document.createElement(e);
}
function canimg(ctx) {
	if(ctx==='undefined') {
		let canvas=newe('canvas');
		this.can=canvas;
	} else if(ctx instanceof CanvasRenderingContext2D) {
		this.can=ctx.canvas;
	} else if(ctx instanceof HTMLCanvasElement) {
		this.can=ctx;
	} else if(!((ctx instanceof ImageData) || (ctx instanceof HTMLImageElement))) {
		console.error('Error in creating new canimg object');
		return;
	} else {
		this.can=newe('canvas');
	}
	this.ctx=this.can.getContext('2d');
	this.h=this.can.height;
	this.w=this.can.width;
	this.imgd=this.ctx.getImageData(0,0,this.w,this.h);
	if(ctx instanceof ImageData) {
		this.can.width=this.w=ctx.width;
		this.can.height=this.h=ctx.height;
		this.ctx=this.can.getContext('2d');
		this.imgd=this.ctx.createImageData(this.w,this.h);
		this.imgd.data.set(ctx.data);
	} else if(ctx instanceof HTMLImageElement) {
		this.can.width=this.w=ctx.width;
		this.can.height=this.h=ctx.height;
		this.ctx=this.can.getContext('2d');
		this.ctx.drawImage(ctx,0,0);
		this.imgd=this.ctx.getImageData(0,0,this.w,this.h);
	}
}
canimg.prototype.pixel=function(x,y,c) {
	let d=(x*this.h+y)*4;
	if(c!=undefined) {
		console.assert(c.length);
		c=c.length==4?c:[...c,255];
		this.imgd.data[d]=c[0];
		this.imgd.data[d+1]=c[1];
		this.imgd.data[d+2]=c[2];
		this.imgd.data[d+3]=c[3];
	}
	return [
		this.imgd.data[d],
		this.imgd.data[d+1],
		this.imgd.data[d+2],
		this.imgd.data[d+3]
	];
};
canimg.prototype.gen_copy=function(imgd) {
	return new canimg(this.imgd);
};
canimg.prototype.clone=function(imgd) {
	return new canimg(this.imgd);
};
canimg.prototype.processpixels=function(cb,keepSrc) {
	if(keepSrc!='undefined' && keepSrc) {
		var old_img=this.gen_copy(this.imgd);
		for(var i=0;i<this.w;i++)
			for(var j=0;j<this.h;j++) {
				old_img.pixel(i,j,cb(old_img.pixel(i,j),i,j));
			}
		old_img.draw();
		return old_img;
	} else {
		for(var i=0;i<this.w;i++)
			for(var j=0;j<this.h;j++) {
				this.pixel(i,j,cb(this.pixel(i,j),i,j));
			}
		this.draw();
		return this;
	}
};
canimg.prototype.toGray=function(keepSrc) {
	//console.log('togray');
	return this.processpixels(function(p) {
		let a=(p[0]+p[1]+p[2])/3;
		return [a,a,a,p[3]];
	},keepSrc);
};
canimg.prototype.invert=function(keepSrc) {
	//console.log('invert');
	return this.processpixels(function(p) {
		return [255-p[0],255-p[1],255-p[2],p[3]];
	},keepSrc);
};
canimg.prototype.guassianblur=function(r,keepSrc) {
	//console.log('blur');
	var rscl=[];
	var gscl=[];
	var bscl=[];
	var rtcl=[];
	var gtcl=[];
	var btcl=[];
	this.processpixels(function(p,i,j) {
		rscl.push(p[0]);
		gscl.push(p[1]);
		bscl.push(p[2]);
		rtcl.push(0);
		gtcl.push(0);
		btcl.push(0);
	});
	gaussBlur_4(rscl,rtcl,this.w,this.h,r);
	gaussBlur_4(gscl,gtcl,this.w,this.h,r);
	gaussBlur_4(bscl,btcl,this.w,this.h,r);
	const h=this.h,w=this.w;
	return this.processpixels(function(p,i,j) {
		return [rtcl[i*h+j],gtcl[i*h+j],btcl[i*h+j],255];
	},keepSrc);
	//this.draw();
};
canimg.prototype.contrast2=function(c,keepSrc) {
	var _c=(v1,c,b)=>(((259*(c+255))/(255*(259-c)))*(v1-128)+128);
	return this.processpixels(function(p) {
		return [_c(p[0],c),_c(p[1],c),_c(p[2],c),p[3]]
	},keepSrc);
};
canimg.prototype.contrast=function(c,keepSrc) {
	var _c=(v1,c,b)=>(((259*(c+255))/(255*(259-c)))*(v1-128)+128);
	var _c=(v1,c,b)=>Math.min(v1*(1+c/255),255);
	return this.processpixels(function(p) {
		return [_c(p[0],c),_c(p[1],c),_c(p[2],c),p[3]]
	},keepSrc);
};
canimg.prototype.whitenblack=function(keepSrc) {
	var _c=(v1)=>v1>128?255:0;
	return this.processpixels(function(p) {
		return [_c(p[0]),_c(p[1]),_c(p[2]),p[3]]
	},keepSrc);
};
canimg.prototype.drawgrids=function(x,y,save) {
	let wx=this.w/x,wy=this.h/y;
	this.ctx.lineWidth='10px';
	for(var i=0;i<x;i++) {
		this.ctx.moveTo(i*wx,0);
		this.ctx.lineTo(i*wx,this.h);
		this.ctx.stroke();
	}
	for(var i=0;i<y;i++) {
		this.ctx.moveTo(0,i*wy);
		this.ctx.lineTo(this.w,i*wy);
		this.ctx.stroke();
	}
	if(save!=undefined && save) this.update();
};
canimg.prototype.draw=function(img) {
	if(img===undefined) {
		this.ctx.putImageData(this.imgd,0,0);
	} else if(img instanceof HTMLImageElement) {
		this.ctx.drawImage(img,0,0);
	} else if(img instanceof ImageData) {
		this.ctx.putImageData(img);
	} else {
		console.error('error in argument passed to canimg.prototype.draw');
	}
	this.update(false);
};
canimg.prototype.update=function(ret) {
	if(ret!==undefined && !ret) {
		var old_img=this.clone();
		this.imgd=this.ctx.getImageData(0,0,this.w,this.h);
		return old_img;
	} else {
		this.imgd=this.ctx.getImageData(0,0,this.w,this.h);		
	}
};
canimg.prototype.saveimg=function(fn) {
	let a=document.createElement('a'),m=new MouseEvent('click');
	a.download=fn+'.png';
	a.href=this.toImage();
	a.dispatchEvent(m);
};
canimg.prototype._toImage__deprecated=function() {
	return this.can.toDataURL();
};
canimg.prototype.toImage=function() {
	var binary=atob(this.can.toDataURL().split(',')[1]),array=[];
	for(var i=0;i<binary.length;i++) array.push(binary.charCodeAt(i));
	return URL.createObjectURL(new Blob([new Uint8Array(array)],{type:'image/png'}));
};
canimg.prototype.snapshot=function() {
	//return this.toImage();
	let img=newe('img');
	img.src=this.toImage();
	return img;
};
canimg.prototype.tosketch=function(blur,contrast) {
	this.sketch=new sketch(this,blur,contrast);
	return this.sketch.finalsketch.snapshot();
};
canimg.prototype.savesketch=function(fn) {
	this.sketch.finalsketch.saveimg(fn);
};
canimg.blend_modes={
	// darken modes
	multiply:(v1,v2)=>v1*v2/255,
	colorburn:(v1,v2)=>((v1===0)?v1:Math.max(0,(255-((255-v2)<<8)/v1))),
	linearcolorburn:(v1,v2)=>Math.max(0,(v1+v2-255)),
	// lighten modes
	screen:(v1,v2)=>(v1+v2-v1*v2/255),
	colordodge:(v1,v2)=>((v1===255)?v1:Math.min(255,((v2<<8)/(255-v1)))),
	linearcolordodge:(v1,v2)=>Math.min(v1+v2,255),
	// cancellation modes
	subtract:(v1,v2)=>Math.max(v2-v1,0),
	divide:(v1,v2)=>Math.min(255,(v1<<8)/v2),
	// contrast
	overlay:(v1,v2)=>((v2<128)?(2*v1*v2/255):(255-2*(255-v1)*(255-v2)/255)),
	softlight:(v1,v2)=>((v1>127.5)?(v2+(255-v2)*((v1-127.5)/127.5)*(0.5-Math.abs(v2-127.5)/255)):(v2-v2*((127.5-v1)/127.5)*(0.5-Math.abs(v2-127.5)/255))),
	hardlight:(v1,v2)=>((v1>127.5)?(v2+(255-v2)*((v1-127.5)/127.5)):(v2*v1/127.5)),
	// other
};
canimg.prototype.blend=function(mode,layer,keepSrc) {
	var old_img=this.gen_copy(this.imgd);
	var cb=layer.imgd.data;
	var cs=this.imgd.data;
	var bc=new Array(cb.length);
	if(cb.length==cs.length) {
		for(var i=0;i<cb.length;i++)
			if(i%4!=0 || i==0) {
				bc[i]=canimg.blend_modes[mode](cs[i],cb[i]);
			}
		if(keepSrc===undefined || !keepSrc) {
			this.imgd.data.set(bc);
			this.draw();
			return this;
		} else {
			old_img.imgd.data.set(bc);
			old_img.draw();
			return old_img;
		}
	}
};
for(let mode in canimg.blend_modes) {
	canimg.prototype[mode]=function(layer,keepSrc) {
		return this.blend(mode,layer,keepSrc);
	};
}
function sketch(ci,blur,contrast) {
	if(blur===undefined) blur=50;
	if(contrast===undefined) contrast=100;
	this.original=ci;
	this.firstgray=ci.toGray(true);
	this.grayninv=this.firstgray.clone().invert();
	this.finalsketch=this.grayninv.clone().guassianblur(blur).colordodge(this.firstgray).toGray().contrast(contrast);
}
sketch.prototype.changeblur=function(blur,contrast) {
	this.finalsketch=this.grayninv.clone().guassianblur(blur).colordodge(this.firstgray).toGray().contrast(contrast);
	return this.finalsketch.snapshot();
};
function boxesForGauss(sigma,n) {
	// standard deviation, number of boxes
	var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width 
	var wl = Math.floor(wIdeal);  if(wl%2==0) wl--;
	var wu = wl+2;

	var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
	var m = Math.round(mIdeal);
	// var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );

	var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
	return sizes;
}
function gaussBlur_4 (scl, tcl, w, h, r) {
    var bxs = boxesForGauss(r, 3);
    boxBlur_4 (scl, tcl, w, h, (bxs[0]-1)/2);
    boxBlur_4 (tcl, scl, w, h, (bxs[1]-1)/2);
    boxBlur_4 (scl, tcl, w, h, (bxs[2]-1)/2);
}
function boxBlur_4 (scl, tcl, w, h, r) {
    for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
    boxBlurH_4(tcl, scl, w, h, r);
    boxBlurT_4(scl, tcl, w, h, r);
}
function boxBlurH_4 (scl, tcl, w, h, r) {
    var iarr = 1 / (r+r+1);
    for(var i=0; i<h; i++) {
        var ti = i*w, li = ti, ri = ti+r;
        var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
        for(var j=0; j<r; j++) val += scl[ti+j];
        for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
        for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
        for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
    }
}
function boxBlurT_4 (scl, tcl, w, h, r) {
    var iarr = 1 / (r+r+1);
    for(var i=0; i<w; i++) {
        var ti = i, li = ti, ri = ti+r*w;
        var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
        for(var j=0; j<r; j++) val += scl[ti+j*w];
        for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
        for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
        for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
    }
}
function isEmpty(imgd) {
	console.log(imgd);
	var i=0;
	for(i=0;i<imgd.imgd.data.length;i++) {
		if(imgd.imgd.data[i]!=255) break;
	}
	if(i==imgd.imgd.data.length) console.log('not white');
	else console.log('all white');
	for(i=0;i<imgd.imgd.data.length;i++) {
		if(imgd.imgd.data[i]!=0) break;
	}
	if(i==imgd.imgd.data.length) console.log('not black');
	else console.log('all black');
}