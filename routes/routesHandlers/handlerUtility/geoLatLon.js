var express = require('express');
const heartMeasure=6378137;

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

module.exports = class geoLatLon {
    constructor(lon,lat) {
        this.latitude = Number(lat);
        this.longitude = Number(lon);

    }


    get lat(){
        return this.latitude;
    }

    get lon(){
        return this.longitude;
    }

    /**
     * Returns the destination point from 'this' point having travelled the given distance on the
     * given initial bearing (bearing normally varies around path followed).
     *
     * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
     * @param   {number} bearing - Initial bearing in degrees from north.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {geoLatLon} Destination point.
     *
     * @example
     *     var p1 = new geoLatLon(51.4778, -0.0015);
     *     var p2 = p1.destinationPoint(7794, 300.7); // p2.toString(): 51.5135°N, 000.0983°W
     */
    destinationPoint(distance, bearing, radius) {
        radius = (radius === undefined) ? heartMeasure : Number(radius);
        // see http://williams.best.vwh.net/avform.htm#LL

        var δ = Number(distance) / radius; // angular distance in radians
        var θ = Number(bearing).toRadians();

        var φ1 = this.latitude.toRadians();
        var λ1 = this.longitude.toRadians();

        var φ2 = Math.asin( Math.sin(φ1)*Math.cos(δ) +
            Math.cos(φ1)*Math.sin(δ)*Math.cos(θ) );
        var λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
            Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
        λ2 = (λ2+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

        return new geoLatLon(λ2.toDegrees(),φ2.toDegrees());
    };


    /**
     * Returns the distance travelling from 'this' point to destination point along a rhumb line.
     *
     * @param   {geoLatLon} point - Latitude/longitude of destination point.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance in km between this point and destination point (same units as radius).
     *
     * @example
     *     var p1 = new geoLatLon(51.127, 1.338), p2 = new geoLatLon(50.964, 1.853);
     *     var d = p1.distanceTo(p2); // Number(d.toPrecision(4)): 40310
     */
    rhumbDistanceTo(point, radius) {
        if (!(point instanceof geoLatLon)) throw new TypeError('point is not geoLatLon object');
        radius = (radius === undefined) ? heartMeasure : Number(radius);

        // see http://williams.best.vwh.net/avform.htm#Rhumb

        var R = radius;
        var φ1 = this.latitude.toRadians(), φ2 = point.latitude.toRadians();
        var Δφ = φ2 - φ1;
        var Δλ = Math.abs(point.longitude-this.longitude).toRadians();
        // if dLon over 180° take shorter rhumb line across the anti-meridian:
        if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

        // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
        // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
        var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
        var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);

        // distance is pythagoras on 'stretched' Mercator projection
        var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
        var dist = δ * R;

        return dist;
    };

};












