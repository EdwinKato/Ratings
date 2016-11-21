import { DOM } from "react";

export interface OnClickProps {
    microflow: string;
    guid: string;
}

export interface RatingProps {
    total?: number;
    count?: number;
    halfStar?: string;
    fullStar?: string;
    grayedOutStar?: string;
    voteEnabled?: boolean;
    appUrl?: string;
    microflowProps?: OnClickProps;
}

const getImagePath = (image: string, appUrl: string) => {
    return (appUrl + (appUrl.indexOf("localhost") !== -1
        ? "/"
        : "") + image).split("?")[0];
};

const getVoteValue = (voteCount: number, voteTotal: number, halfImage: string) => {
    if (voteCount === 0) {
        return 1;
    } else if (halfImage !== "") {
        return (voteTotal / voteCount);
    }

    return Math.round((voteTotal / voteCount));
};

const RatingList = (stars: string[], appUrl: string) => {
    const listItems = stars.map((star, index) => DOM.li({
        key: index
    }, DOM.img({
        className: "ratings_image",
        src: getImagePath(star, appUrl)
    })));
    return (DOM.ul({
        className: ""
    }, listItems));
};

const createRatingsList = (voteValue: number, props: RatingProps) => {
    DOM.ul();
    if (props.voteEnabled === true) {
        // Connect
    }
    let imageArray = new Array();

    for (let i = 1; i <= 5; i++) {
        if (i > voteValue) {
            if (props.halfStar !== "" && (i - voteValue === 0.5)) {
                imageArray.push(props.halfStar);
            } else {
                imageArray.push(props.grayedOutStar);
            }
        } else {
            imageArray.push(props.fullStar);
        }
    }
    return RatingList(imageArray, props.appUrl);
};

export const Ratings = (props: RatingProps) => DOM.div({
    className: "ratings_widget"
}, createRatingsList(getVoteValue(props.count, props.total, props.halfStar), props));
