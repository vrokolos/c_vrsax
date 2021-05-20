import * as Tone from 'tone'
import { debounce } from 'ts-debounce';
export class VrSax {
    lastKey = null;
    keys = {};
    currentNote = null;
    prevNote = null;
    prevVal = 0;
    reset = true;
    interval = null;
    mode = 0;

    async setMode(mode: number) {
        this.stop();
        this.mode = mode;
        this.reset = true;
        if (mode == 1) {
            if (this.mic == null) {
                this.mic =  new Tone.UserMedia();
                await this.mic.open();
                await this.mic.connect(this.meter);
            }

            this.interval = setInterval(() => this.checkVol(), 10);
            this.debouncedRefresh = debounce(this.refreshkeys, 1);
        } else {
            clearInterval(this.interval);
            this.debouncedRefresh = debounce(this.refreshkeys, 100);
        }
    }

    noteMap = {
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
    }
    sampler = new Tone.Sampler({
        urls: { "C4": "C4.wav" },
        baseUrl: "./",
    }).toDestination();

    constructor() {
        window.onkeydown = (e) => vrsax.keyDown(e.key);
        window.onkeyup = (e) => vrsax.keyUp(e.key);
        this.init();
    }

    async init() {
        await Tone.start();
        await Tone.loaded();
    }

    play() {
        if (this.mode == 0) {
            this.sampler.triggerAttack(this.currentNote, Tone.now());
        } else {
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
        } else if (this.prevNote != this.currentNote || this.reset) {
            this.play();
            this.reset = false;
        }
        document.getElementById('status').innerHTML = val.toString();
        this.prevVal = val as number;
    }

    meter = new Tone.Meter();
    mic = null;
    synth = new Tone.Synth().toDestination();
    refreshkeys() {
        let keystr = Object.keys(this.keys).sort((a, b) => a.localeCompare(b)).join("");
        this.currentNote = this.noteMap[keystr] ?? null;
        document.getElementById('keys').innerHTML = this.currentNote + " => " + keystr;
        if (this.mode == 0) {
            if (this.currentNote == null) {
                this.stop();
            } else {
                this.play();
            }
        }
    }

    debouncedRefresh = debounce(this.refreshkeys, 100);

    keyDown(key: string) {
        if (this.lastKey != key) {
            this.lastKey = key;
            this.keys[key.replace("Escape", "!").replace("Space", " ")] = true;
            this.debouncedRefresh();
        }
    }

    keyUp(key: string) {
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
    } else {
        vrsax.setMode(0);
        btn.innerHTML = "Always";
    }
}
