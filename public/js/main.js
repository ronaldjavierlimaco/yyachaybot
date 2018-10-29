
var tx = document.getElementsByTagName('textarea');
console.log('viendo tx: ', tx);
for (var i = 0; i < tx.length; i++) {
  tx[i].setAttribute('style', 'height:' + (tx[i].scrollHeight) + 'px;overflow-y:hidden;');
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
}

var room = 1;
function education_fields() {

  room++;
  var objTo = document.getElementById('education_fields')
  var divtest = document.createElement("div");
	divtest.setAttribute("class", "input-group mb-3 removeclass"+room);
	var rdiv = 'removeclass'+room;
    divtest.innerHTML = '<div class="col-sm-7"><div class="input-group mb-3"><textarea class="form-control" rows="2" name="preguntas[]"></textarea><div class="input-group-append"><button class="btn btn-danger" id="button-addon2" type="button" onclick="remove_education_fields('+ room +');"><span><i class="fas fa-times"></i></span></button></div></div></div><br /><div class="clear"></div>';
    
    objTo.appendChild(divtest)
}

function remove_education_fields(rid) {
  $('.removeclass'+rid).remove();
}

var room2 = 1;
function education_fields2() {
 
  room2++;
  var objTo2 = document.getElementById('education_fields2')
  var divtest2 = document.createElement("div");
	divtest2.setAttribute("class", "input-group mb-3 removeclass"+room2);
	var rdiv = 'removeclass'+room2;
    divtest2.innerHTML = '<div class="col-sm-7"><div class="input-group mb-3"><textarea class="form-control" rows="5" name="respuestas[]"></textarea><div class="input-group-append"><button class="btn btn-danger" id="button-addon2" type="button" onclick="remove_education_fields2('+ room2 +');"><span><i class="fas fa-times"></i></span></button></div></div></div><br /><div class="clear"></div>';
    
    objTo2.appendChild(divtest2)
}

function remove_education_fields2(rid) {
  $('.removeclass'+rid).remove();
}