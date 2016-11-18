define([
    "dojo/_base/declare",  // contains functions to define Dojo classes, which support standard Object Oriented concepts within Dojo.
    "mxui/widget/_WidgetBase", // Super class from which all mendix widgets inherit
    "dijit/_TemplatedMixin", // Takes an html string and returns its dom
    "dojo/dom-attr",// Defines the core dom attributes. functions such as set, get, remove and has
    "dojo/dom-construct",// Defines the core dojo dom construction api
    "dojo/_base/lang",// contains functions for supporting Polymorphism and other language constructs that are fundamental to the rest of the toolkit
    "dojo/number",// contains methods for user presentation of JavaScript Number objects: formatting, parsing, and rounding
    "dojo/_base/array", // enhancements to native array functions which may not be available
    "dojo/text!com/mendix/widget/Ratings/templates/ratings.html"
], function (declare, _WidgetBase, _TemplatedMixin, domAttr, domConstruct, lang, number, dojoArray, widgetTemplate) {
    "use strict";

    return declare("com.mendix.widget.Ratings.ratings", [ _WidgetBase, _TemplatedMixin ], {

        templateString : widgetTemplate,

        divNode : "", // This is picked from the widget template
        attrValues : null,
        hasVoted : true,
        connectArray : null, // This is used to register for events on click of each of the stars and is thus declared as an array
        mouseoverArray : null, // This is used to register for events on mouse over of each of the stars and is thus declared as an array
        root : "", // This is set as the url at which the mendix app is running
        ratingsListEvent : "",
        pathAttr : "", // Used to refer to the attribute that stores the vote
        pathName : "", // Used to refer to the attribute that stores the name of the voter

        standardImage: null, // This refers to the full uncolured star
        mouseoverImage: null, // This refers to the full coloured image
        halfImage: "", // This refers to the half coloured image

        noofstars: 5, // My modification. Added this attribute to refer to the number of stars for looping purposes.
        halfimagevalue: 0.5, // My modification. Added this attribute to refer to the integer value for halfimage
        two: 2, // My modification to cater for the magic number 2

        _contextObj: null, // Internal variable indicating the object within which the widget is placed

        postCreate : function(){
            logger.debug(this.id + ".postCreate");
            this.root = window.mx.appUrl; // Gives us the url the application is running at. mx is the container of the mendix client subsystems

            this.attrValues = [];
            this.connectArray = [];
            this.mouseoverArray = [];
            this.pathAttr = this.voteAttr.split("/");
            this.pathName = this.voteName.split("/");
        },

        showRatings : function(callback){
            logger.debug(this.id + ".showRatings");

            var mxApp = this._contextObj;

            domConstruct.empty(this.divNode);

            var showTotal = 0,
                showCount = 0,
                showVote = 0;

            showTotal = parseInt(mxApp.get(this.ratingsTotal), 10);
            showCount = parseInt(mxApp.get(this.ratingsCount), 10);

            if (showCount === 0) {
                showVote = 1;
            } else if (this.halfImage !== "") {
                showVote = ((showTotal / showCount) * this.two).toFixed() / this.two; // Dont understand why he divides by 2 and then multiplies by 2 again.
            } else {
                showVote = number.round((showTotal / showCount));
            }
            createRatingsList(showVote);


            mendix.lang.nullExec(callback);
        },

        createRatingsList : function(showVote){
            var ratingsList = mxui.dom.create("ul");
            if (this.voteEnabled === true) {
                this.ratingsListEvent = this.connect(ratingsList, "onmouseleave", lang.hitch(this, this.mouseleaveEvent, showVote));
            }

            for (var i = 1; i <= this.noofstars; i++) {
                var imgNode = mxui.dom.create("img",{class: "ratings_image"}); // create(element, propsnullable, …children)
                if (i > showVote) {
                    if (this.halfImage !== "" && (i - showVote === this.halfimagevalue)) {
                        domAttr.set(imgNode, "src", this._getImagePath(this.halfImage));
                    } else {
                        domAttr.set(imgNode, "src", this._getImagePath(this.standardImage));
                    }
                } else {
                    domAttr.set(imgNode, "src", this._getImagePath(this.mouseoverImage));
                }
                var ratingsLi = mxui.dom.create("li", imgNode);
                if (this.voteEnabled === true) {
                    this.mouseoverArray[i-1] = {};  // This is so because on  mouse enter only works upto the fifth
                    this.mouseoverArray[i-1].handle = this.connect(imgNode, "onmouseenter", lang.hitch(this, this.mouseenterEvent, i));
                    this.mouseoverArray[i-1].element = imgNode;
                    this.connectArray[i-1] = this.connect(ratingsLi, "onclick", lang.hitch(this, this.onclickRating, i, mxApp));
                }
                ratingsList.appendChild(ratingsLi); // Just normal JavaScript
            }
            this.divNode.appendChild(ratingsList);
        },

        setMouseOver : function (iterator) {
            logger.debug(this.id + ".setMouseOver", iterator);

            for (var j = 0; j <= iterator; j++) {
                this.mouseoverArray[j].element.src = this._getImagePath(this.mouseoverImage);
            }

            for (var x = 4; x > iterator; x--) {
                if (this.halfImage !== "" && (x - iterator === this.halfimagevalue)) {
                    this.mouseoverArray[x].element.src = this._getImagePath(this.halfImage);
                } else {
                    this.mouseoverArray[x].element.src = this._getImagePath(this.standardImage);
                }
            }
        },

        _getImagePath : function (img) { // Index of returns position of first occurrence of provided word
            return (this.root + (this.root.indexOf("localhost") !== -1 ? "/" : "" ) + img).split("?")[0]; // fix image path and remove cachebust
        },

        onclickRating : function(count, mxApp, event) {
            logger.debug(this.id + ".onclickRating");

            // user can click only once
            this.disconnect(this.ratingsListEvent);
            for (var i = 0; i < this.mouseoverArray.length; i++) {
                this.disconnect(this.mouseoverArray[i].handle);
            }

            this.setMouseOver(count - 1);

            // store the fact that the user has voted
            var currentUserName = mx.session.getUserName();
            var xpathString = "//" + this.pathName[1] + "[" + this.pathName[this.two] + " = '" + currentUserName + "']"+"["+ this.pathName[0] + " = '" + mxApp.getGuid() +  "']";

            mx.data.get({
                xpath    : xpathString,
                callback : lang.hitch(this, this.commitRating, count, mxApp)
            });
        },

        commitRating : function (count, mxApp, mxVote) {
            logger.debug(this.id + ".commitRating");

            var currentTotal = mxApp.get(this.ratingsTotal),
                currentCount = mxApp.get(this.ratingsCount);

            if (mxVote.length === 0) { // user has not voted before
                this.createVote(mx.session.getUserName(), count, mxApp, currentTotal, currentCount);
            } else { // user has voted before, update the vote
                var userVote = mxVote[0].get(this.pathAttr[this.two]),
                    voteDiff = count - userVote;

                mxVote[0].set(this.pathAttr[this.two], count);
                this._saveSequence(mxVote[0]);

                mxApp.set(this.ratingsTotal, (parseInt(currentTotal, 10) + voteDiff));
                this._saveSequence(mxApp);
            }
        },

        createVote : function (user, vote, app, currentTotal, currentCount) {
            logger.debug(this.id + ".createVote");

            mx.data.create({
                entity	: this.pathName[1],
                callback	: lang.hitch(this,
                    function (user, vote, app, currentTotal, currentCount, voteObject) {
                        logger.debug(this.id + ".createVote created");

                        app.addReference(this.pathName[0], voteObject.getGuid());
                        voteObject.set(this.pathName[this.two], user); // Setting the name of the voter.
                        voteObject.set(this.pathAttr[this.two], vote); // Setting the count for the vote

                        app.set(this.ratingsTotal, (parseInt(currentTotal, 10) + vote));
                        app.set(this.ratingsCount, (parseInt(currentCount, 10) + 1));

                        this._saveSequence(app);
                        this._saveSequence(voteObject);
                    },
                    user,
                    vote,
                    app,
                    currentTotal,
                    currentCount
                ),
                context	: null
            });
        },

        _saveSequence: function (obj) {
            logger.debug(this.id + "._saveSequence, type: " + obj.getEntity());
            // mx.data.save({
            //     mxobj: obj,
            //     callback: lang.hitch(this, function () {
            //         logger.debug(this.id + "._saveSequence obj type " + obj.getEntity() + " saved");
            mx.data.commit({
                mxobj: obj,
                callback: lang.hitch(this, function () {
                    logger.debug(this.id + "._saveSequence obj type " + obj.getEntity() + " committed");
                }),
                error: lang.hitch(this, function (err) {
                    logger.error(this.id + "._saveSequence obj type " + obj.getEntity() + " commit error: ", err);
                })
            });
            //     }),
            //     error: lang.hitch(this, function (err) {
            //         logger.error(this.id + "._saveSequence obj type " + obj.getEntity() + " save error: ", err);
            //     })
            // });
        },

        mouseenterEvent : function(enterIterator, event) {
            logger.debug(this.id + ".mouseenterEvent");
            this.setMouseOver(enterIterator - 1);
        },

        mouseleaveEvent : function(showVote, event) {
            logger.debug(this.id + ".mouseleaveEvent", showVote);
            this.setMouseOver(showVote - 1);
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            if (obj) {
                this._contextObj = obj;
                this.showRatings(callback);
            } else {
                console.warm(this.id + ".update received empty context");
                mendix.lang.nullExec(callback);
            }
        },

        uninitialize : function(){
            logger.debug(this.id + ".uninitialize");
            dojoArray.forEach(this.connectArray, this.disconnect);
            for (var i = 0; i < this.mouseoverArray.length; i++) {
                this.disconnect(this.mouseoverArray[i].handle);
            }
        }
    });
});

require(["com/mendix/widget/Ratings/ratings"]);
