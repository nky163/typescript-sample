"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    constructor(eventName, data) {
        this.eventName = eventName;
        this.data = data;
    }
}
exports.DomainEvent = DomainEvent;
