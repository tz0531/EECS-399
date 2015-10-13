function chooseFile() {
    document.getElementById("fileInput").click();
}

function playFile(obj) {
  var sound = document.getElementById('sound');
  var reader = new FileReader();
  reader.onload = (function(audio) {return function(e) {audio.src = e.target.result;};})(sound);
  reader.addEventListener('load', function() {
    document.getElementById("sound").play()
  });
  reader.readAsDataURL(obj.files[0]);
}