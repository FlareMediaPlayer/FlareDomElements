'use strict';
/**
 * Class for interfacing with DOM elements and keep track of attributes/classes to add
 */
class FlareDomInterface {

    addClass() {

    }

    addChild(element) {
        this.element.appendChild(element.element);
    }
    
    removeChild(element) {
        this.element.removeChild(element.element);
    }

    setBaseClassName(className) {
        this.baseClassName = className;
    }

    render() {
        //this.element.className = "";
        this.element.classList.add(this.baseClassName + "-" + this.mainClassName);
        for (var key in this.styles) {
            this.element.style.setProperty(key, this.styles[key]);
        }

        for (var key in this.attributes) {
            this.element.setAttribute(key, this.attributes[key]);
        }

    }

    setStyles(styles) {
        this.styles = styles;
    }

    setAttributes(attributes) {
        this.attributes = attributes;
    }

    setContent(content) {
        this.element.innerHTML = content;
    }

    renderStyles(styles) {

        for (var key in styles) {
            this.styles[key] = styles[key];
            this.element.style.setProperty(key, styles[key]);
        }

    }

    renderAttributes(attributes) {

        for (var key in attributes) {
            this.attributes[key] = attributes[key];
            this.element.setAttribute(key, attributes[key]);
        }

    }
    
    removeChildren(){
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }
}
class FlareDomElement extends FlareDomInterface {
    /**
     * 
     * @param {type} tagName type of element to create
     * @returns {nm$_flare-ui-basic-audio-player.FlareDomElement}
     */
    constructor(tagName, mainClassName) {
        super();
        this.state = "0"; //0 ready, 1 buffering, 2 playing, -1 error

        this.tagName = tagName;
        this.mainClassName = mainClassName;
        this.baseClassName = "flare";
        this.element = document.createElement(tagName);
        this.classes = {};
        this.attributes = {};
        this.styles = {};

    }

}

class FlareDomElementNs extends FlareDomInterface {
    constructor(nameSpace, tagName, mainClassName) {
        super();


        this.tagName = tagName;
        this.mainClassName = mainClassName;
        this.baseClassName = "flare";
        this.element = document.createElementNS(nameSpace, tagName);
        this.classes = {};
        this.attributes = {};
        this.styles = {};
    }
}

class FlareDomSlider extends FlareDomElement {

    constructor(tagName, mainClassName) {

        super(tagName, mainClassName);
        this.valueChangedListeners = {};
        //These need to be declared first before binding the handler functions (they count as new functions)
        this.mouseMoveHandler;
        this.mouseUpHandler;


        this.element.onmousedown = this.handleMouseDown.bind(this);
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseUpHandler = this.handleMouseUp.bind(this);

    }

    handleMouseDown(e) {


        this.clickX = e.x;
        this.clickY = e.y;
        this.elementHeight = this.element.offsetHeight;
        this.boundingRect = this.element.getBoundingClientRect();
        this.elementHeight = this.boundingRect.bottom - this.boundingRect.top;
        this.percentValue = 1 - Math.min(1, Math.max(0, (this.clickY - this.boundingRect.top) / this.elementHeight));//(this.clickY - this.boundingRect.top) / this.elementHeight, 1);
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });

        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation();
        return false;

    }

    handleMouseUp(e) {

        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation;
        return false;

    }

    addValueChangedListener(listener) {

        this.valueChangedListeners[listener] = listener;


    }

    dispatchValueChangedEvent(valueData) {

        for (var listener in this.valueChangedListeners) {
            this.valueChangedListeners[listener].call(this, valueData);
        }

    }

}

class FlareVerticalSlider extends FlareDomSlider {

    constructor(tagName, mainClassName) {

        super("div", mainClassName);

        this.clickY = null;

    }

    handleMouseMove(e) {

        var currentY = e.y;

        //Calculate delta y for a vertical slider
        this.percentValue = 1 - Math.min(1, Math.max(0, (currentY - this.boundingRect.top) / this.elementHeight));
        this.dispatchValueChangedEvent({
            percent: this.percentValue
        });


    }
}

class FlareHorizontalSlider extends FlareDomElement {

    constructor(tagName, mainClassName) {

        super(tagName, mainClassName);
        this.clickX = null;
        this.valueChangedListeners = {};
        //These need to be declared first before binding the handler functions (they count as new functions)
        this.mouseMoveHandler;
        this.mouseUpHandler;

        this.clickX = null;


        this.element.onmousedown = this.handleMouseDown.bind(this);

        //
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseUpHandler = this.handleMouseUp.bind(this);

    }

