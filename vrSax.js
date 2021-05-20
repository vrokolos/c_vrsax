import * as Tone from 'tone';
import { debounce } from 'ts-debounce';
export class VrSax {
    constructor() {
        this.lastKey = null;
        this.keys = {};
        this.currentNote = null;
        this.prevNote = null;
        this.prevVal = 0;
        this.reset = true;
        this.interval = null;
        this.mode = 0;
        this.noteMap = {
            ",benrvw": "c3",
            ",6benrvw": "c#3",
            "benrvw": "d3",
            "bemnrvw": "d#3",
            "bervw": "e3",
            "ervw": "f3",
            "berw": "f#3",
            "erw": "g3",
            "ertw": "g#3",
            "ew": "a3",
            " ew": "a#3",
            "w": "b3",
            "e": "c4",
            "": "c#4",
            "!benrvw": "d4",
            "!bemnrvw": "d#4",
            "!bervw": "e4",
            "!ervw": "f4",
            "!berw": "f#4",
            "!erw": "g4",
            "!ertw": "g#4",
            "!ew": "a4",
            " !ew": "a#4",
            "!w": "b4",
            "!e": "c5",
            "!": "c#5",
        };
        this.sampler = new Tone.Sampler({
            urls: { "C4": "C4.wav" },
            baseUrl: "./",
        }).toDestination();
        this.meter = new Tone.Meter();
        this.mic = null;
        this.synth = new Tone.Synth().toDestination();
        this.debouncedRefresh = debounce(this.refreshkeys, 100);
        window.onkeydown = (e) => vrsax.keyDown(e.key);
        window.onkeyup = (e) => vrsax.keyUp(e.key);
        this.init();
    }
    async setMode(mode) {
        this.stop();
        this.mode = mode;
        this.reset = true;
        if (mode == 1) {
            if (this.mic == null) {
                this.mic = new Tone.UserMedia();
                await this.mic.open();
                await this.mic.connect(this.meter);
            }
            this.interval = setInterval(() => this.checkVol(), 10);
            this.debouncedRefresh = debounce(this.refreshkeys, 1);
        }
        else {
            clearInterval(this.interval);
            this.debouncedRefresh = debounce(this.refreshkeys, 100);
        }
    }
    async init() {
        await Tone.start();
        await Tone.loaded();
    }
    play() {
        if (this.mode == 0) {
            this.sampler.triggerAttack(this.currentNote, Tone.now());
        }
        else {
            this.synth.triggerAttack(this.currentNote, Tone.now());
        }
        this.prevNote = this.currentNote;
        document.getElementById('pressed').innerHTML = this.currentNote;
    }
    stop() {
        this.synth.triggerRelease(Tone.now());
        this.sampler.triggerRelease(Tone.now());
        document.getElementById('pressed').innerHTML = "off";
    }
    checkVol() {
        var val = this.meter.getValue();
        if (val < -15) {
            this.stop();
            this.reset = true;
        }
        else if (this.prevNote != this.currentNote || this.reset) {
            this.play();
            this.reset = false;
        }
        document.getElementById('status').innerHTML = val.toString();
        this.prevVal = val;
    }
    refreshkeys() {
        var _a;
        let keystr = Object.keys(this.keys).sort((a, b) => a.localeCompare(b)).join("");
        this.currentNote = (_a = this.noteMap[keystr]) !== null && _a !== void 0 ? _a : null;
        if (this.mode == 0) {
            if (this.currentNote == null) {
                this.stop();
            }
            else {
                this.play();
            }
        }
    }
    keyDown(key) {
        if (this.lastKey != key) {
            this.lastKey = key;
            this.keys[key.replace("Escape", "!").replace("Space", " ")] = true;
            this.debouncedRefresh();
        }
    }
    keyUp(key) {
        this.lastKey = null;
        delete this.keys[key.replace("Escape", "!").replace("Space", " ")];
        this.debouncedRefresh();
    }
}
var vrsax = new VrSax();
let btn = document.getElementById('mode');
btn.onclick = () => {
    if (vrsax.mode == 0) {
        vrsax.setMode(1);
        btn.innerHTML = "Mic";
    }
    else {
        vrsax.setMode(0);
        btn.innerHTML = "Always";
    }
};
