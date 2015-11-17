var context, media, source;
var Q, bandSplit;
var hBand, hInvert, mBand, lBand, lInvert;
var lComp, mComp, hComp;
var wet, dry;
var linear, linearInv;
var compressor, range;
var dbToGain;
var lowMeter, midMeter, highMeter;
var showReduction;

window.addEventListener('load', init, false);
function init() {

context = new AudioContext();
media = document.getElementById('player');
media.crossOrigin = 'anonymous';
source = context.createMediaElementSource(media);


// EQ Properties
//
Q = 1.0;
bandSplit = [120, 2000];

// the high frequencies
hBand = context.createBiquadFilter();
hBand.type = "highpass";
hBand.frequency.value = bandSplit[1];
hBand.Q.value = Q;
hInvert = context.createGain();
hInvert.gain.value = -1.0;

// the medium frequencies
mBand = context.createGain();

// the low frequencies
lBand = context.createBiquadFilter();
lBand.type = "lowpass";
lBand.frequency.value = bandSplit[0];
lBand.Q.value = Q;
lInvert = context.createGain();
lInvert.gain.value = -1.0;

// feed the bands
source.connect(lBand);
source.connect(mBand);
source.connect(hBand);

// invert low/high
hBand.connect(hInvert);
lBand.connect(lInvert);

// add (subtract) them to get the medium frequencies
hInvert.connect(mBand);
lInvert.connect(mBand);

// three compressors
lComp = context.createDynamicsCompressor();
mComp = context.createDynamicsCompressor();
hComp = context.createDynamicsCompressor();

// connect them to the compressors
lBand.connect(lComp);
mBand.connect(mComp);
hBand.connect(hComp);

// wet signal is the sum of all compressors
wet = context.createGain();
wet.gain.value = 1.0;
lComp.connect(wet);
mComp.connect(wet);
hComp.connect(wet);

// preserve dry
dry = context.createGain();
dry.gain.value = 0.0;
source.connect(dry);

// route them all to the sound card
wet.connect(context.destination);
dry.connect(context.destination);

// Mapping
//
linear = function(min, max, value) {
  return min + value * (max - min);
}

linearInv = function(min, max, value) {
  return (value - min) / (max - min);
}



compressor = {
  threshold: [-100, 0],
  knee: [0, 40],
  ratio: [1, 20],
  attack: [0, 1],
  release: [0, 1]
}

for (var name in compressor) {
  range = compressor[name];
  document.getElementById("low-" + name).value = linearInv(range[0], range[1], lComp[name].value) * 100.0;
  document.getElementById("mid-" + name).value = linearInv(range[0], range[1], lComp[name].value) * 100.0;
  document.getElementById("high-" + name).value = linearInv(range[0], range[1], lComp[name].value) * 100.0;
}

dbToGain = function(db) {
  return Math.exp(db * Math.log(10.0) / 20.0);
}
lowMeter = document.getElementById("low-reduction");
midMeter = document.getElementById("mid-reduction");
highMeter = document.getElementById("high-reduction");
showReduction = (function() {
  lowMeter.value = dbToGain(lComp.reduction.value) * 100.0;
  midMeter.value = dbToGain(mComp.reduction.value) * 100.0;
  highMeter.value = dbToGain(hComp.reduction.value) * 100.0;
  window.requestAnimationFrame(arguments.callee);
})();

document.getElementById("lowBands").innerHTML = "Low Bands: " + bandSplit[0] + " Hz Cutoff";
document.getElementById("highBands").innerHTML = "High Bands: " + bandSplit[1] + " Hz Cutoff";
}

// Input
//
function changeBoolean(value, type) {
  switch (type) {
    case 'drywet':
      dry.gain.value = value ? 0.0 : 1.0;
      wet.gain.value = value ? 1.0 : 0.0;
      break;
  }
}

function changePercent(string, type) {
  var value = parseFloat(string) / 100.0;
  switch (type) {
    case 'low-threshold':
      lComp.threshold.value = linear(compressor.threshold[0], compressor.threshold[1], value);
      break;
    case 'low-knee':
      lComp.knee.value = linear(compressor.knee[0], compressor.knee[1], value);
      break;
    case 'low-ratio':
      lComp.ratio.value = linear(compressor.ratio[0], compressor.ratio[1], value);
      break;
    case 'low-attack':
      lComp.attack.value = linear(compressor.attack[0], compressor.attack[1], value);
      break;
    case 'low-release':
      lComp.release.value = linear(compressor.release[0], compressor.release[1], value);
      break;

    case 'mid-threshold':
      mComp.threshold.value = linear(compressor.threshold[0], compressor.threshold[1], value);
      break;
    case 'mid-knee':
      mComp.knee.value = linear(compressor.knee[0], compressor.knee[1], value);
      break;
    case 'mid-ratio':
      mComp.ratio.value = linear(compressor.ratio[0], compressor.ratio[1], value);
      break;
    case 'mid-attack':
      mComp.attack.value = linear(compressor.attack[0], compressor.attack[1], value);
      break;
    case 'mid-release':
      mComp.release.value = linear(compressor.release[0], compressor.release[1], value);
      break;

    case 'high-threshold':
      hComp.threshold.value = linear(compressor.threshold[0], compressor.threshold[1], value);
      break;
    case 'high-knee':
      hComp.knee.value = linear(compressor.knee[0], compressor.knee[1], value);
      break;
    case 'high-ratio':
      hComp.ratio.value = linear(compressor.ratio[0], compressor.ratio[1], value);
      break;
    case 'high-attack':
      hComp.attack.value = linear(compressor.attack[0], compressor.attack[1], value);
      break;
    case 'high-release':
      hComp.release.value = linear(compressor.release[0], compressor.release[1], value);
      break;
  }
}

function playFile(obj) {  
	var reader = new FileReader();
	reader.onload = (function(audio) {return function(e) {audio.src = e.target.result;};})(media);
	reader.addEventListener('load', function() {
    document.getElementById('player').play()
	});
	reader.readAsDataURL(obj.files[0]);
}  

document.getElementById("lthreshold").innerHTML = lComp.threshold.value + " dB";
document.getElementById("lknee").innerHTML = lComp.knee.value + " dB";
document.getElementById("lratio").innerHTML = lComp.ratio.value;
document.getElementById("lattack").innerHTML = lComp.attack.value + " sec";
document.getElementById("lrelease").innerHTML = lComp.release.value + " sec";
document.getElementById("mthreshold").innerHTML = mComp.threshold.value + " dB";
document.getElementById("mknee").innerHTML = mComp.knee.value + " dB";
document.getElementById("mratio").innerHTML = mComp.ratio.value;
document.getElementById("mattack").innerHTML = mComp.attack.value + " sec";
document.getElementById("mrelease").innerHTML = mComp.release.value + " sec";
document.getElementById("hthreshold").innerHTML = hComp.threshold.value + " dB";
document.getElementById("hknee").innerHTML = hComp.knee.value + " dB";
document.getElementById("hratio").innerHTML = hComp.ratio.value;
document.getElementById("hattack").innerHTML = hComp.attack.value + " sec";
document.getElementById("hrelease").innerHTML = hComp.release.value + " sec";