    setRange(minValue, maxValue) {

        this.minValue = minValue;
        this.maxValue = maxValue;
        this.range = maxValue - minValue;

        this.renderAttributes({
            "aria-valuemin": 0,
            "aria-valuemax": maxValue
        });

    }

    handleMouseDown(e) {


        this.clickX = e.x;
        this.clickY = e.y;
        this.elementWidth = this.element.offsetWidth;
        this.boundingRect = this.element.getBoundingClientRect();
        //this.elementHeight = this.boundingRect.bottom - this.boundingRect.top;
        this.percentValue = Math.min(1, Math.max(0, (this.clickX - this.boundingRect.left) / this.elementWidth));//(this.clickY - this.boundingRect.top) / this.elementHeight, 1);
        this.numericalValue = Math.floor(this.percentValue * this.range);
        this.quantizedPercent = this.numericalValue / this.range;
        this.renderAttributes({
            "aria-valuenow": this.numericalValue,
        });
        this.dispatchValueChangedEvent({
            percent: this.percentValue,
            numerical: this.numericalValue,
            quantizedPercent: this.quantizedPercent
        });

        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        console.log("binding");
        e.stopPropagation();
        return false;

    }

    handleMouseMove(e) {

        var currentX = e.x;

        //Calculate delta y for a vertical slider
        this.percentValue = Math.min(1, Math.max(0, (currentX - this.boundingRect.left) / this.elementWidth));
        this.numericalValue = Math.floor(this.percentValue * this.range);
        this.quantizedPercent = this.numericalValue / this.range;
        this.dispatchValueChangedEvent({
            percent: this.percentValue,
            numerical: this.numericalValue,
            quantizedPercent: this.quantizedPercent
        });
        this.renderAttributes({
            "aria-valuenow": this.numericalValue,
        });


    }

    handleMouseUp(e) {

        console.log("mouseup");
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);
        e.stopPropagation;

        var currentX = e.x;

        //Calculate delta y for a vertical slider
        this.percentValue = Math.min(1, Math.max(0, (currentX - this.boundingRect.left) / this.elementWidth));
        this.numericalValue = Math.floor(this.percentValue * this.range);
        this.quantizedPercent = this.numericalValue / this.range;
        this.dispatchValueChangedEvent({
            percent: this.percentValue,
            numerical: this.numericalValue,
            quantizedPercent: this.quantizedPercent,
            type: "mouseup"
        });
        this.renderAttributes({
            "aria-valuenow": this.numericalValue,
        });

        return false;

    }

    addValueChangedListener(listener) {

        this.valueChangedListeners[listener] = listener;


    }

    dispatchValueChangedEvent(valueData) {

        for (var listener in this.valueChangedListeners) {
            this.valueChangedListeners[listener].call(this, valueData);
        }

    }
}

class FlareIcon extends FlareDomElementNs {
    constructor() {
        super("http://www.w3.org/2000/svg", "svg", "icon");
        this.renderAttributes({
        });
    }
}

class FlarePlayIcon extends FlareIcon {
    constructor() {
        super();
        this.renderAttributes({
            viewBox: "0 0 256 256",

        });

        this.playSymbol = new FlareDomElementNs("http://www.w3.org/2000/svg", "polygon");
        this.playSymbol.renderAttributes({
            points: "28.33 20.33 28.33 231.67 231 126 28.33 20.33",
            //fill : "black",

        });
        //this.indent = this.element.appendChild(document.createTextNode("\n"));
        this.addChild(this.playSymbol);
        //this.indent = this.element.appendChild(document.createTextNode("\n"));

    }
}

class FlarePauseIcon extends FlareIcon {
    
    constructor(fill) {
        super();
        this.renderAttributes({
            viewBox: "0 0 256 256",

        });

        this.pauseLeft = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.pauseLeft.renderAttributes({
            d: "M91.61,248.5H59.39a26.06,26.06,0,0,1-26-26v-189a26,26,0,0,1,26-26H91.61a26,26,0,0,1,26,26v189a26.06,26.06,0,0,1-26,26h0Z"
         
        });

        this.pauseRight = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.pauseRight.renderAttributes({
            d: "M196.61,248.5H164.39a26.06,26.06,0,0,1-26-26v-189a26,26,0,0,1,26-26h32.21a26,26,0,0,1,26,26v189a26.06,26.06,0,0,1-26,26h0Z"
     
        });

        this.addChild(this.pauseLeft);
        this.addChild(this.pauseRight);


    }
}

