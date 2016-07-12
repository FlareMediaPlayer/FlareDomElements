'use strict';
/**
 * Visit www.flaremediaplayer.com
 * A light weight library for easier interfacing with dom objects in order to build
 * interfaces from one single script.
 * WARNING This version is still experimental!
 * Visit the git repository to submit bugs
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


module.exports.Basic = FlareDomElement;
module.exports.BasicNs = FlareDomElementNs;
module.exports.HorizontalSlider = FlareHorizontalSlider;
module.exports.VerticalSlider = FlareVerticalSlider;

