
// Events
// init() once the page has finished loading.
window.onload = init;

var timerWorker = null; // Worker thread to send us scheduling messages.
var context;
var convolver;
var compressor;
var masterGainNode;
var effectLevelNode;
var filterNode;
var counter=0;
var loopcounter=0;

// Each effect impulse response has a specific overall desired dry and wet volume.
// For example in the telephone filter, it's necessary to make the dry volume 0 to correctly hear the effect.
var effectDryMix = 1.0;
var effectWetMix = 1.0;

var timeoutId;

var startTime;
var lastDrawTime = -1;

var kits;

var kNumInstruments = 6;
var kInitialKitIndex = 10;
var kMaxSwing = .08;

var currentKit;

var currentArray=[];
var activeArr=[];
var masterLane;
var currentmasterNode;
var incrementingTime;
var quantizedTime;
//var currentNode;


var beatReset = {"kitIndex":0,"effectIndex":0,"tempo":360,"swingFactor":0,"effectMix":0.25,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5,"tom1PitchVal":0.5,"tom2PitchVal":0.5,"tom3PitchVal":0.5,"rhythm1":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm2":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm3":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm4":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm6":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
var beatDemo = [
    {"kitIndex":13,"effectIndex":18,"tempo":360,"swingFactor":0,"effectMix":0.19718309859154926,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5,"tom1PitchVal":0.5,"tom2PitchVal":0.5,"tom3PitchVal":0.5,"rhythm1":[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm2":[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],"rhythm3":[0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0],"rhythm4":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],"rhythm5":[0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm6":[0,0,0,0,0,0,0,2,0,2,2,0,0,0,0,0]},
    {"kitIndex":4,"effectIndex":12,"tempo":360,"swingFactor":0,"effectMix":0.2,"kickPitchVal":0.46478873239436624,"snarePitchVal":0.45070422535211263,"hihatPitchVal":0.15492957746478875,"tom1PitchVal":0.7183098591549295,"tom2PitchVal":0.704225352112676,"tom3PitchVal":0.8028169014084507,"rhythm1":[2,1,0,0,0,0,0,0,2,1,2,1,0,0,0,0],"rhythm2":[0,0,0,0,2,0,0,0,0,1,1,0,2,0,0,0],"rhythm3":[0,1,2,1,0,1,2,1,0,1,2,1,0,1,2,1],"rhythm4":[0,0,0,0,0,0,2,1,0,0,0,0,0,0,0,0],"rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],"rhythm6":[0,0,0,0,0,0,0,2,1,2,1,0,0,0,0,0]},
    {"kitIndex":2,"effectIndex":5,"tempo":360,"swingFactor":0,"effectMix":0.25,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5211267605633803,"tom1PitchVal":0.23943661971830987,"tom2PitchVal":0.21126760563380287,"tom3PitchVal":0.2535211267605634,"rhythm1":[2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],"rhythm2":[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],"rhythm3":[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],"rhythm4":[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],"rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],"rhythm6":[0,0,1,0,1,0,0,2,0,2,0,0,1,0,0,0]},
    {"kitIndex":1,"effectIndex":4,"tempo":360,"swingFactor":0,"effectMix":0.25,"kickPitchVal":0.7887323943661972,"snarePitchVal":0.49295774647887325,"hihatPitchVal":0.5,"tom1PitchVal":0.323943661971831,"tom2PitchVal":0.3943661971830986,"tom3PitchVal":0.323943661971831,"rhythm1":[2,0,0,0,0,0,0,2,2,0,0,0,0,0,0,1],"rhythm2":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm3":[0,0,1,0,2,0,1,0,1,0,1,0,2,0,2,0],"rhythm4":[2,0,2,0,0,0,0,0,2,0,0,0,0,2,0,0],"rhythm5":[0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm6":[0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0]},
    {"kitIndex":0,"effectIndex":1,"tempo":360,"swingFactor":0.5419847328244275,"effectMix":0.25,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5,"tom1PitchVal":0.5,"tom2PitchVal":0.5,"tom3PitchVal":0.5,"rhythm1":[2,2,0,1,2,2,0,1,2,2,0,1,2,2,0,1],"rhythm2":[0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],"rhythm3":[2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1],"rhythm4":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm5":[0,0,1,0,0,1,0,1,0,0,1,0,0,0,1,0],"rhythm6":[1,0,0,1,0,1,0,1,1,0,0,1,1,1,1,0]},
];



function cloneBeat(source) {
    var beat = new Object();
    
    beat.kitIndex = source.kitIndex;
    beat.effectIndex = source.effectIndex;
    beat.tempo = source.tempo;
    beat.swingFactor = source.swingFactor;
    beat.effectMix = source.effectMix;
    beat.kickPitchVal = source.kickPitchVal;
    beat.snarePitchVal = source.snarePitchVal;
    beat.hihatPitchVal = source.hihatPitchVal;
    beat.tom1PitchVal = source.tom1PitchVal;
    beat.tom2PitchVal = source.tom2PitchVal;
    beat.tom3PitchVal = source.tom3PitchVal;
    beat.rhythm1 = source.rhythm1.slice(0);        // slice(0) is an easy way to copy the full array
    beat.rhythm2 = source.rhythm2.slice(0);
    beat.rhythm3 = source.rhythm3.slice(0);
    beat.rhythm4 = source.rhythm4.slice(0);
    beat.rhythm5 = source.rhythm5.slice(0);
    beat.rhythm6 = source.rhythm6.slice(0);
    
    return beat;
}

// theBeat is the object representing the current beat/groove
// ... it is saved/loaded via JSON
var theBeat = cloneBeat(beatReset);

kickPitch = snarePitch = hihatPitch = tom1Pitch = tom2Pitch = tom3Pitch = 0;

var mouseCapture = null;
var mouseCaptureOffset = 0;

var loopLength = 16;
var rhythmIndex = 0;
var kMinTempo = 53;
var kMaxTempo = 360;
var noteTime = 0.0;
var loopnoteTime = 0.0;

var instruments = ['Kick', 'Snare', 'HiHat', 'Tom1', 'Tom2', 'Tom3'];

var volumes = [0, 0.3, 1];

var kitCount = 0;

var realLoopbegtime;
var realLoopendtime;
var loopMSlength;
var Allarr=[];
var quantizedLoopbegtime;
var quantizedLoopendtime

class NoteNode {
	constructor(drum,spaceafter,dv=2){
		this.drumname=drum;
		//console.log('drumname named:'+this.drumname);
		this.spaceafter=spaceafter;
		this._prev=0;
		this._next=0;
		this._end=false;
		this._quantizedTime=2;
		this._incrementingTime=0;
		this._drumvolume=dv;
		this._beginning=false;
		this._activeslice=[];
	}
	
	get dn() {
		return this.drumname;
	}
	
	get prev() {
		return this._prev;
	}

	set prev(newprev) {
		this._prev = newprev;   // validation could be checked here such as only allowing non numerical values
	}
	
	get next() {
		return this._next;
	}

	set next(newnext) {
		this._next = newnext;   // validation could be checked here such as only allowing non numerical values
	}
	
	get beginning() {
		return this._beginning;
	}

	set beginning(torf) {
		this._beginning = torf;   // validation could be checked here such as only allowing non numerical values
	}
	
	
	
	get end() {
		return this._end;
	}

	set end(truefalse) {
		this._end = truefalse;   // validation could be checked here such as only allowing non numerical values
	}
	
	get incrementingTime() {
		return this._incrementingTime;
	}

	set incrementingTime(truefalse) {
		this._incrementingTime = truefalse;   // validation could be checked here such as only allowing non numerical values
	}

	get quantizedTime() {
		return this._quantizedTime;
	}

	set quantizedTime(truefalse) {
		this._quantizedTime = truefalse;   // validation could be checked here such as only allowing non numerical values
	}	
	
	get drum() {
		//console.log('this.drumname:'+this.drumname);
		switch(this.drumname){
			case 'k':
				return currentKit.kickBuffer;
			case 's':
				return currentKit.snareBuffer;
			case 'hh':
				return currentKit.hihatBuffer;
			case 't1':
				return currentKit.tom1;
			case 't2':
				return currentKit.tom2;
			case 't3':
				return currentKit.tom3;	
			case 'na':
				return undefined;
		
		}

	}	
	
	get drumvolume() {
		return this._drumvolume;

	}	
	
	get drumtext() {
		return this.drumname;

	}		
	set drumvolume(lvl) {
		this._drumvolume=lvl;

	}	
	
	get lane() {
		return this._lane;

	}	
	
	set lane(val) {
		this._lane=val;

	}	
	
	get chair() {
		return this._chair;

	}	
	
	set chair(val) {
		this._chair=val;

	}	
	
		get activeslice() {
		return this._activeslice;
	}

	set activeslice(lanechairarray) {
		this._activeslice = lanechairarray;   // validation could be checked here such as only allowing non numerical values
	}
	
	get drumpitch() {
		//console.log('this.drumname:'+this.drumname);
		switch(this.drumname){
			case 'k':
				return kickPitch;
			case 's':
				return snarePitch;
			case 'hh':
				return hihatPitch;
			case 't1':
				return tom1Pitch;
			case 't2':
				return tom2Pitch;
			case 't3':
				return tom3Pitch;				
		
		}

	}	
	
	
	get noteMSlength() {
		var secondsPerBeat = Math.round((60.0 / theBeat.tempo)*100)/100;
		var nmsl=Math.round(this.spaceafter*secondsPerBeat*100)/100;
		//console.log('noteMSlength:'+nmsl.toString());
		return nmsl;
	}
	
	
	get play(){
		if (this.drumname!='na'){
		playNote(this.drum, false, 0,0,-2,1,this._drumvolume*1.0,this.drumpitch,this.quantizedTime+1);
		}
	}
	
	isactive(lane,chair){
		//console.log('in masternode, activeslice:'+JSON.stringify(this._activeslice[lane][chair]))
		if (this._activeslice[lane][chair]=='a')
			return true;
		else
			return false;
	}


	get oldisactive(){
		var active=false;
		//console.log('this.incrementingTime:'+this.incrementingTime.toString()+', this.quantizedTime:'+this.quantizedTime+', quantizedLoopendtime:'+quantizedLoopendtime);
		var contextLooptime=Math.round(((Math.round(this.quantizedTime*100/100))%(Math.round(quantizedLoopendtime*100)/100))*100)/100;
		//console.log(contextLooptime.toString()+' '+this.drumname);
		var secondsPerBeat = Math.round((60.0 / theBeat.tempo)*100)/100;
		var g=this.drumname;
		var h=this.quantizedTime
		Allarr[1][this._lane][this._chair].forEach( function (begend, index) {
			console.log(g+' quantizedTime:'+h.toString()+' quantizedLoopendtime:'+quantizedLoopendtime.toString()+'  in isactive, contextLooptime is:'+contextLooptime.toString()+', begend[0] is:'+(Math.round((begend[0]*secondsPerBeat)*100)/100).toString()+', begend[1] is:'+(Math.round((begend[1]*secondsPerBeat)*100)/100).toString());
			if (contextLooptime>=Math.round((begend[0]*secondsPerBeat)*100)/100 && contextLooptime < Math.round((begend[1]*secondsPerBeat)*100)/100){
				console.log(g);
				active=true;
			}
		});
	//active=true;
	return active;
	

	}
		
}


function laneCreator(bt,vol=2)
{//the argument "names" would be a two-dimensional array
    var lane = [];
for(var tick=0; tick<bt[0].length; tick++)
{
	lane.push(new NoteNode(bt[0][tick], bt[1][tick],vol));

	if (tick>0)
		{
			lane[tick].prev=lane[tick-1];
			lane[tick-1].next=lane[tick];
			if (tick==bt[0].length-1)
			{
				lane[tick].next=lane[0];
				lane[0].prev=lane[tick];				
			}

		}
	else
		lane[tick].beginning=true;
		
}

    return lane;
}


function masterlaneCreator(bt)
{//the argument "names" would be a two-dimensional array
    var lane = [];
for(var tick=0; tick<bt[0].length; tick++)
{
	

	if (tick>0)
		{

			if (tick==bt[0].length-1)
			{
				lane[tick-1].next=lane[0];	
			}
			else
			{
				lane.push(new NoteNode('na', (bt[0][tick+1]-bt[0][tick])));
				console.log('tick:'+tick.toString()+',lane[tick].activeslice:'+lane[tick].activeslice.toString()+', activeArr[1][tick]:'+JSON.stringify(activeArr[1][tick]));
				lane[tick].activeslice=activeArr[1][tick];
				lane[tick].prev=lane[tick-1];
				lane[tick-1].next=lane[tick];
				lane[tick].next=lane[0];
				lane[0].prev=lane[tick];				
			}

		}
	else
	{
		lane.push(new NoteNode('na', (bt[0][tick+1]-bt[0][tick])));
		console.log('tick:'+tick.toString()+',lane[tick].activeslice:'+lane[tick].activeslice.toString()+', activeArr[1][tick]:'+JSON.stringify(activeArr[1][tick]));
		lane[tick].activeslice=activeArr[1][tick];
		lane[tick].beginning=true;
	}
}

    return lane;
}






function loopMSlengthof(arr){
	   var max=0;
	   arr[1].forEach( function (lane,ind){
		   lane.forEach( function (chair,ind){
			chair.forEach( function (slot,ind){
				if(slot[1]>max){
					max=slot[1];
				}
					
			})
		   })
		   
	   })
	   var secondsPerBeat = Math.round((60.0 / theBeat.tempo)*100)/100;
	   return max*secondsPerBeat;
	}


//these functions are SUSPECT
//function contextconverted (possiblevalfromactivearray) {
	//ok so how do we get the right context. the right context will be the number times bpm + timeatbeginningofmasterloop... so need to come up with that... by resetting it every time masterloop gets back to beginning of loop
	//so lets always make master loop the first node in the currentNodeArray
    //if (typeof possiblevalfromactivearray == 'undefined')
        //alert ('out of bounds baby');
//}
//
//
//function timeofNode(nd) {
	//var secondsPerBeat = 60.0 / theBeat.tempo;
	//nd.spaceafter*secondsPerBeat;
//}	
//
//function timeofLane(ln){
	//var initialValue=0;
	//var ttime=ln.reduce(function(accumulator,currentValue) {
		//return accumulator+currentValue.lengthIntime;
	//},initialValue)
  //return ttime;
//}
//
//these functions were SUSPECT




var kitName = [
    "R8",
    "CR78",
    "KPR77",
    "LINN",
    "Kit3",
    "Kit8",
    "Techno",
    "Stark",
    "breakbeat8",
    "breakbeat9",
    "breakbeat13",
    "acoustic-kit",
    "4OP-FM",
    "TheCheebacabra1",
    "TheCheebacabra2"
    ];

var kitNamePretty = [
    "Roland R-8",
    "Roland CR-78",
    "Korg KPR-77",
    "LinnDrum",
    "Kit 3",
    "Kit 8",
    "Techno",
    "Stark",
    "Breakbeat 8",
    "Breakbeat 9",
    "Breakbeat 13",
    "Acoustic Kit",
    "4OP-FM",
    "The Cheebacabra 1",
    "The Cheebacabra 2"
    ];

function Kit(name) {
    this.name = name;

    this.pathName = function() {
        var pathName = "sounds/drum-samples/" + this.name + "/";
        return pathName;
    };

    this.kickBuffer = 0;
    this.snareBuffer = 0;
    this.hihatBuffer = 0;

    this.instrumentCount = kNumInstruments;
    this.instrumentLoadCount = 0;
    
    this.startedLoading = false;
    this.isLoaded = false;
    
    this.demoIndex = -1;
}

Kit.prototype.setDemoIndex = function(index) {
    this.demoIndex = index;
}

Kit.prototype.load = function() {
    if (this.startedLoading)
        return;
        
    this.startedLoading = true;
        
    var pathName = this.pathName();

    var kickPath = pathName + "kick.wav";
    var snarePath = pathName + "snare.wav";
    var hihatPath = pathName + "hihat.wav";
    var tom1Path = pathName + "tom1.wav";
    var tom2Path = pathName + "tom2.wav";
    var tom3Path = pathName + "tom3.wav";

    this.loadSample(0, kickPath, false);
    this.loadSample(1, snarePath, false);
    this.loadSample(2, hihatPath, true);  // we're panning only the hihat
    this.loadSample(3, tom1Path, false);
    this.loadSample(4, tom2Path, false);
    this.loadSample(5, tom3Path, false);
}

var decodedFunctions = [
function (buffer) { this.kickBuffer = buffer; },
function (buffer) { this.snareBuffer = buffer; },
function (buffer) { this.hihatBuffer = buffer; },
function (buffer) { this.tom1 = buffer; },
function (buffer) { this.tom2 = buffer; },
function (buffer) { this.tom3 = buffer; } ];

Kit.prototype.loadSample = function(sampleID, url, mixToMono) {
    // Load asynchronously

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var kit = this;

    request.onload = function() {
        context.decodeAudioData(request.response, decodedFunctions[sampleID].bind(kit));

        kit.instrumentLoadCount++;
        if (kit.instrumentLoadCount == kit.instrumentCount) {
            kit.isLoaded = true;

            if (kit.demoIndex != -1) {
                beatDemo[kit.demoIndex].setKitLoaded();
            }
        }
    }

    request.send();
}

var impulseResponseInfoList = [
    // Impulse responses - each one represents a unique linear effect.
    {"name":"No Effect", "url":"undefined", "dryMix":1, "wetMix":0},
    {"name":"Spreader 2", "url":"impulse-responses/noise-spreader1.wav",        "dryMix":1, "wetMix":1},
    {"name":"Spring Reverb", "url":"impulse-responses/feedback-spring.wav",     "dryMix":1, "wetMix":1},
    {"name":"Space Oddity", "url":"impulse-responses/filter-rhythm3.wav",       "dryMix":1, "wetMix":0.7},
    {"name":"Huge Reverse", "url":"impulse-responses/matrix6-backwards.wav",    "dryMix":0, "wetMix":0.7},
    {"name":"Telephone Filter", "url":"impulse-responses/filter-telephone.wav", "dryMix":0, "wetMix":1.2},
    {"name":"Lopass Filter", "url":"impulse-responses/filter-lopass160.wav",    "dryMix":0, "wetMix":0.5},
    {"name":"Hipass Filter", "url":"impulse-responses/filter-hipass5000.wav",   "dryMix":0, "wetMix":4.0},
    {"name":"Comb 1", "url":"impulse-responses/comb-saw1.wav",                  "dryMix":0, "wetMix":0.7},
    {"name":"Comb 2", "url":"impulse-responses/comb-saw2.wav",                  "dryMix":0, "wetMix":1.0},
    {"name":"Cosmic Ping", "url":"impulse-responses/cosmic-ping-long.wav",      "dryMix":0, "wetMix":0.9},
    {"name":"Kitchen", "url":"impulse-responses/house-impulses/kitchen-true-stereo.wav", "dryMix":1, "wetMix":1},
    {"name":"Living Room", "url":"impulse-responses/house-impulses/dining-living-true-stereo.wav", "dryMix":1, "wetMix":1},
    {"name":"Living-Bedroom", "url":"impulse-responses/house-impulses/living-bedroom-leveled.wav", "dryMix":1, "wetMix":1},
    {"name":"Dining-Far-Kitchen", "url":"impulse-responses/house-impulses/dining-far-kitchen.wav", "dryMix":1, "wetMix":1},
    {"name":"Medium Hall 1", "url":"impulse-responses/matrix-reverb2.wav",      "dryMix":1, "wetMix":1},
    {"name":"Medium Hall 2", "url":"impulse-responses/matrix-reverb3.wav",      "dryMix":1, "wetMix":1},
    {"name":"Peculiar", "url":"impulse-responses/peculiar-backwards.wav",       "dryMix":1, "wetMix":1},
    {"name":"Backslap", "url":"impulse-responses/backslap1.wav",                "dryMix":1, "wetMix":1},
    {"name":"Diffusor", "url":"impulse-responses/diffusor3.wav",                "dryMix":1, "wetMix":1},
    {"name":"Huge", "url":"impulse-responses/matrix-reverb6.wav",               "dryMix":1, "wetMix":0.7},
]

var impulseResponseList = 0;

function ImpulseResponse(url, index) {
    this.url = url;
    this.index = index;
    this.startedLoading = false;
    this.isLoaded_ = false;
    this.buffer = 0;
    
    this.demoIndex = -1; // no demo
}

ImpulseResponse.prototype.setDemoIndex = function(index) {
    this.demoIndex = index;
}

ImpulseResponse.prototype.isLoaded = function() {
    return this.isLoaded_;
}

function loadedImpulseResponse(buffer) {
    this.buffer = buffer;
    this.isLoaded_ = true;
    
    if (this.demoIndex != -1) {
        beatDemo[this.demoIndex].setEffectLoaded();
    }
}

ImpulseResponse.prototype.load = function() {
    if (this.startedLoading) {
        return;
    }
    
    this.startedLoading = true;

    // Load asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", this.url, true);
    request.responseType = "arraybuffer";
    this.request = request;
    
    var asset = this;

    request.onload = function() {
        context.decodeAudioData(request.response, loadedImpulseResponse.bind(asset) );
    }

    request.send();
}

function startLoadingAssets() {
    impulseResponseList = new Array();

    for (i = 0; i < impulseResponseInfoList.length; i++) {
        impulseResponseList[i] = new ImpulseResponse(impulseResponseInfoList[i].url, i);
    }
    
    // Initialize drum kits
    var numKits = kitName.length;
    kits = new Array(numKits);
    for (var i  = 0; i < numKits; i++) {
        kits[i] = new Kit(kitName[i]);
    }  
    
    // Start loading the assets used by the presets first, in order of the presets.
    for (var demoIndex = 0; demoIndex < 5; ++demoIndex) {
        var effect = impulseResponseList[beatDemo[demoIndex].effectIndex];
        var kit = kits[beatDemo[demoIndex].kitIndex];
        
        // These effects and kits will keep track of a particular demo, so we can change
        // the loading status in the UI.
        effect.setDemoIndex(demoIndex);
        kit.setDemoIndex(demoIndex);
        
        effect.load();
        kit.load();
    }
    
    // Then load the remaining assets.
    // Note that any assets which have previously started loading will be skipped over.
    for (var i  = 0; i < numKits; i++) {
        kits[i].load();
    }  

    // Start at 1 to skip "No Effect"
    for (i = 1; i < impulseResponseInfoList.length; i++) {
        impulseResponseList[i].load();
    }
    
    // Setup initial drumkit
    currentKit = kits[kInitialKitIndex];
}

function demoButtonURL(demoIndex) {
    var n = demoIndex + 1;
    var demoName = "demo" + n;
    var url = "images/btn_" + demoName + ".png";
    return url;
}

// This gets rid of the loading spinner in each of the demo buttons.
function showDemoAvailable(demoIndex /* zero-based */) {
    var url = demoButtonURL(demoIndex);
    var n = demoIndex + 1;
    var demoName = "demo" + n;
    var demo = document.getElementById(demoName);
    demo.src = url;
    
    // Enable play button and assign it to demo 2.
    if (demoIndex == 1) {
        showPlayAvailable();
        loadBeat(beatDemo[1]);

    // Uncomment to allow autoplay
    //     handlePlay();
    }
}

// This gets rid of the loading spinner on the play button.
function showPlayAvailable() {
    var play = document.getElementById("play");
    play.src = "images/btn_play.png";
}

function init() {
    // Let the beat demos know when all of their assets have been loaded.
    // Add some new methods to support this.
    for (var i = 0; i < beatDemo.length; ++i) {
        beatDemo[i].index = i;
        beatDemo[i].isKitLoaded = false;
        beatDemo[i].isEffectLoaded = false;

        beatDemo[i].setKitLoaded = function() {
            this.isKitLoaded = true;
            this.checkIsLoaded();
        };

        beatDemo[i].setEffectLoaded = function() {
            this.isEffectLoaded = true;
            this.checkIsLoaded();
        };

        beatDemo[i].checkIsLoaded = function() {
            if (this.isLoaded()) {
                showDemoAvailable(this.index); 
            }
        };

        beatDemo[i].isLoaded = function() {
            return this.isKitLoaded && this.isEffectLoaded;
        };
    }
        
    startLoadingAssets();

    // NOTE: THIS NOW RELIES ON THE MONKEYPATCH LIBRARY TO LOAD
    // IN CHROME AND SAFARI (until they release unprefixed)
    context = new AudioContext();
	//console.log(' -- original currentTime:'+context.currentTime.toString());
    var finalMixNode;
    if (context.createDynamicsCompressor) {
        // Create a dynamics compressor to sweeten the overall mix.
        compressor = context.createDynamicsCompressor();
        compressor.connect(context.destination);
        finalMixNode = compressor;
    } else {
        // No compressor available in this implementation.
        finalMixNode = context.destination;
    }

    // create master filter node
    filterNode = context.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.value = 0.5 * context.sampleRate;
    filterNode.Q.value = 1;
    filterNode.connect(finalMixNode);
    
    // Create master volume.
    masterGainNode = context.createGain();
    masterGainNode.gain.value = 0.7; // reduce overall volume to avoid clipping
    masterGainNode.connect(filterNode);

    // Create effect volume.
    effectLevelNode = context.createGain();
    effectLevelNode.gain.value = 1.0; // effect level slider controls this
    effectLevelNode.connect(masterGainNode);

    // Create convolver for effect
    convolver = context.createConvolver();
    convolver.connect(effectLevelNode);


    var elKitCombo = document.getElementById('kitcombo');
    elKitCombo.addEventListener("mousedown", handleKitComboMouseDown, true);

    var elEffectCombo = document.getElementById('effectcombo');
    elEffectCombo.addEventListener("mousedown", handleEffectComboMouseDown, true);

    document.body.addEventListener("mousedown", handleBodyMouseDown, true);

    initControls();
    updateControls();

    var timerWorkerBlob = new Blob([
        "var timeoutID=0;console.log('    ------worker initialized');function schedule(){timeoutID=setTimeout(function(){postMessage('schedule'); schedule();},10);} onmessage = function(e) { console.log('----------onmessage in timer'); if (e.data == 'start') { if (!timeoutID) schedule();} else if (e.data == 'stop') {if (timeoutID) clearTimeout(timeoutID); timeoutID=0;};}"]);

    // Obtain a blob URL reference to our worker 'file'.
    var timerWorkerBlobURL = window.URL.createObjectURL(timerWorkerBlob);

    timerWorker = new Worker(timerWorkerBlobURL);
    timerWorker.onmessage = function(e) {
      schedule();
    };
    timerWorker.postMessage('init'); // Start the worker.

}

function initControls() {
    // Initialize note buttons
    initButtons();
    makeKitList();
    makeEffectList();

    // sliders
    document.getElementById('effect_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('tom1_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('tom2_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('tom3_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('hihat_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('snare_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('kick_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('swing_thumb').addEventListener('mousedown', handleSliderMouseDown, true);

    document.getElementById('effect_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('tom1_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('tom2_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('tom3_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('hihat_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('snare_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('kick_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('swing_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);

    // tool buttons
    document.getElementById('play').addEventListener('mousedown', handlePlay, true);
    document.getElementById('stop').addEventListener('mousedown', handleStop, true);
    document.getElementById('save').addEventListener('mousedown', handleSave, true);
    document.getElementById('save_ok').addEventListener('mousedown', handleSaveOk, true);
    document.getElementById('load').addEventListener('mousedown', handleLoad, true);
    document.getElementById('load_ok').addEventListener('mousedown', handleLoadOk, true);
    document.getElementById('load_cancel').addEventListener('mousedown', handleLoadCancel, true);
    document.getElementById('reset').addEventListener('mousedown', handleReset, true);
    document.getElementById('demo1').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo2').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo3').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo4').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo5').addEventListener('mousedown', handleDemoMouseDown, true);

    var elBody = document.getElementById('body');
    elBody.addEventListener('mousemove', handleMouseMove, true);
    elBody.addEventListener('mouseup', handleMouseUp, true);

    document.getElementById('tempoinc').addEventListener('mousedown', tempoIncrease, true);
    document.getElementById('tempodec').addEventListener('mousedown', tempoDecrease, true);
}

function initButtons() {        
    var elButton;

    for (i = 0; i < loopLength; ++i) {
        for (j = 0; j < kNumInstruments; j++) {
                elButton = document.getElementById(instruments[j] + '_' + i);
                elButton.addEventListener("mousedown", handleButtonMouseDown, true);
        }
    }
}

function makeEffectList() {
    var elList = document.getElementById('effectlist');
    var numEffects = impulseResponseInfoList.length;

    
    var elItem = document.createElement('li');
    elItem.innerHTML = 'None';
    elItem.addEventListener("mousedown", handleEffectMouseDown, true);
    
    for (var i = 0; i < numEffects; i++) {
        var elItem = document.createElement('li');
        elItem.innerHTML = impulseResponseInfoList[i].name;
        elList.appendChild(elItem);
        elItem.addEventListener("mousedown", handleEffectMouseDown, true);
    }
}

function makeKitList() {
    var elList = document.getElementById('kitlist');
    var numKits = kitName.length;
    
    for (var i = 0; i < numKits; i++) {
        var elItem = document.createElement('li');
        elItem.innerHTML = kitNamePretty[i];
        elList.appendChild(elItem);
        elItem.addEventListener("mousedown", handleKitMouseDown, true);
    }
}

function realadvanceNote() {
    // Advance time by a 16th note... noteTime increases
    var secondsPerBeat = 60.0 / theBeat.tempo;
	console.log ('   -  inside advanceNote');
    rhythmIndex++;
    if (rhythmIndex == loopLength) {
        rhythmIndex = 0;
    }

        // apply swing    
    if (rhythmIndex % 2) {
        noteTime += (0.25 + kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    } else {
        noteTime += (0.25 - kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    }
}

function advanceNote() {
    // Advance time by a 16th note... noteTime increases
    var secondsPerBeat = 60.0 / theBeat.tempo;
	console.log ('   -  inside advanceNote');
	////for each in currentArray, if one is attheBeginning, reset loopindex to zero
    noteTime += secondsPerBeat;
}


function playNote(buffer, pan, x, y, z, sendGain, mainGain, playbackRate, noteTime) {
	// calls voice.start(noteTime)  noteTime is start time of note
    // Create the note
    var voice = context.createBufferSource();
    voice.buffer = buffer;
    voice.playbackRate.value = playbackRate;

    // Optionally, connect to a panner
    var finalNode;
    if (pan) {
        var panner = context.createPanner();
        panner.panningModel = "HRTF";
        panner.setPosition(x, y, z);
        voice.connect(panner);
        finalNode = panner;
    } else {
        finalNode = voice;
    }

    // Connect to dry mix
    var dryGainNode = context.createGain();
    dryGainNode.gain.value = mainGain * effectDryMix;
    finalNode.connect(dryGainNode);
    dryGainNode.connect(masterGainNode);

    // Connect to wet mix
    var wetGainNode = context.createGain();
    wetGainNode.gain.value = sendGain;
    finalNode.connect(wetGainNode);
    wetGainNode.connect(convolver);

    voice.start(noteTime);
}



function schedule() {
	//counter+=direction;
	//if (counter % 50 === 0){
	//	direction=direction*-1;
	//}
	

	var currentTime = context.currentTime;	
	    currentTime -= startTime;
	//console.log(' -- currentTime:'+currentTime.toString()+'  --incrementingTime:'+incrementingTime.toString());
	//console.log (' the real loop end time its not finding:'+realLoopendtime.toString());
	//console.log(' quantizedLoopendtime:'+quantizedLoopendtime+', quantizedTime:'+quantizedTime.toString());
	//if (quantizedLoopendtime<quantizedTime)
	//console.log('loopMSlength is:'+loopMSlength.toString());
	//{realLoopbegtime+=loopMSlength;
	// realLoopendtime+=loopMSlength;
	// quantizedLoopbegtime+=loopMSlength;
	// quantizedLoopendtime+=loopMSlength;
	//}
	var newCurrentArray=[];
	//console.log('there are '+currentArray.length.toString()+' values in currentArray');
	//.. each node can reference how far it is from beginning of master loop. master loop is just a number times beat (8, 16, etc)
	//, so if you're after the end of the loop, the loop time resets.
	// then each node just checks if it's between 
	counter+=1;
	//console.log('currentmasterNode.incrementingTime vs currentTime:'+currentmasterNode.incrementingTime.toString()+' '+currentTime.toString()+'   '+JSON.stringify(currentmasterNode.activeslice))
	if (currentTime>=currentmasterNode.incrementingTime && currentTime>0){
		currentmasterNode.next.incrementingTime=currentmasterNode.incrementingTime+currentmasterNode.noteMSlength;
		currentmasterNode.next.quantizedTime=currentmasterNode.quantizedTime+currentmasterNode.noteMSlength;
		currentmasterNode=currentmasterNode.next;
	}
	
	
	for (let currentNode of currentArray){
		
		//console.log('in currentArray, currentNode:'+currentNode.lane.toString()+', chair:'+currentNode.chair.toString());
		if (currentTime>currentNode.incrementingTime){
				//console.log('current node incrementing at '+currentNode.incrementingTime.toString()+', playing '+currentNode.dn+' at '+currentNode.quantizedTime.toString());
					//console.log('current node drum volume:'+currentNode.drumvolume.toString());
							//console.log(counter.toString());
							//console.log('currentTime:'+currentTime.toString()+' incrementingTime:'+currentNode.incrementingTime.toString());

					
					//if currentNode.quantizedTime > contextconverted(AllArr[currentNode.lane][currentNode.chair][0]) && currentNode.quantizedTime < contextconverted(AllArr[currentNode.lane][currentNode.chair][1])
					//currentNode.play;
					//console.log('counter:'+counter.toString()+', lane '+currentNode.lane.toString()+', chair '+currentNode.chair.toString())
					if (currentmasterNode.isactive(currentNode.lane,currentNode.chair)){
						//console.log('                 counter:'+counter.toString()+', lane '+currentNode.lane.toString()+', chair '+currentNode.chair.toString()+' is active')
					    //playNote(currentNode.drum, false, 0,0,-2, 1, currentNode.drumvolume * 1.0, currentNode.drumpitch, currentNode.quantizedTime);
						//console.log('playing');
						currentNode.play;
					}
					//else
					//{ console.log('counter:'+counter.toString()+', lane '+currentNode.lane.toString()+', chair '+currentNode.chair.toString()+' is not active')}
					incrementingTime+=currentNode.noteMSlength;
					quantizedTime+=currentNode.noteMSlength;
				if (currentNode.next){
					currentNode.next.incrementingTime=currentNode.incrementingTime+currentNode.noteMSlength;
					currentNode.next.quantizedTime=currentNode.quantizedTime+currentNode.noteMSlength;
					newCurrentArray.push(currentNode.next);
				}
				
		}
		else newCurrentArray.push(currentNode);
	}
	
	currentArray=newCurrentArray;

}




function realschedule() {

    var currentTime = context.currentTime;

    currentTime -= startTime;
	//console.log('schedule() called: rhythmIndex:'+rhythmIndex.toString()+' noteTime:'+noteTime.toString()+' currentTime:'+currentTime.toString());
    while (noteTime < currentTime + 0.120) {
		//console.log(' --- inside loop: rhythmIndex:'+rhythmIndex.toString()+'  noteTime:'+noteTime.toString()+' currentTime:'+currentTime.toString());
        // Convert noteTime to context time.
        var contextPlayTime = noteTime + startTime;
        //search through the object.currentview and if any values are about to be done, switch to the new one and playNote it for the right time
        // Kick
        if (theBeat.rhythm1[rhythmIndex] && instrumentActive[0]) {
            playNote(currentKit.kickBuffer, false, 0,0,-2, 0.5, volumes[theBeat.rhythm1[rhythmIndex]] * 1.0, kickPitch, contextPlayTime);
        }

        // Snare
        if (theBeat.rhythm2[rhythmIndex] && instrumentActive[1]) {
            playNote(currentKit.snareBuffer, false, 0,0,-2, 1, volumes[theBeat.rhythm2[rhythmIndex]] * 0.6, snarePitch, contextPlayTime);
        }

        // Hihat
        if (theBeat.rhythm3[rhythmIndex] && instrumentActive[2]) {
            // Pan the hihat according to sequence position.
            playNote(currentKit.hihatBuffer, true, 0.5*rhythmIndex - 4, 0, -1.0, 1, volumes[theBeat.rhythm3[rhythmIndex]] * 0.7, hihatPitch, contextPlayTime);
        }

        // Toms    
        if (theBeat.rhythm4[rhythmIndex] && instrumentActive[3]) {
            playNote(currentKit.tom1, false, 0,0,-2, 1, volumes[theBeat.rhythm4[rhythmIndex]] * 0.6, tom1Pitch, contextPlayTime);
        }

        if (theBeat.rhythm5[rhythmIndex] && instrumentActive[4]) {
            playNote(currentKit.tom2, false, 0,0,-2, 1, volumes[theBeat.rhythm5[rhythmIndex]] * 0.6, tom2Pitch, contextPlayTime);
        }

        if (theBeat.rhythm6[rhythmIndex] && instrumentActive[5]) {
            playNote(currentKit.tom3, false, 0,0,-2, 1, volumes[theBeat.rhythm6[rhythmIndex]] * 0.6, tom3Pitch, contextPlayTime);
        }

        
        // Attempt to synchronize drawing time with sound
        if (noteTime != lastDrawTime) {
            lastDrawTime = noteTime;
            drawPlayhead((rhythmIndex + 15) % 16);
        }

        advanceNote();
    }
}

function playDrum(noteNumber, velocity) {
    switch (noteNumber) {
        case 0x24:
            playNote(currentKit.kickBuffer,  false, 0,0,-2,  0.5, (velocity / 127), kickPitch,  0);
            break;
        case 0x26:
            playNote(currentKit.snareBuffer, false, 0,0,-2,  1,   (velocity / 127), snarePitch, 0);
            break;
        case 0x28:
            playNote(currentKit.hihatBuffer, true,  0,0,-1.0,1,   (velocity / 127), hihatPitch, 0);
            break;
        case 0x2d:
            playNote(currentKit.tom1,        false, 0,0,-2,  1,   (velocity / 127), tom1Pitch,  0);
            break;
        case 0x2f:
            playNote(currentKit.tom2,        false, 0,0,-2,  1,   (velocity / 127), tom2Pitch,  0);
            break;
        case 0x32:
            playNote(currentKit.tom3,        false, 0,0,-2,  1,   (velocity / 127), tom3Pitch,  0);
            break;
        default:
            console.log("note:0x" + noteNumber.toString(16) );
    }
}


function tempoIncrease() {
    theBeat.tempo = Math.min(kMaxTempo, theBeat.tempo+4);
    document.getElementById('tempo').innerHTML = theBeat.tempo;
}

function tempoDecrease() {
    theBeat.tempo = Math.max(kMinTempo, theBeat.tempo-4);
    document.getElementById('tempo').innerHTML = theBeat.tempo;
}

function handleSliderMouseDown(event) {
    mouseCapture = event.target.id;

    // calculate offset of mousedown on slider
    var el = event.target;
    if (mouseCapture == 'swing_thumb') {
        var thumbX = 0;    
        do {
            thumbX += el.offsetLeft;
        } while (el = el.offsetParent);

        mouseCaptureOffset = event.pageX - thumbX;
    } else {
        var thumbY = 0;    
        do {
            thumbY += el.offsetTop;
        } while (el = el.offsetParent);

        mouseCaptureOffset = event.pageY - thumbY;
    }
}

function handleSliderDoubleClick(event) {
    var id = event.target.id;
    if (id != 'swing_thumb' && id != 'effect_thumb') {
        mouseCapture = null;
        sliderSetValue(event.target.id, 0.5);
        updateControls();
    }
}

function handleMouseMove(event) {
    if (!mouseCapture) return;
    
    var elThumb = document.getElementById(mouseCapture);
    var elTrack = elThumb.parentNode;

    if (mouseCapture != 'swing_thumb') {
        var thumbH = elThumb.clientHeight;
        var trackH = elTrack.clientHeight;
        var travelH = trackH - thumbH;

        var trackY = 0;
        var el = elTrack;
        do {
            trackY += el.offsetTop;
        } while (el = el.offsetParent);

        var offsetY = Math.max(0, Math.min(travelH, event.pageY - mouseCaptureOffset - trackY));
        var value = 1.0 - offsetY / travelH;
        elThumb.style.top = travelH * (1.0 - value) + 'px';
    } else {
        var thumbW = elThumb.clientWidth;
        var trackW = elTrack.clientWidth;
        var travelW = trackW - thumbW;

        var trackX = 0;
        var el = elTrack;
        do {
            trackX += el.offsetLeft;
        } while (el = el.offsetParent);

        var offsetX = Math.max(0, Math.min(travelW, event.pageX - mouseCaptureOffset - trackX));
        var value = offsetX / travelW;
        elThumb.style.left = travelW * value + 'px';
    }

    sliderSetValue(mouseCapture, value);
}

function handleMouseUp() {
    mouseCapture = null;
}

function sliderSetValue(slider, value) {
    var pitchRate = Math.pow(2.0, 2.0 * (value - 0.5));
    
    switch(slider) {
    case 'effect_thumb':
        // Change the volume of the convolution effect.
        theBeat.effectMix = value;
        setEffectLevel(theBeat);            
        break;
    case 'kick_thumb':
        theBeat.kickPitchVal = value;
        kickPitch = pitchRate;
        break;
    case 'snare_thumb':
        theBeat.snarePitchVal = value;
        snarePitch = pitchRate;
        break;
    case 'hihat_thumb':
        theBeat.hihatPitchVal = value;
        hihatPitch = pitchRate;
        break;
    case 'tom1_thumb':
        theBeat.tom1PitchVal = value;
        tom1Pitch = pitchRate;
        break;
    case 'tom2_thumb':
        theBeat.tom2PitchVal = value;
        tom2Pitch = pitchRate;
        break;
    case 'tom3_thumb':
        theBeat.tom3PitchVal = value;
        tom3Pitch = pitchRate;
        break;
    case 'swing_thumb':
        theBeat.swingFactor = value;
        break; 
    }
}

function sliderSetPosition(slider, value) {
    var elThumb = document.getElementById(slider);
    var elTrack = elThumb.parentNode;

    if (slider == 'swing_thumb') {
        var thumbW = elThumb.clientWidth;
        var trackW = elTrack.clientWidth;
        var travelW = trackW - thumbW;

        elThumb.style.left = travelW * value + 'px';
    } else {
        var thumbH = elThumb.clientHeight;
        var trackH = elTrack.clientHeight;
        var travelH = trackH - thumbH;

        elThumb.style.top = travelH * (1.0 - value) + 'px';
    }
}

function handleButtonMouseDown(event) {
    var notes = theBeat.rhythm1;
    
    var instrumentIndex;
    var rhythmIndex;

    var elId = event.target.id;
    rhythmIndex = elId.substr(elId.indexOf('_') + 1, 2);
    instrumentIndex = instruments.indexOf(elId.substr(0, elId.indexOf('_')));
        
    switch (instrumentIndex) {
        case 0: notes = theBeat.rhythm1; break;
        case 1: notes = theBeat.rhythm2; break;
        case 2: notes = theBeat.rhythm3; break;
        case 3: notes = theBeat.rhythm4; break;
        case 4: notes = theBeat.rhythm5; break;
        case 5: notes = theBeat.rhythm6; break;
    }

    notes[rhythmIndex] = (notes[rhythmIndex] + 1) % 3;

    if (instrumentIndex == currentlyActiveInstrument)
        showCorrectNote( rhythmIndex, notes[rhythmIndex] );

    drawNote(notes[rhythmIndex], rhythmIndex, instrumentIndex);

    var note = notes[rhythmIndex];
    
    if (note) {
        switch(instrumentIndex) {
        case 0:  // Kick
          playNote(currentKit.kickBuffer, false, 0,0,-2, 0.5 * theBeat.effectMix, volumes[note] * 1.0, kickPitch, 0);
          break;

        case 1:  // Snare
          playNote(currentKit.snareBuffer, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, snarePitch, 0);
          break;

        case 2:  // Hihat
          // Pan the hihat according to sequence position.
          playNote(currentKit.hihatBuffer, true, 0.5*rhythmIndex - 4, 0, -1.0, theBeat.effectMix, volumes[note] * 0.7, hihatPitch, 0);
          break;

        case 3:  // Tom 1   
          playNote(currentKit.tom1, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, tom1Pitch, 0);
          break;

        case 4:  // Tom 2   
          playNote(currentKit.tom2, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, tom2Pitch, 0);
          break;

        case 5:  // Tom 3   
          playNote(currentKit.tom3, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, tom3Pitch, 0);
          break;
        }
    }
}

function handleKitComboMouseDown(event) {
    document.getElementById('kitcombo').classList.toggle('active');
}

function handleKitMouseDown(event) {
    var index = kitNamePretty.indexOf(event.target.innerHTML);
    theBeat.kitIndex = index;
    currentKit = kits[index];
    document.getElementById('kitname').innerHTML = kitNamePretty[index];
}

function handleBodyMouseDown(event) {
    var elKitcombo = document.getElementById('kitcombo');
    var elEffectcombo = document.getElementById('effectcombo');

    if (elKitcombo.classList.contains('active') && !isDescendantOfId(event.target, 'kitcombo_container')) {
        elKitcombo.classList.remove('active');
        if (!isDescendantOfId(event.target, 'effectcombo_container')) {
            event.stopPropagation();
        }
    }
    
    if (elEffectcombo.classList.contains('active') && !isDescendantOfId(event.target, 'effectcombo')) {
        elEffectcombo.classList.remove('active');
        if (!isDescendantOfId(event.target, 'kitcombo_container')) {
            event.stopPropagation();
        }
    }    
}

function isDescendantOfId(el, id) {
    if (el.parentElement) {
        if (el.parentElement.id == id) {
            return true;
        } else {
            return isDescendantOfId(el.parentElement, id);
        }
    } else {
        return false;
    }
}

function handleEffectComboMouseDown(event) {
    if (event.target.id != 'effectlist') {
        document.getElementById('effectcombo').classList.toggle('active');
    }
}

function handleEffectMouseDown(event) {
    for (var i = 0; i < impulseResponseInfoList.length; ++i) {
        if (impulseResponseInfoList[i].name == event.target.innerHTML) {

            // Hack - if effect is turned all the way down - turn up effect slider.
            // ... since they just explicitly chose an effect from the list.
            if (theBeat.effectMix == 0)
                theBeat.effectMix = 0.5;

            setEffect(i);
            break;
        }
    }
}

function setEffect(index) {
    if (index > 0 && !impulseResponseList[index].isLoaded()) {
        alert('Sorry, this effect is still loading.  Try again in a few seconds :)');
        return;
    }

    theBeat.effectIndex = index;
    effectDryMix = impulseResponseInfoList[index].dryMix;
    effectWetMix = impulseResponseInfoList[index].wetMix;            
    convolver.buffer = impulseResponseList[index].buffer;

  // Hack - if the effect is meant to be entirely wet (not unprocessed signal)
  // then put the effect level all the way up.
    if (effectDryMix == 0)
        theBeat.effectMix = 1;

    setEffectLevel(theBeat);
    sliderSetValue('effect_thumb', theBeat.effectMix);
    updateControls();

    document.getElementById('effectname').innerHTML = impulseResponseInfoList[index].name;
}

function setEffectLevel() {        
    // Factor in both the preset's effect level and the blending level (effectWetMix) stored in the effect itself.
    effectLevelNode.gain.value = theBeat.effectMix * effectWetMix;
}


function handleDemoMouseDown(event) {
    var loaded = false;
    
    switch(event.target.id) {
        case 'demo1':
            loaded = loadBeat(beatDemo[0]);    
            break;
        case 'demo2':
            loaded = loadBeat(beatDemo[1]);    
            break;
        case 'demo3':
            loaded = loadBeat(beatDemo[2]);    
            break;
        case 'demo4':
            loaded = loadBeat(beatDemo[3]);    
            break;
        case 'demo5':
            loaded = loadBeat(beatDemo[4]);    
            break;
    }
    
    if (loaded)
        handlePlay();
}

function JonshandlePlay(event) {
    //noteTime = 0.0;
    //startTime = context.currentTime + 0.005;
    //schedule();
    //timerWorker.postMessage("start");
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
var contextPlayTime = noteTime + startTime;
var contextPlayTime2 = noteTime + startTime+2;
playNote(currentKit.snareBuffer, false, 0,0,-2, 1, volumes[theBeat.rhythm2[rhythmIndex]] * 0.6, snarePitch, contextPlayTime2);
playNote(currentKit.kickBuffer, false, 0,0,-2, 0.5, volumes[theBeat.rhythm1[rhythmIndex]] * 1.0, kickPitch, contextPlayTime);
contextPlayTime+=1;
playNote(currentKit.kickBuffer, false, 0,0,-2, 0.5, volumes[theBeat.rhythm1[rhythmIndex]] * 1.0, kickPitch, contextPlayTime);
contextPlayTime+=1;
playNote(currentKit.kickBuffer, false, 0,0,-2, 0.5, volumes[theBeat.rhythm1[rhythmIndex]] * 1.0, kickPitch, contextPlayTime);

    document.getElementById('play').classList.add('playing');
    document.getElementById('stop').classList.add('playing');
    if (midiOut) {
        // turn off the play button
        midiOut.send( [0x80, 3, 32] );
        // light up the stop button
        midiOut.send( [0x90, 7, 1] );        
    }
}

function handlePlay(event) {
    noteTime = 0.0;
	context.resume().then(function(){
		startTime = 0;
		
		var firstquantizedTime= 0;
		var firstincrementingTime=0;	


		easybeat_template1=[['k','hh','k','hh'],[2,2,2,2]];
		easybeat_template1b=[['k','hh','k','hh',],[1,1,1,1]];
		
		beat_template1=[['k','hh','k','hh'],[4,6,2,4]];
		beat_template2=[['t1','s','s','t1','t1'],[4,2,2,4,4]];
		beat_template3=[['t2','t3','k','t3'],[2,1,2,1]];
		beat_template4=[['hh','hh','hh','hh'],[1,1,1,1]];
		
		
		beat_template1b=[['k','hh','k','hh',],[3,3,1,2]];
		beat_template2b=[['t1','s','s','t2','t1'],[2,3,3,2,2]];
		beat_template3b=[['t2','t3','t2','t3'],[1,2,3,2]];
	
		
		//
		easylaneArray1=laneCreator(easybeat_template1,10);		
		easylaneArray1b=laneCreator(easybeat_template1b,10);		
		
		
		laneArray1=laneCreator(beat_template1,10);
		laneArray2=laneCreator(beat_template2,6);
		laneArray3=laneCreator(beat_template3,0.6);
		laneArray4=laneCreator(beat_template4,0.6);		
		laneArray1b=laneCreator(beat_template1b,10);
		laneArray2b=laneCreator(beat_template2b,6);
		laneArray3b=laneCreator(beat_template3b,0.6);	

		//wrappedLaneArray1=wrappedlaneCreator(beat_template1,10,1,2);
		
		
		//currentArray.push(laneArray1[0]);
		//currentArray.push(laneArray2[0]);
		//currentArray.push(laneArray3[0]);
		
		// first dim: nodes
		//      second dim: lane
		//      third dim: chair
		// first dim: on-off for master track
		//      second dim: lane
		//      third dim: chair
		//      fourth dim: on/off for chair in lane, in master track
		//
		// master track is full loop... when running through loop, check to see if chair in lane is active, by checking if chr-ln current time is in-between start/end in its index 
		// it can be assumed that there will always be a master track.
		// you are going to collect the nodes from the Allarr.. so collect one from the
		//> Allarr[1][lane][chair]
		    easyAllarr=[
				     [ //[0] lane array
					  [ //[0][0] lane array, lane 0
					   easylaneArray1,easylaneArray1b //[0][0][0] and [0][0][1] lane array, lane 0, chairs 0 and 1... [0][0][0][0] is lane array, lane 0, chair 0, node 0
					  ]	
				     ],
				     [ //[1] timepoint array
					  [ //[1][0] timepoint array, lane 0
					    [[0,16]],[[2,4],[6,8]] //[1][0][0] and [1][0][1] timepoint array, lane 0, chairs 0 and 1... [1][0][0][0] is the first begend of the first chair. [1][0][1][0] and [1][0][1][1] are the first and second windows of second chair. [1][0][1][0][0] is the beginning of the first window of the second chair of the first lane of the timepoint array
					  ]
				     ]
				   ]
				   
		    Allarr=[
				     [ //[0] lane array
					  [ //[0][0] lane array, lane 0
					   laneArray1,laneArray1b //[0][0][0] and [0][0][1] lane array, lane 0, chairs 0 and 1... [0][0][0][0] is lane array, lane 0, chair 0, node 0
					  ],
					  [ //[0][1] lane array, lane 1
					   laneArray2,laneArray2b
					  ],
					  [
					   laneArray3,laneArray3b
					  ],	
					  [
					   laneArray4
					  ]
				     ],
				     [
					  [
					    [[0,2],[4,6],[8,10],[12,14]],[[2,4],[6,8],[10,12],[14,16]]
					  ],
					  [
					    [[0,4],[8,12]],[[0,8]]
					  ],  
					  [
					    [[0,8]],[[8,16]]
					  ],
					  [
						[[0,13]]
					  ]
				     ]
				   ]				   
				   
				   
				   
				   
		for (var ln = 0; ln < Allarr[0].length; ln++) {
			//console.log('adding');

			for (var chr = 0; chr < Allarr[0][ln].length; chr++) {
			  currentArray.push(Allarr[0][ln][chr][0]);
			  Allarr[0][ln][chr].forEach(function (nnode, index) {
				 nnode.lane=ln;
				 nnode.chair=chr;
				 nnode.quantizedTime=firstquantizedTime;
			  });
			}
		}
		
		//tp ln ch wn  be
		//[1][0][1][0][0] is the first value of the first begend of the second chair of the first lane of the timepoint array
		console.log('Allarr[1]:'+Allarr[1].toString());
		console.log('Allarr[1][0]:'+Allarr[1][0].toString());
		console.log('Allarr[1][0][0]:'+Allarr[1][0][0].toString());
		console.log('Allarr[1][0][0][0]:'+Allarr[1][0][0][0].toString());
		console.log('Allarr[1][0][0][0][0]:'+Allarr[1][0][0][0][0].toString());
		
		var timepointset = new Set();
		Allarr[1].forEach(function(lane,lind){
			lane.forEach(function(chair,cind){
				chair.forEach(function(windo,wind){
						timepointset.add(windo[0]);
						timepointset.add(windo[1]);
				});
			});
		});
		
		var timepointArr=Array.from(timepointset).sort(function(a, b){return a - b});
		
		console.log('timepointarray:'+timepointArr.toString());
		

		activeArr.push(timepointArr);
		var subactiveArr=[];
		for (var timepoint=0; timepoint<timepointArr.length; timepoint++){
			lnArr=[];
			for (var ln=0; ln<Allarr[0].length; ln++) {
				chrArr=[];
				for (var chr=0; chr<Allarr[0][ln].length; chr++){
					chrArr.push('n');
				}
				lnArr.push(chrArr);
			}
			subactiveArr.push(lnArr);
		}
		activeArr.push(subactiveArr);
		
		
		console.log('activeArr:'+JSON.stringify(activeArr));
		
//		activeArr.forEach(function(timepoint,tind){
//			output=''
//			timepoint.forEach(function(lane,lind){
//				lane.forEach(function(chair,cind){
//					
//			for (var ln=0; ln<Allarr[1].length; ln++) {
//				for (var chr=0; chr<Allarr[1][1].length; chr++){
//					chrArr.push('n');
//				}
//			}
//		}	
var nuactivarr=[
					[
						0,
						2,
						4,
						6,
						8
					],
					[ //activeArr[1]
						[  //activeArr[1][0]  timepoint
							[ //activeArr[1][0][0] lane
								"n","n" //activeArr[1][0][0][0] and activeArr[1][0][0][1] chair 1 and 2
							]  
						],
						[["n","n"]],
						[["n","n"]],
						[["n","n"]],
						[["n","n"]]
					]
				]

		
		//for (var timepoint=0; timepoint<activeArr[0].length; timepoint++){ //for each timepoint
			for (var lane=0; lane<Allarr[1].length; lane++){
				for (var chair=0; chair<Allarr[1][lane].length; chair++){
					for (var windo=0; windo<Allarr[1][lane][chair].length; windo++){
					//console.log('windo[0]:'+windo[0].toString()+', windo[1]:'+windo[1].toString())
						var windoo=Allarr[1][lane][chair][windo][0];
						var windoi=Allarr[1][lane][chair][windo][1];
						for (var begend=windoo; begend<windoi; begend++){
							console.log('begend:'+begend.toString());
							if (timepointArr.includes(begend)){
								console.log('timepointArr.indexOf(begend):'+timepointArr.indexOf(begend).toString());
								console.log('activeArr[1][timepointArr.indexOf(begend)][lane][chair]:'+activeArr[1][timepointArr.indexOf(begend)][lane][chair].toString());
							activeArr[1][timepointArr.indexOf(begend)][lane][chair]='a';
							}
						};
					};
				};
			};
		
		console.log('activeArr:'+JSON.stringify(activeArr));
		
		masterLane=masterlaneCreator(activeArr);
		currentmasterNode=masterLane[0];
		currentmasterNode.incrementingTime=currentmasterNode.noteMSlength;
		
		realLoopbegtime=firstincrementingTime;
		loopMSlength=loopMSlengthof(Allarr);
		realLoopendtime=firstincrementingTime+loopMSlength;
		//console.log('realLoopendtime='+realLoopendtime.toString());
		quantizedLoopbegtime=firstquantizedTime;		
		quantizedLoopendtime=loopMSlength;
		//console.log('currentArray length is '+currentArray.length.toString());
		//currentArray.forEach(function(val,ind){
		//	console.log('vals are:'+val.drumtext);
		//})
		masterLane.forEach(function(nod,ind){
		console.log('currentmasterNode time is:'+nod.incrementingTime.toString());
		});

		//console.log('firstquantizedTime:'+firstquantizedTime.toString()+', firstincrementingTime:'+firstincrementingTime.toString())
		
		//for(let n of currentArray){
		//	console.log('n in currentArray');
		//	n.quantizedTime=firstquantizedTime;
		//	n.incrementingTime=firstincrementingTime;
		//	console.log('n.quantizedTime:'+n.quantizedTime.toString())
		//	console.log('n.incrementingTime:'+n.incrementingTime.toString())
		//}
		
		//console.log('schedule....');
		schedule();
		//console.log('handlePlay is calling timer worker');
		timerWorker.postMessage("start");

		document.getElementById('play').classList.add('playing');
		document.getElementById('stop').classList.add('playing');
		if (midiOut) {
			// turn off the play button
			midiOut.send( [0x80, 3, 32] );
			// light up the stop button
			midiOut.send( [0x90, 7, 1] );        
		}
	});
}

function handleStop(event) {
    timerWorker.postMessage("stop");
	currentArray=[];
    var elOld = document.getElementById('LED_' + (rhythmIndex + 14) % 16);
    elOld.src = 'images/LED_off.png';

    hideBeat( (rhythmIndex + 14) % 16 );

    rhythmIndex = 0;
	currentArray=[];

    document.getElementById('play').classList.remove('playing');
    document.getElementById('stop').classList.remove('playing');
    if (midiOut) {
        // light up the play button
        midiOut.send( [0x90, 3, 32] );
        // turn off the stop button
        midiOut.send( [0x80, 7, 1] );
    }
}

function handleSave(event) {
    toggleSaveContainer();
    var elTextarea = document.getElementById('save_textarea');
    elTextarea.value = JSON.stringify(theBeat);
}

function handleSaveOk(event) {
    toggleSaveContainer();
}

function handleLoad(event) {
    toggleLoadContainer();
}

function handleLoadOk(event) {
    var elTextarea = document.getElementById('load_textarea');
    theBeat = JSON.parse(elTextarea.value);

    // Set drumkit
    currentKit = kits[theBeat.kitIndex];
    document.getElementById('kitname').innerHTML = kitNamePretty[theBeat.kitIndex];

    // Set effect
    setEffect(theBeat.effectIndex);

    // Change the volume of the convolution effect.
    setEffectLevel(theBeat);

    // Apply values from sliders
    sliderSetValue('effect_thumb', theBeat.effectMix);
    sliderSetValue('kick_thumb', theBeat.kickPitchVal);
    sliderSetValue('snare_thumb', theBeat.snarePitchVal);
    sliderSetValue('hihat_thumb', theBeat.hihatPitchVal);
    sliderSetValue('tom1_thumb', theBeat.tom1PitchVal);
    sliderSetValue('tom2_thumb', theBeat.tom2PitchVal);
    sliderSetValue('tom3_thumb', theBeat.tom3PitchVal);
    sliderSetValue('swing_thumb', theBeat.swingFactor);

    // Clear out the text area post-processing
    elTextarea.value = '';

    toggleLoadContainer();
    updateControls();
}

function handleLoadCancel(event) {
    toggleLoadContainer();
}

function toggleSaveContainer() {
    document.getElementById('pad').classList.toggle('active');
    document.getElementById('params').classList.toggle('active');
    document.getElementById('tools').classList.toggle('active');
    document.getElementById('save_container').classList.toggle('active');
}

function toggleLoadContainer() {
    document.getElementById('pad').classList.toggle('active');
    document.getElementById('params').classList.toggle('active');
    document.getElementById('tools').classList.toggle('active');
    document.getElementById('load_container').classList.toggle('active');
}

function handleReset(event) {
    handleStop();
    loadBeat(beatReset);    
}

function loadBeat(beat) {
    // Check that assets are loaded.
    if (beat != beatReset && !beat.isLoaded())
        return false;

    handleStop();

    theBeat = cloneBeat(beat);
    currentKit = kits[theBeat.kitIndex];
    setEffect(theBeat.effectIndex);

    // apply values from sliders
    sliderSetValue('effect_thumb', theBeat.effectMix);
    sliderSetValue('kick_thumb', theBeat.kickPitchVal);
    sliderSetValue('snare_thumb', theBeat.snarePitchVal);
    sliderSetValue('hihat_thumb', theBeat.hihatPitchVal);
    sliderSetValue('tom1_thumb', theBeat.tom1PitchVal);
    sliderSetValue('tom2_thumb', theBeat.tom2PitchVal);
    sliderSetValue('tom3_thumb', theBeat.tom3PitchVal);
    sliderSetValue('swing_thumb', theBeat.swingFactor);

    updateControls();
    setActiveInstrument(0);

    return true;
}

function updateControls() {
    for (i = 0; i < loopLength; ++i) {
        for (j = 0; j < kNumInstruments; j++) {
            switch (j) {
                case 0: notes = theBeat.rhythm1; break;
                case 1: notes = theBeat.rhythm2; break;
                case 2: notes = theBeat.rhythm3; break;
                case 3: notes = theBeat.rhythm4; break;
                case 4: notes = theBeat.rhythm5; break;
                case 5: notes = theBeat.rhythm6; break;
            }

            drawNote(notes[i], i, j);
        }
    }

    document.getElementById('kitname').innerHTML = kitNamePretty[theBeat.kitIndex];
    document.getElementById('effectname').innerHTML = impulseResponseInfoList[theBeat.effectIndex].name;
    document.getElementById('tempo').innerHTML = theBeat.tempo;
    sliderSetPosition('swing_thumb', theBeat.swingFactor);
    sliderSetPosition('effect_thumb', theBeat.effectMix);
    sliderSetPosition('kick_thumb', theBeat.kickPitchVal);
    sliderSetPosition('snare_thumb', theBeat.snarePitchVal);
    sliderSetPosition('hihat_thumb', theBeat.hihatPitchVal);
    sliderSetPosition('tom1_thumb', theBeat.tom1PitchVal);        
    sliderSetPosition('tom2_thumb', theBeat.tom2PitchVal);
    sliderSetPosition('tom3_thumb', theBeat.tom3PitchVal);
}


function drawNote(draw, xindex, yindex) {    
    var elButton = document.getElementById(instruments[yindex] + '_' + xindex);
    switch (draw) {
        case 0: elButton.src = 'images/button_off.png'; break;
        case 1: elButton.src = 'images/button_half.png'; break;
        case 2: elButton.src = 'images/button_on.png'; break;
    }
}

function drawPlayhead(xindex) {
    var lastIndex = (xindex + 15) % 16;

    var elNew = document.getElementById('LED_' + xindex);
    var elOld = document.getElementById('LED_' + lastIndex);
    
    elNew.src = 'images/LED_on.png';
    elOld.src = 'images/LED_off.png';

    hideBeat( lastIndex );
    showBeat( xindex );
}

function filterFrequencyFromCutoff( cutoff ) {
    var nyquist = 0.5 * context.sampleRate;

    // spreads over a ~ten-octave range, from 20Hz - 20kHz.
    var filterFrequency = Math.pow(2, (11 * cutoff)) * 40;

    if (filterFrequency > nyquist)
        filterFrequency = nyquist;
    return filterFrequency;
}

function setFilterCutoff( cutoff ) {
    if (filterNode)
        filterNode.frequency.value = filterFrequencyFromCutoff( cutoff );
}

function setFilterQ( Q ) {
    if (filterNode)
        filterNode.Q.value = Q;
}
