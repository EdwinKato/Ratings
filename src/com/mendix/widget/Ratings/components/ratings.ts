import { Component, DOM, Props, createElement } from "react";

export interface RatingProps extends Props<Ratings> {
    showVote?: number;
    rate?: number;
    microflowProps?: OnClickProps;
    Count?: number;
    object: mendix.lib.MxObject;
    vote?: number;
    currentTotal?: number;
    currentCount?: number;
    voteObject?: any[];
    mouseoverArray?: [];
    attributeValues?: [];
    connectArray?: [];
    widgetId: string;

    voteEnabled?: boolean;
    ratingsTotal?: number;
    ratingsCount?: number;
    standardImage?: string;
    mouseoverImage: string;
    halfImage?: string;
    voteName?: string;
    voteAttribute?: string;
}

interface RatingState {
    hasVoted?: boolean;
    voteEnabled?: boolean;
}

export interface OnClickProps {
    xpath: string;
    guid: string;
}

export class Ratings extends Component<RatingProps, RatingState> {

    private pathAttribute = this.props.voteAttribute.split("/");
    private pathName = this.props.voteName.split("/");

    private constructor(props: RatingProps) {
        super(props);

        this.state = {
            hasVoted: true
        };
    }

    private mouseEnterEvent(count: number) {
        this.setMouseOver(count - 1);
    }

    private mouseleaveEvent(showVote: number) {
        this.setMouseOver(showVote - 1);
    }

    private commitRating(count: number, object: any, mxVote: any) {
        let currentTotal = object.get(this.props.ratingsTotal);
        let currentCount = object.get(this.props.ratingsCount);

        if (mxVote.length === 0) { // user has not voted before
            this.createVote(mx.session.getUserName(), count, object, currentTotal, currentCount);
        } else { // user has voted before, update the vote
            let userVote = mxVote[0].get(this.pathAttribute[2]);
            let voteDifference = count - userVote;

            mxVote[0].set(this.pathAttribute[2], count);
            this.saveSequence(mxVote[0]);

            object.set(this.props.ratingsTotal, (parseInt(currentTotal, 10) + voteDifference));
            this.saveSequence(object);
        }
    }

    private createVote(user: any, vote: number, voteObject: any, currentTotal: string, currentCount: string) {
        mx.data.create({
            entity: this.pathName[1],
            callback: lang.hitch(this, () => {

                voteObject.addReference(this.pathName[0], voteObject.getGuid());
                voteObject.set(this.pathName[2], user); // Setting the name of the voter.
                voteObject.set(this.pathAttribute[2], vote); // Setting the count for the vote

                voteObject.set(this.props.ratingsTotal, (parseInt(currentTotal, 10) + vote));
                voteObject.set(this.props.ratingsCount, (parseInt(currentCount, 10) + 1));

                this.saveSequence(voteObject);
            },
                user,
                vote,
                voteObject,
                currentTotal,
                currentCount
            ),
            context: null
        });
    }

    private setMouseOver(iterator: number) {

        for (let j = 0; j <= iterator; j++) {
            this.props.mouseoverArray[j].element.src = this.getImagePath(mouseoverImage);
        }

        for (let x = 4; x > iterator; x--) {
            if (this.props.halfImage !== "" && (x - iterator === this.halfimagevalue)) {
                this.props.mouseoverArray[x].element.src = this.getImagePath(this.props.halfImage);
            } else {
                this.props.mouseoverArray[x].element.src = this.getImagePath(this.props.standardImage);
            }
        }
    }

    private showRatings(callback: Function) {

        let showTotal: number;
        let showCount: number;
        let showVote: number;

        showTotal = Math.round(parseInt(this.contextObject.get(this.props.ratingsTotal) as string, 10));
        showCount = Math.round(parseInt(this.contextObject.get(this.props.ratingsCount) as string, 10));

        if (showCount === 0) {
            showVote = 1;
        } else if (this.props.halfImage !== "") {
            // showVote = ((showTotal / showCount) * this.two).toFixed() / this.two;
        } else {
            showVote = Math.round((showTotal / showCount));
        }
        this.createRatingsList(showVote, this.props.object);

        if (callback) { callback(); }
    }

