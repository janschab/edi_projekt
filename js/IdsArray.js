window.IdsArray = Array;
IdsArray.prototype.getCurrent = function() {
    return this[this.currentIndex];
};
IdsArray.prototype.next = function() {
    if (this.currentIndex < this.length - 1) {
        this.currentIndex++
    }
    return this;
};
IdsArray.prototype.isNext = function() {
    return this.currentIndex < this.length - 1;
};
IdsArray.prototype.prev = function() {
    if (this.currentIndex > 0) {
        this.currentIndex--;
    }
    return this;
};
IdsArray.prototype.isPrev = function() {
    return this.currentIndex > 0;
};
IdsArray.prototype.currentIndex = 0;
