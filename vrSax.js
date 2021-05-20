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
        this.noteMap = {
            ",benrvw": "c4",
            ",6benrvw": "c#4",
            "benrvw": "d4",
            "bemnrvw": "d#4",
            "bervw": "e4",
            "ervw": "f4",
            "berw": "f#4",
            "erw": "g4",
            "ertw": "g#4",
            "ew": "a4",
            " ew": "a#4",
            "w": "b4",
            "e": "c5",
            "": "c#5",
            "!benrvw": "d5",
            "!bemnrvw": "d#5",
            "!bervw": "e5",
            "!ervw": "f5",
            "!berw": "f#5",
            "!erw": "g5",
            "!ertw": "g#4",
            "!ew": "a5",
            " !ew": "a#5",
            "!w": "b5",
            "!e": "c6",
            "!": "c#6",
        };
        this.sampler = new Tone.Sampler({
            urls: { "C5": "C4.wav" },
            baseUrl: "./",
        }).toDestination();
        this.meter = new Tone.Meter();
        this.mic = new Tone.UserMedia();
        this.synth = new Tone.Synth().toDestination();
        this.debouncedRefresh = debounce(this.refreshkeys, 1);
    }
    async init() {
        await Tone.start();
        await Tone.loaded();
        await this.mic.open();
        await this.mic.connect(this.meter);
        setInterval(() => this.checkVol(), 10);
    }
    play() {
        this.synth.triggerAttack(this.currentNote, Tone.now());
        this.prevNote = this.currentNote;
        document.getElementById('pressed').innerHTML = this.currentNote;
    }
    stop() {
        this.synth.triggerRelease(Tone.now());
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
        document.getElementById('keys').innerHTML = this.currentNote + " => " + keystr;
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
window.onkeydown = (e) => vrsax.keyDown(e.key);
window.onkeyup = (e) => vrsax.keyUp(e.key);
window["vrsax"] = vrsax;
document.getElementById('start').onclick = () => vrsax.init();
vrsax.init();
