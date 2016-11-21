import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import {createElement} from "react";
import {render} from "react-dom";

import {Ratings as RatingsComponent} from "./components/ratings";

class Ratings extends WidgetBase {

    // Parameters configured from modeler
    private voteAttr : string;
    private voteName : string;
    private voteEnabled : boolean;
    private ratingsTotal : string;
    private ratingsCount : string;
    private standardImage : string;
    private mouseoverImage : string;
    private halfImage : string;

    // Internal variables
    private contextObject : mendix.lib.MxObject;

    postCreate() {
        this.updateRendering();
    }

    update(object : mendix.lib.MxObject, callback : Function) {
        this.contextObject = object;
        this.resetSubscriptions();
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    private updateRendering() {
        let voteCount = (this.contextObject)
            ? parseInt(this.contextObject.get(this.ratingsCount)as string, 10)
            : 0;
        let voteTotal = (this.contextObject)
            ? parseInt(this.contextObject.get(this.ratingsTotal)as string, 10)
            : 0;

        render(createElement(RatingsComponent, {
            appUrl: window.mx.appUrl,
            count: voteCount,
            fullStar: this.mouseoverImage,
            grayedOutStar: this.standardImage,
            halfStar: this.halfImage,
            total: voteTotal,
            voteEnabled: this.voteEnabled
        }), this.domNode);
    }

    private resetSubscriptions() {
        this.unsubscribeAll();
        if (this.contextObject) {
            this.subscribe({
                attr: this.voteAttr,
                callback: () => this.updateRendering(),
                guid: this
                    .contextObject
                    .getGuid()
            });
        }
    }
}

dojoDeclare("com.mendix.widget.Ratings.ratings", [WidgetBase], (function (Source : any) {
    let result : any = {};
    for (let i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
}(Ratings)));