    private createRatingsList(showVote: number, object: any) {
        let ratingsList = DOM.ul(); // mxui.dom.create("ul"); 
        if (this.props.voteEnabled === true) {
            /*
            this.ratingsListEvent = this.connect(ratingsList, "onmouseleave",
            lang.hitch(this, this.mouseleaveEvent, showVote)); bind here */
        }
        const noofstars: 5;
        const halfimagevalue: 0.5;

        for (let i = 1; i <= noofstars; i++) {
            let imgNode = DOM.img({ className: "ratings_image" });
            if (i > showVote) {
                if (this.props.halfImage !== "" && (i - showVote === halfimagevalue)) {
                    DOM.fieldset(HTMLImageElement, "src", this.getImagePath(this.props.halfImage));
                    // domAttr.set(imgNode, "src", this.getImagePath(this.props.halfImage));
                } else {
                    DOM.fieldset(HTMLImageElement, "src", this.getImagePath(this.props.standardImage));
                    // domAttr.set(imgNode, "src", this.getImagePath(this.props.standardImage));
                }
            } else {
                DOM.fieldset(HTMLImageElement, "src", this.getImagePath(this.props.standardImage));
                domAttr.set(imgNode, "src", this.getImagePath(this.props.mouseoverImage));
            }
            let ratingsLi = mxui.dom.create("li", imgNode);
            if (this.props.voteEnabled === true) {
                this.props.mouseoverArray[i - 1] = {};
                this.props.mouseoverArray[i - 1].handle = this.connect(imgNode,
                    "onmouseenter", lang.hitch(this, mouseenterEvent(), i));
                this.props.mouseoverArray[i - 1].element = imgNode;
                this.props.connectArray[i - 1] = this.connect(ratingsLi, "onclick",
                    lang.hitch(this, this.onclickRating, i, this.contextObject));
            }
            ratingsList.appendChild(ratingsLi);
        }
        this.divNode.appendChild(ratingsList);
    }

    private getImagePath(img: string) {
        return (this.root + (this.root.indexOf("localhost") !== -1 ? "/" : "") + img).split("?")[0];
        // fix image path and remove cachebust
    }

    private saveSequence(object: any | number | string) {
        // logger.debug(this.id + "._saveSequence, type: " + object.getEntity());
        // mx.data.save({
        //     mxobj: obj,
        //     callback: lang.hitch(this, function () {
        //         logger.debug(this.id + "._saveSequence obj type " + obj.getEntity() + " saved");
        mx.data.commit({
            mxobj: object,
            callback: lang.hitch(this, function () {
                logger.debug(this.id + "._saveSequence obj type " + object.getEntity() + " committed");
            }),
            error: lang.hitch(this, (err)  {
                logger.error(this.props.widgetId + "._saveSequence obj type " + object.getEntity() + " commit error: ", err);
            })
        });
    }

    private onclickRating(count: number, object: null | any) {
        // user can click only once
        // this.disconnect(this.ratingsListEvent);
        for (let i = 0; i < this.props.mouseoverArray.length; i++) {
            // this.unsubscribe( this.props.mouseoverArray[i]);
        }
        this.setMouseOver(count - 1);

        // store the fact that the user has voted
        let currentUserName = mx.session.getUserName();
        let xpathString = "//" + this.pathName[1] + "[" + this.pathName[2] + " = '" + currentUserName + "']"
            + "[" + this.pathName[0] + " = '" + object.getGuid() + "']";

        mx.data.get({
            xpath: xpathString,
            callback: lang.hitch(this, this.commitRating, count, object)
        });
    }
}
