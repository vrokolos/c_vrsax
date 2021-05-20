import * as Tone from 'tone'
import { debounce } from 'ts-debounce';
export class VrSax {
    lastKey = null;
    keys = {};
    currentNote = null;
    prevNote = null;
    prevVal = 0;
    reset = true;
    noteMap = {
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
    }
    sampler = new Tone.Sampler({
        urls: { "C5": "C4.wav" },
        baseUrl: "./",
    }).toDestination();

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
        } else if (this.prevNote != this.currentNote || this.reset) {
            this.play();
            this.reset = false;
        }
        document.getElementById('status').innerHTML = val.toString();
        this.prevVal = val as number;
    }

    meter = new Tone.Meter();
    mic = new Tone.UserMedia();
    synth = new Tone.Synth().toDestination();
    refreshkeys() {
        let keystr = Object.keys(this.keys).sort((a, b) => a.localeCompare(b)).join("");
        this.currentNote = this.noteMap[keystr] ?? null;
        document.getElementById('keys').innerHTML = this.currentNote + " => " + keystr;
    }

    debouncedRefresh = debounce(this.refreshkeys, 1);

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

window.onkeydown = (e) => vrsax.keyDown(e.key);
window.onkeyup = (e) => vrsax.keyUp(e.key);
window["vrsax"] = vrsax;
document.getElementById('start').onclick = () => vrsax.init();
vrsax.init();

