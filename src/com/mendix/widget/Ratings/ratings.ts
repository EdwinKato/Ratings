import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";
// import * as domAttr from "dojo/dom-attr";

import { Ratings as RatingsComponent } from "./components/Ratings";

class Ratings extends WidgetBase {

    // Parameters configured from modeler
    private attrValues: any[];
    private voteAttr: string;
    private voteName: string;

    private voteEnabled: boolean;
    private ratingsTotal: string;
    private ratingsCount: string;
    private standardImage: string;
    private mouseoverImage: string;
    private halfImage: string;

    private standardImage: null;
    private mouseoverImage: null;

    // Internal letiables
    private contextObject: mendix.lib.MxObject;
    private value: number;

    postCreate() {
        this.value = 0;
        this.updateRendering();
        this.mouseoverArray = [];
    }

    update(object: mendix.lib.MxObject, callback: Function) {
        this.contextObject = object;
        this.resetSubscriptions();
        this.updateRendering();
    }

    private updateRendering() {
        //
    }

    private resetSubscriptions() {
        this.unsubscribeAll();
        if (this.contextObject) {
            this.subscribe({
                attr: this.voteAttr,
                callback: () => this.updateRendering(),
                guid: this.contextObject.getGuid()
            });
        }
    }
}

dojoDeclare(
    "com.mendix.widget.Ratings.ratings", [WidgetBase],
    (function (Source: any) {
        let result: any = {};
        for (let i in Source.prototype) {
            if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
                result[i] = Source.prototype[i];
            }
        }
        return result;
    } (Ratings))
);
