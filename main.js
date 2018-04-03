window.onload=function() {
	fc=gid('fc');
	dnd=gid('dnd');
	dnd.ondrop=filterimgs;
	dnd.ondragover=function(e) {
		e.preventDefault();
		dnd.classList.add('shining');
	};
	fc.onchange=function() {
		loadasimg(fc.files[0],addImage);
	};
};
function loadasimg(file,cb) {
	let i=newe('img');
	let fr=new FileReader();
	fr.onload=function() {
		i.src=fr.result;
	};
	i.onload=function() {
		i.onload=function() {};
		cb(i,file);
	};
	fr.readAsDataURL(file);
}
function addImage(img,fn) {
	let template=`
		<div class='sketch col-sm-9'></div>
		<div class='settings-pane col-sm-3'>
			<input type='button' value='save' name='save'/>
			<div class='blur'>
				<input type='range' min='0' max='10' value='5'/>
				<input type='text' value='5' name='blur' disabled='true'/>
			</div>
			<div class='contrast'>
				<input type='range' min='0' max='255' value='100'/>
				<input type='text' value='100' name='contrast' disabled='true'/>
			</div>
			<input type='button' value='change' name='change'/>
		</div>
	`;
	let ip=gid('images-panel');
	let c=newe('div');
	c.classList.add('row');
	c.innerHTML=template;
	let ci=new canimg(img);
	window.cont=c;
	let im=newe('img');
	im=ci.tosketch(Number(ci.w*0.05),100);
	c.querySelector('div.sketch').appendChild(im);
	c.querySelector('div input[type="button"]').onclick=ci.savesketch.bind(ci,fn.name);
	ip.appendChild(c);
	let r1=c.querySelector('div.blur input[type="range"]');
	console.log(r1.max,im,im.width);
	let r2=c.querySelector('div.contrast input[type="range"]');
	r1.onchange=function(e) {
		c.querySelector('div.blur input[name="blur"]').value=r1.value;
	};
	r2.onchange=function(e) {
		c.querySelector('div.contrast input[name="contrast"]').value=r2.value;
	};
	c.querySelector('input[name="change"]').onclick=function() {
		this.disabled=true;
		this.value='please wait';
		//console.log(this);
		//im.src=ci.sketch.changeblur.bind(ci.sketch,Number((ci.w*r1.value)/100),Number(r2.value)).call().src;
		setTimeout(function() {
			im.src=ci.sketch.changeblur.bind(ci.sketch,Number((ci.w*r1.value)/100),Number(r2.value)).call().src;
		},10);
		this.disabled=false;
		this.value='change';
	};
}
function filterimgs(ev) {
	dnd.classList.remove('shining');
	ev.preventDefault();
	if (ev.dataTransfer.items) {
		for (let i = 0; i < ev.dataTransfer.items.length; i++) {
			if (ev.dataTransfer.items[i].kind === 'file') {
				let file = ev.dataTransfer.items[i].getAsFile();
				fn=file.name;
				loadasimg(file,addImage);
			}
		}
	} else {
		for (var i = 0; i < ev.dataTransfer.files.length; i++) {
			//console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
			loadasimg(ev.dataTransfer.files[i],addImage);
			fn=ev.dataTransfer.files[i].name;
			console.log('in else');
		}
	}
	// Pass event to removeDragData for cleanup
	//removeDragData(ev);
	//console.log(ev.dataTransfer);
}