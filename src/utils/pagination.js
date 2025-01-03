"use strict";

function isUndefined(value) {
  return value === void 0;
}

export function Pagination(options) {
  this.validateOptions(options);

  // required properties
  this.currentPage = options.currentPage;
  this.count = options.count;
  this.limit = options.limit;

  // default properties
  this.firstPage = isUndefined(options.firstPage) ? 1 : options.firstPage;
  this.rangeLength = options.rangeLength || 5;
  this.firstLabel = options.firstLabel || "«";
  this.previousLabel = options.previousLabel || "‹";
  this.nextLabel = options.nextLabel || "›";
  this.lastLabel = options.lastLabel || "»";

  // processed properties
  this.offset = this.getOffset();
  this.totalPages = this.getTotal();
  this.lastPage = this.firstPage + this.totalPages - 1;
  this.nextPage = this.getNext();
  this.previousPage = this.getPrevious();
  this.rangeStart = this.getRangeStart();
  this.rangeEnd = this.getRangeEnd();
  this.range = this.getRange();
}

Pagination.prototype.validateOptions = function (options) {
  if (!options) {
    throw new Error("No `options` were passed, aborting.");
  }

  if (isUndefined(options.currentPage) || !options.count || !options.limit) {
    throw new Error("You must define your options object correctly, aborting.");
  }

  if (
    isNaN(options.currentPage) ||
    isNaN(options.count) ||
    isNaN(options.limit)
  ) {
    throw new Error(
      "Your options object properties should be numbers, aborting."
    );
  }
};

Pagination.prototype.getOffset = function () {
  return Math.floor(this.rangeLength / 2);
};

Pagination.prototype.getTotal = function () {
  return Math.ceil(this.count / this.limit);
};

Pagination.prototype.getNext = function () {
  var next = this.currentPage + 1;
  return next > this.lastPage ? null : next;
};

Pagination.prototype.getPrevious = function () {
  var previous = this.currentPage - 1;
  return previous < this.firstPage ? null : previous;
};

Pagination.prototype.getRangeStart = function () {
  var rangeStart;

  rangeStart = this.currentPage - this.offset;
  rangeStart =
    this.lastPage < rangeStart + this.rangeLength
      ? this.lastPage - this.rangeLength + 1
      : rangeStart;
  rangeStart = rangeStart < this.firstPage ? this.firstPage : rangeStart;

  return rangeStart;
};

Pagination.prototype.getRangeEnd = function () {
  var rangeEnd;

  rangeEnd = this.currentPage + this.offset;
  rangeEnd = rangeEnd < this.rangeLength ? this.rangeLength : rangeEnd;
  rangeEnd = rangeEnd > this.lastPage ? this.lastPage : rangeEnd;

  return rangeEnd;
};

Pagination.prototype.getRange = function () {
  var range = [];
  var i = this.rangeStart;
  var t = this.rangeEnd;

  range.push({
    page: this.previousPage || undefined,
    isPrevious: true,
    label: this.previousLabel,
    isDisabled: this.previousPage === null,
  });

  if (
    this.firstPage !== this.currentPage &&
    this.firstPage !== this.rangeStart
  ) {
    range.push({ page: this.firstPage, isFirst: true, label: this.firstLabel });
  }

  if (this.firstPage < this.rangeStart - 1) {
    range.push({ isEllipsis: true, label: "leftEllipsis" });
  }

  for (i; i <= t; i++) {
    var item = { page: i };

    if (i === this.currentPage) {
      item.isCurrent = true;
    }

    range.push(item);
  }

  if (this.lastPage > this.rangeEnd + 1) {
    range.push({ isEllipsis: true, label: "rightEllipsis" });
  }

  if (this.lastPage !== this.currentPage && this.lastPage !== this.rangeEnd) {
    range.push({ page: this.lastPage, isLast: true, label: this.lastLabel });
  }

  range.push({
    page: this.nextPage || undefined,
    isNext: true,
    label: this.nextLabel,
    isDisabled: this.nextPage === null,
  });

  return range;
};