class FlareVolumeIcon extends FlareIcon{
    constructor(fill){
        super();
        
        this.renderAttributes({
            viewBox: "0 0 256 256",

        });
        
        this.vol3 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.vol3.renderAttributes({
            d: "M171.88,204.38A6.92,6.92,0,0,1,167,192.56a99,99,0,0,0,0-139.8A6.92,6.92,0,0,1,176.77,43a112.84,112.84,0,0,1,0,159.38,6.9,6.9,0,0,1-4.89,2h0Z"
         
        });
        
        this.vol2 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.vol2.renderAttributes({
            d: "M153.36,185.87a6.92,6.92,0,0,1-4.89-11.82,72.76,72.76,0,0,0,0-102.8,6.92,6.92,0,1,1,9.79-9.79,86.62,86.62,0,0,1,0,122.37,6.9,6.9,0,0,1-4.89,2h0Z"
         
        });
        
        this.vol1 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.vol1.renderAttributes({
            d: "M133.31,165.83A6.92,6.92,0,0,1,128.42,154a44.31,44.31,0,0,0,0-62.69,6.92,6.92,0,0,1,9.79-9.79,58.15,58.15,0,0,1,0,82.27,6.9,6.9,0,0,1-4.89,2h0Z"
         
        });
        
        this.speaker = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.speaker.renderAttributes({
            d: "M108,187.1a6.9,6.9,0,0,1-4.33-1.52L72,160.2H52.47a6.92,6.92,0,0,1-6.92-6.92V92.05a6.92,6.92,0,0,1,6.92-6.92H72L103.7,59.74A6.92,6.92,0,0,1,115,65.14v115A6.92,6.92,0,0,1,108,187.1h0ZM59.39,146.36h15a6.92,6.92,0,0,1,4.33,1.52l22.35,17.89V79.54L78.73,97.45A6.89,6.89,0,0,1,74.41,99h-15v47.38h0Z"
         
        });
        
        this.mute1 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.mute1.renderAttributes({
            d: "M194,164.15a7,7,0,0,1-4.95-2.05l-59.38-59.38a7,7,0,0,1,9.89-9.89L199,152.21A7,7,0,0,1,194,164.15h0Z",
            opacity : 0
        });
        this.mute2 = new FlareDomElementNs("http://www.w3.org/2000/svg", "path");
        this.mute2.renderAttributes({
            d: "M135,164.56a7,7,0,0,1-5-11.88l58.56-60.2a7,7,0,0,1,10,9.76l-58.56,60.2a7,7,0,0,1-5,2.12h0Z",
            opacity : 0
        });
        
        this.addChild(this.vol3);
        this.addChild(this.vol2);
        this.addChild(this.vol1);
        this.addChild(this.speaker);
        this.addChild(this.mute1);
        this.addChild(this.mute2);
    }
    
    /**
     * 
     * @param {type} volume float between 0 and 1
     */
    setVolume(volume){
     
        var intensity3;
        var intensity2;
        var intensity1;
        var muteIntensity;
        
        if(volume >= 0.67){
            
            intensity3 = (volume - 0.67)/0.33;
            intensity2 = 1;
            intensity1 = 1;
            muteIntensity = 0;
            
        }else if(volume >= 0.34){
            intensity3 = 0;
            intensity2 = (volume - 0.34)/0.33;
            intensity1 = 1;
            muteIntensity = 0;
            
        }else if (volume >0){
            intensity3 = 0;
            intensity2 = 0;
            intensity1 = volume/0.33;
            muteIntensity = 0;
            
        }else{
            intensity3 = 0;
            intensity2 = 0;
            intensity1 = 0;
            muteIntensity = 1;
            
        }
        
        this.vol1.renderAttributes({
            opacity : intensity1
        });
        
        this.vol2.renderAttributes({
            opacity : intensity2
        });
        
        this.vol3.renderAttributes({
            opacity : intensity3
        });
        
        this.mute1.renderAttributes({
            opacity : muteIntensity
        });
        
        this.mute2.renderAttributes({
            opacity : muteIntensity
        });
        
    }
}



module.exports.Basic = FlareDomElement;
module.exports.HorizontalSlider = FlareHorizontalSlider;
module.exports.VerticalSlider = FlareVerticalSlider;
module.exports.FlarePlayIcon = FlarePlayIcon;
module.exports.FlarePauseIcon = FlarePauseIcon;
module.exports.VolumeIcon = FlareVolumeIcon;
